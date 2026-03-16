"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import CourseCard from "@/components/CourseCard";
import { Search, Filter } from "lucide-react";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";



export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (res.ok) setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (course: any) => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (course.price === 0) {
      alert("Free course enrollment logic goes here!");
      return;
    }

    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    const orderRes = await fetch("/api/payments/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course._id }),
    });

    if (!orderRes.ok) {
      if (orderRes.status === 401) {
        alert("Please login to purchase courses.");
        router.push("/login");
      } else {
        const err = await orderRes.json();
        alert(`${err.error}${err.details ? `: ${err.details}` : ""}`);
      }
      return;
    }

    const orderData = await orderRes.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: "INR",
      name: "MathPro",
      description: `Enroll in ${course.title}`,
      order_id: orderData.id,
      handler: async function (response: any) {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            courseId: course._id,
          }),
        });

        if (verifyRes.ok) {
          alert("Payment successful! You are enrolled.");
          router.push("/dashboard");
        } else {
          const verifyData = await verifyRes.json();
          alert(verifyData.error || "Payment verification failed");
        }
      },
      prefill: {
        name: session.user?.name,
        email: session.user?.email,
      },
      theme: { color: "#4F46E5" },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  const filteredCourses = courses.filter((course) => {
    const matchesLevel = filter === "All" || course.level === filter;
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <PageWrapper className="bg-slate-50">
      <div className="bg-white border-b border-slate-200 pb-12 pt-8">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Explore Our Math Programs
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto mb-10"
          >
            From foundation courses for school exams to advanced Olympiad training, we have the right program for every student.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4 justify-center"
          >
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100 border-none text-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
              />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-2xl md:w-auto w-full overflow-x-auto hide-scrollbar">
              {["All", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`px-6 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    filter === lvl 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-16">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Filter className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-medium text-slate-700">No courses found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredCourses.map((course, idx) => (
                <motion.div
                  key={course._id || course.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <CourseCard 
                    id={course._id}
                    title={course.title}
                    description={course.description}
                    level={course.level}
                    duration={course.duration}
                    iconName={course.iconName}
                    price={course.price}
                    onEnroll={() => handleEnroll(course)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}

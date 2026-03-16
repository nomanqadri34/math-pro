"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import MathCanvas from "@/components/MathCanvas";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseCard from "@/components/CourseCard";
import { Brain, Target, Trophy, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: <Brain className="w-6 h-6 text-primary" />,
    title: "AI-Powered Learning",
    description: "Our intelligent math assistant provides step-by-step hints and adapts to your learning pace."
  },
  {
    icon: <Users className="w-6 h-6 text-secondary" />,
    title: "Expert Tutors",
    description: "Learn from top math educators with years of experience in Olympiad and Advanced courses."
  },
  {
    icon: <Target className="w-6 h-6 text-accent" />,
    title: "Interactive Practice",
    description: "Engage with 3D models and dynamic quizzes that make complex concepts easy to grasp."
  },
  {
    icon: <Trophy className="w-6 h-6 text-primary" />,
    title: "Track Progress",
    description: "Earn certificates, track your mastery, and prepare effectively for your school exams."
  }
];

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (res.ok) setCourses(data.slice(0, 3));
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
      // Direct enrollment for free courses
      // In a real app, you'd call an enrollment API
      alert("Free course enrollment logic goes here!");
      return;
    }

    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    // 1. Create Order
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

    // 2. Open Razorpay Checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: "INR",
      name: "MathPro",
      description: `Enroll in ${course.title}`,
      order_id: orderData.id,
      handler: async function (response: any) {
        // 3. Verify Payment
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            courseId: course._id,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          alert("Payment successful! You are enrolled.");
          router.push("/dashboard");
        } else {
          alert(verifyData.error || "Payment verification failed");
        }
      },
      prefill: {
        name: session.user?.name,
        email: session.user?.email,
      },
      theme: {
        color: "#4F46E5",
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      
      {/* 3D Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          <MathCanvas />
          
          <div className="container mx-auto px-4 z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-semibold text-slate-800">New: AI Tutor Now Live!</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight max-w-4xl leading-tight"
            >
              Making Mathematics <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Simple, Smart, and Interactive
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl"
            >
              Join thousands of students enhancing their skills through our value-added 
              school programs and after-school AI-powered support classes.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/courses">
                <Button size="lg" className="w-full sm:w-auto shadow-primary/30 group">
                  Explore Courses
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/assistant">
                <Button variant="glass" size="lg" className="w-full sm:w-auto">
                  Try AI Assistant
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-16 flex items-center justify-center gap-8 text-slate-500 text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>50+ Interactive Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>24/7 AI Support</span>
              </div>
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
        </section>

        {/* Features Section */}
        <section className="py-24 bg-background relative z-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose MathPro?</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">We combine traditional pedagogy with cutting-edge technology to deliver the best learning experience.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Preview Section */}
        <section className="py-24 bg-slate-50 relative z-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Popular Programs</h2>
                <p className="text-slate-600 max-w-xl">Curated courses designed for schools and after-school mastery.</p>
              </div>
              <Link href="/courses">
                <Button variant="outline" className="hidden md:flex">
                  View All Courses
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course, idx) => (
                <motion.div
                  key={course._id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
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
              {courses.length === 0 && (
                 <div className="col-span-full py-12 text-center text-slate-400 italic">
                    Loading awesome courses...
                 </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-center md:hidden">
              <Link href="/courses">
                <Button variant="outline" className="w-full">
                  View All Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-background relative z-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20"
            >
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Excel in Math?</h2>
                <p className="text-primary-100 text-white/80 text-lg mb-10 max-w-2xl mx-auto">
                  Join our platform today to access interactive courses, personalized AI tutoring, and comprehensive learning resources.
                </p>
                <Link href="/login">
                  <Button size="lg" className="bg-white text-primary hover:bg-slate-50 transition-colors shadow-xl text-lg px-10">
                    Get Started for Free
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        
      </main>
  );
}

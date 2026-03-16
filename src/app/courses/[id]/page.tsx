"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { BookOpen, Calculator, FunctionSquare, Infinity as InfinityIcon, Sigma, Clock, BarChart, Layers, Video, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-10 h-10 text-primary" />,
  Calculator: <Calculator className="w-10 h-10 text-secondary" />,
  FunctionSquare: <FunctionSquare className="w-10 h-10 text-accent" />,
  Infinity: <InfinityIcon className="w-10 h-10 text-primary" />,
  Sigma: <Sigma className="w-10 h-10 text-secondary" />,
};

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  // Helper function to extract YouTube ID or format video URL
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    
    // Handle YouTube URLs
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    
    // For direct mp4/webm uploads, use the raw URL
    return url;
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`);
        const data = await res.json();
        if (res.ok) {
          setCourse(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!session) {
      router.push("/login?callbackUrl=/courses/" + id);
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
      const err = await orderRes.json();
      alert(`${err.error}${err.details ? `: ${err.details}` : ""}`);
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

  if (isLoading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading Course Details...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!course) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Course Not Found</h2>
          <Link href="/courses">
            <Button variant="outline">Back to Courses</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="bg-slate-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link href="/courses" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  {iconMap[course.iconName] || <BookOpen className="w-10 h-10 text-primary" />}
                </div>
                <div>
                   <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      course.level === "Beginner" ? "bg-green-100 text-green-700" :
                      course.level === "Intermediate" ? "bg-blue-100 text-blue-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {course.level}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">{course.title}</h1>
                </div>
              </div>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-6 mb-10">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Layers className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{course.modules?.length || 0} Modules</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <BarChart className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{course.level} Level</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                 <div>
                   <p className="text-sm text-slate-500 font-medium mb-1">Course Price</p>
                   <p className="text-3xl font-bold text-slate-900">
                     {course.price === 0 ? "Free" : `₹${course.price}`}
                   </p>
                 </div>
                  <Button 
                    size="lg" 
                    className="px-10 h-14 rounded-2xl text-lg shadow-xl" 
                    onClick={course.isEnrolled ? () => router.push("/dashboard") : handleEnroll}
                    variant={course.isEnrolled ? "outline" : "default"}
                  >
                    {course.isEnrolled ? "Already Enrolled" : (course.price === 0 ? "Enroll Now" : "Buy This Course")}
                  </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10" />
               <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Video className="w-8 h-8 text-white fill-white" />
                  </div>
               </div>
               <div className="absolute bottom-6 left-6 right-6 z-20">
                  <p className="text-white/80 text-sm font-medium mb-1 uppercase tracking-widest">Course Preview</p>
                  <p className="text-white font-bold">Watch introduction video</p>
               </div>
               {/* Mock background pattern */}
               <div className="absolute inset-0 opacity-30 flex items-center justify-center pointer-events-none">
                  <InfinityIcon className="w-64 h-64 text-white" />
               </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Curriculum Section */}
      <div className="container mx-auto px-4 max-w-7xl py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Layers className="w-6 h-6 text-primary" />
              Course Curriculum
            </h2>
            
            <div className="space-y-4">
              {(!course.modules || course.modules.length === 0) ? (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                  <p className="text-slate-500 italic">No modules added yet. This course is still being developed!</p>
                </div>
              ) : (
                course.modules.map((module: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx} 
                    className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary/30 transition-all hover:shadow-md group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                        <span className="text-lg font-bold text-slate-400 group-hover:text-primary transition-colors">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{module.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                          {module.description || "In this module, we explore core concepts and practical applications of the topic."}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4">
                          {course.isEnrolled ? (
                            <>
                              {module.videoUrl && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs h-8 rounded-lg gap-1.5"
                                  onClick={() => setPlayingVideoUrl(module.videoUrl)}
                                >
                                  <Video className="w-3.5 h-3.5" /> Watch Video
                                </Button>
                              )}
                              {module.notesUrl && (
                                <a href={module.notesUrl} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="ghost" className="text-xs h-8 rounded-lg gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
                                    <FileText className="w-3.5 h-3.5" /> Notes
                                  </Button>
                                </a>
                              )}
                              {!module.videoUrl && !module.notesUrl && (
                                <span className="text-xs text-slate-400 italic">Content coming soon</span>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                <Video className="w-4 h-4" />
                                <span>Video Lecture</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                <FileText className="w-4 h-4" />
                                <span>Reading Material</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 self-center">
                        <div className="p-2 rounded-full bg-slate-50 text-slate-300">
                          {course.isEnrolled ? <ChevronRight className="w-5 h-5" /> : <Layers className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
          
          {/* Sidebar / More Info */}
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/10 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6">What you'll learn</h3>
              <ul className="space-y-4">
                {[
                  "Master fundamental mathematics concepts",
                  "Prepare for advanced Olympiad challenges",
                  "Develop critical thinking and logic",
                  "Solve complex problems step-by-step"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChevronRight className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4">Need help?</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Our AI Assistant is available 24/7 to help you with specific questions from this curriculum.
                </p>
                <Link href="/assistant">
                  <Button variant="default" className="w-full bg-white text-slate-900 hover:bg-slate-100">
                    Ask AI Assistant
                  </Button>
                </Link>
              </div>
              <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Modal Overlay */}
      {playingVideoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-10 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <button 
              onClick={() => setPlayingVideoUrl(null)}
              className="absolute top-4 right-4 z-[110] p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            {getEmbedUrl(playingVideoUrl).includes("youtube.com") ? (
              <iframe
                src={getEmbedUrl(playingVideoUrl)}
                title="Video Player"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video 
                src={playingVideoUrl}
                autoPlay 
                controls 
                controlsList="nodownload" 
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
      </svg>
    </div>
  );
}

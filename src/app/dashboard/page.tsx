import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PageWrapper from "@/components/layout/PageWrapper";
import CourseCard from "@/components/CourseCard";
import { Target, Trophy, Clock, Video, User as UserIcon, Star, Award, ChevronRight, Calendar } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/User";
import LiveClass from "@/models/LiveClass";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }

  const role = (session.user as any)?.role || "student";
  
  if (role === "admin") {
    redirect("/admin");
  }

  await connectToDatabase();
  const dbUser = await User.findOne({ email: session.user.email }).populate("enrolledCourses.courseId").populate("mentorId");
  const allCourses = await Course.find({}).sort({ createdAt: -1 });
  const liveClasses = await LiveClass.find({ status: "upcoming" }).sort({ startTime: 1 }).limit(2);

  const enrolled = dbUser?.enrolledCourses || [];
  const enrolledIds = new Set(enrolled.map((e: any) => (e.courseId?._id || e.courseId)?.toString()).filter(Boolean));
  
  const displayCourses = enrolled.length > 0 
    ? enrolled.map((e: any) => e.courseId).filter((c: any) => c) 
    : allCourses.slice(0, 3);
  const title = (enrolled.length > 0 && displayCourses.length > 0) ? "My Enrolled Courses" : "Suggested Programs";

  return (
    <PageWrapper className="bg-slate-50">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back, {session.user?.name}!</h1>
            <p className="text-slate-600 font-medium">Your math journey is progressing well. Keep it up!</p>
          </div>
          <div className="flex gap-4">
             <Link href="/leaderboard">
                <Button variant="outline" className="bg-white rounded-2xl border-slate-200">
                  <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                  View Leaderboard
                </Button>
             </Link>
             <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="leading-tight">
                   <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Your Points</p>
                   <p className="text-lg font-bold text-slate-900">{dbUser?.points || 0}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           {/* Main Content */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Enrolled</p>
                    <h3 className="text-2xl font-bold text-slate-800">{enrolled.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Certificates</p>
                    <h3 className="text-2xl font-bold text-slate-800">2</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Study Hours</p>
                    <h3 className="text-2xl font-bold text-slate-800">12.5</h3>
                  </div>
                </div>
              </div>

              {/* Courses Section */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                  <Link href="/courses" className="text-sm font-bold text-primary hover:underline">Browse All</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayCourses.map((course: any) => (
                     <CourseCard
                       key={course._id.toString()}
                       id={course._id.toString()}
                       title={course.title}
                       description={course.description}
                       level={course.level}
                       duration={course.duration}
                       iconName={course.iconName}
                       isEnrolled={enrolledIds.has(course._id.toString())}
                     />
                  ))}
                  <Link href="/courses" className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-white/50 hover:bg-white hover:border-primary/30 transition-all cursor-pointer group min-h-[250px]">
                    <div className="w-12 h-12 bg-slate-50 group-hover:bg-primary group-hover:text-white transition-colors rounded-full flex items-center justify-center mb-4 text-slate-400 shadow-sm">
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Explore More</h3>
                    <p className="text-sm text-slate-500">Pick up a new math challenge today.</p>
                  </Link>
                </div>
              </div>
           </div>

           {/* Sidebar */}
           <div className="space-y-8">
              
              {/* Live Classes */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                       <Video className="w-5 h-5 text-red-500" />
                       Live Classes
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 </div>
                 
                 <div className="space-y-4">
                    {liveClasses.length > 0 ? liveClasses.map((lc: any) => (
                      <div key={lc._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all">
                         <h4 className="font-bold text-slate-800 mb-1">{lc.title}</h4>
                         <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(lc.startTime).toLocaleDateString()} @ {new Date(lc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                         <Button className="w-full text-xs h-9 rounded-xl">Join Now</Button>
                      </div>
                    )) : (
                      <div className="text-center py-6">
                         <p className="text-sm text-slate-500 italic">No upcoming live classes.</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Mentor Section */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                    <UserIcon className="w-5 h-5 text-primary" />
                    Your Mentor
                 </h3>
                 
                 <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                       <UserIcon className="w-8 h-8 text-white/50" />
                    </div>
                    <div>
                       <h4 className="font-bold">{dbUser?.mentorId?.name || "Assigning..."}</h4>
                       <p className="text-xs text-primary font-bold uppercase tracking-wider">Senior Math Expert</p>
                    </div>
                 </div>
                 
                 <p className="text-sm text-slate-400 mb-6 leading-relaxed relative z-10">
                    Need help with a specific problem? You can message your mentor directy or book a 1-on-1 session.
                 </p>
                 
                 <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white hover:text-slate-900 rounded-2xl transition-all relative z-10">
                    Message Mentor
                 </Button>
              </div>

           </div>
        </div>
      </div>
    </PageWrapper>
  );
}


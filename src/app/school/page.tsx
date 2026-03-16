"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Users, BookOpen, UserPlus } from "lucide-react";

export default function SchoolDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [tab, setTab] = useState<"students" | "courses">("students");
  const [students, setStudents] = useState<any[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "school") {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchSchoolData();
    }
  }, [status, session, router]);

  const fetchSchoolData = async () => {
    try {
      const res = await fetch("/api/school/dashboard");
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students);
        setAssignedCourses(data.courses);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newStudent, role: "student" })
      });
      if (res.ok) {
        setNewStudent({ name: "", email: "", password: "" });
        fetchSchoolData();
        alert("Student account created successfully!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create student.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  if (status === "loading") {
    return (
      <PageWrapper className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-primary pb-24 pt-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]" />
        <div className="container mx-auto px-4 relative z-10 text-white">
          <h1 className="text-3xl font-bold mb-2">School Partner Portal</h1>
          <p className="text-primary-100 opacity-90">Manage your students and access your licensed course catalog.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <nav className="space-y-2">
                <button 
                  onClick={() => setTab("students")}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${tab === "students" ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  My Students
                </button>
                <button 
                  onClick={() => setTab("courses")}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${tab === "courses" ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <BookOpen className="w-5 h-5 flex-shrink-0" />
                  Licensed Courses
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm min-h-[500px]">
              
              {tab === "students" && (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Manage Students</h2>
                      <p className="text-slate-600">Create accounts for your students to grant them automatic access to your courses.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Student Form */}
                    <div className="lg:col-span-1 border border-slate-200 rounded-3xl p-6 bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        New Student
                      </h3>
                      <form onSubmit={handleCreateStudent} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Student Name</label>
                          <input 
                            required 
                            placeholder="e.g. John Doe"
                            value={newStudent.name} 
                            onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                            className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Student Email</label>
                          <input 
                            required 
                            type="email"
                            placeholder="student@school.edu"
                            value={newStudent.email} 
                            onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                            className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Temp Password</label>
                          <input 
                            required 
                            type="password"
                            value={newStudent.password} 
                            onChange={e => setNewStudent({...newStudent, password: e.target.value})}
                            className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <Button type="submit" disabled={isCreating} className="w-full rounded-xl">
                          {isCreating ? "Creating..." : "Create Account"}
                        </Button>
                      </form>
                    </div>

                    {/* Students List */}
                    <div className="lg:col-span-2 space-y-4">
                      {students.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
                          <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="text-slate-500 font-medium">No students added yet.</p>
                        </div>
                      ) : (
                        students.map((student) => (
                          <div key={student._id} className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800">{student.name}</h4>
                                <p className="text-sm text-slate-500">{student.email}</p>
                              </div>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">
                              Active
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {tab === "courses" && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Licensed Course Catalog</h2>
                    <p className="text-slate-600">These courses are available to all students you create.</p>
                  </div>

                  {assignedCourses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl max-w-2xl mx-auto">
                      <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                      <h3 className="text-lg font-bold text-slate-700 mb-2">No Courses Licensed</h3>
                      <p className="text-slate-500">Contact the platform administrator to license math programs for your school.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {assignedCourses.map((course) => (
                        <div key={course._id} className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">
                              {course.level}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">{course.title}</h3>
                          <p className="text-slate-600 text-sm line-clamp-2">{course.description}</p>
                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-medium text-slate-500">
                            <span>{course.duration}</span>
                            <span className="flex items-center gap-1 text-green-600">
                              <div className="w-2 h-2 rounded-full bg-green-500" /> Active License
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

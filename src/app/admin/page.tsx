"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Settings, Users, BookOpen, Layers, X, Video } from "lucide-react";

interface CourseModule {
  title: string;
  description: string;
  videoUrl: string;
  notesUrl: string;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for general UI and loading
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<{index: number, field: string} | null>(null);
  const [tab, setTab] = useState<"courses" | "live" | "students" | "schools">("courses");
  
  // Courses State
  const [courses, setCourses] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    level: "Beginner",
    duration: "",
    iconName: "BookOpen",
    price: 0,
    modules: [] as CourseModule[]
  });

  // Schools State
  const [schools, setSchools] = useState<any[]>([]);
  const [loadingSchool, setLoadingSchool] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: "", email: "", password: "" });
  const [selectedCoursesBySchool, setSelectedCoursesBySchool] = useState<Record<string, string[]>>({});
  
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  
  const [newLiveClass, setNewLiveClass] = useState({
    title: "",
    description: "",
    instructor: "",
    startTime: "",
    duration: "60 mins",
    meetingUrl: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchCourses();
      fetchLiveClasses();
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (res.ok) setCourses(data);
    } catch (error) { console.error(error); }
  };

  const fetchLiveClasses = async () => {
    try {
      const res = await fetch("/api/live-classes");
      const data = await res.json();
      if (res.ok) setLiveClasses(data);
    } catch (error) { console.error(error); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setStudents(data.filter((u: any) => u.role === "student"));
        setAdmins(data.filter((u: any) => u.role === "admin"));
        setSchools(data.filter((u: any) => u.role === "school"));
      }
    } catch (error) { console.error(error); }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const url = editCourseId ? `/api/courses/${editCourseId}` : "/api/courses";
      const method = editCourseId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse)
      });
      if (res.ok) {
        setIsCreating(false);
        setEditCourseId(null);
        setNewCourse({ title: "", description: "", level: "Beginner", duration: "", iconName: "BookOpen", price: 0, modules: [] });
        fetchCourses();
      }
    } catch (error) { console.error(error); }
    finally { setIsSaving(false); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (res.ok) fetchCourses();
    } catch (error) { console.error(error); }
  };

  const startEdit = (course: any) => {
    setNewCourse({
      title: course.title,
      description: course.description,
      level: course.level,
      duration: course.duration,
      iconName: course.iconName || "BookOpen",
      price: course.price || 0,
      modules: course.modules || []
    });
    setEditCourseId(course._id);
    setIsCreating(true);
  };

  const handleAddModule = () => {
    setNewCourse(prev => ({
      ...prev,
      modules: [...(prev.modules || []), { title: "", description: "", videoUrl: "", notesUrl: "" }]
    }));
  };

  const handleRemoveModule = (index: number) => {
    setNewCourse(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const handleModuleChange = (index: number, field: keyof CourseModule, value: string) => {
    setNewCourse(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, field: "videoUrl" | "notesUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex({ index, field });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) handleModuleChange(index, field, data.url);
    } catch (error) { console.error(error); }
    finally { setUploadingIndex(null); }
  };

  const handleCreateLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLiveClass)
      });
      if (res.ok) {
        setNewLiveClass({ title: "", description: "", instructor: "", startTime: "", duration: "60 mins", meetingUrl: "" });
        fetchLiveClasses();
      }
    } catch (error) { console.error(error); }
  };

  const handleAssignMentor = async (studentId: string, mentorId: string) => {
    try {
      const res = await fetch(`/api/users/${studentId}/mentor`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId })
      });
      if (res.ok) fetchUsers();
    } catch (error) { console.error(error); }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSchool(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSchool, role: "school" })
      });
      if (res.ok) {
        setNewSchool({ name: "", email: "", password: "" });
        fetchUsers();
        alert("School account created successfully.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create school.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSchool(false);
    }
  };

  const handleAssignCourseToSchool = async (schoolId: string, courseId: string, action: "assign" | "remove") => {
    try {
      const res = await fetch(`/api/users/${schoolId}/courses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, action })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckboxChange = (schoolId: string, courseId: string, isChecked: boolean) => {
    setSelectedCoursesBySchool(prev => {
      const currentSelected = prev[schoolId] || [];
      if (isChecked) {
        return { ...prev, [schoolId]: [...currentSelected, courseId] };
      } else {
        return { ...prev, [schoolId]: currentSelected.filter(id => id !== courseId) };
      }
    });
  };

  const handleAssignMultipleCourses = async (schoolId: string) => {
    const courseIds = selectedCoursesBySchool[schoolId] || [];
    if (courseIds.length === 0) return;
    
    try {
      const res = await fetch(`/api/users/${schoolId}/courses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseIds, action: "assignMultiple" })
      });
      if (res.ok) {
        fetchUsers();
        setSelectedCoursesBySchool(prev => ({ ...prev, [schoolId]: [] })); // clear selection
        alert("Courses assigned successfully!");
      }
    } catch (error) {
      console.error(error);
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
    <PageWrapper className="bg-slate-50">
      <div className="container mx-auto px-4 max-w-7xl py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              <button 
                onClick={() => setTab("courses")}
                className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${tab === "courses" ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <BookOpen className="w-5 h-5" />
                Manage Courses
              </button>
              <button 
                onClick={() => setTab("live")}
                className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${tab === "live" ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Video className="w-5 h-5" />
                Live Classes
              </button>
              <button 
                onClick={() => setTab("students")}
                className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${tab === "students" ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Users className="w-5 h-5" />
                Mentorship
              </button>
              <button 
                onClick={() => setTab("schools")}
                className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${tab === "schools" ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <BookOpen className="w-5 h-5 flex-shrink-0" />
                Schools & B2B
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 font-medium rounded-xl transition-colors">
                <Settings className="w-5 h-5 flex-shrink-0" />
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm mb-6">
            
            {/* TAB: COURSES */}
            {tab === "courses" && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Course Management</h1>
                    <p className="text-slate-600 text-sm">Create, update, and manage math courses.</p>
                  </div>
                  <Button onClick={() => {
                    if (isCreating) {
                      setIsCreating(false);
                      setEditCourseId(null);
                      setNewCourse({ title: "", description: "", level: "Beginner", duration: "", iconName: "BookOpen", price: 0, modules: [] });
                    } else {
                      setIsCreating(true);
                    }
                  }}>
                    {isCreating ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> New Course</>}
                  </Button>
                </div>

                {isCreating && (
                  <form onSubmit={handleCreateCourse} className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">{editCourseId ? "Edit Course" : "Create New Course"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input required type="text" value={newCourse.title} onChange={e => setNewCourse(prev => ({...prev, title: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                        <select value={newCourse.level} onChange={e => setNewCourse(prev => ({...prev, level: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                        <input required type="text" value={newCourse.duration} onChange={e => setNewCourse(prev => ({...prev, duration: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                        <input required type="number" value={newCourse.price} onChange={e => setNewCourse(prev => ({...prev, price: Number(e.target.value)}))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea required rows={3} value={newCourse.description} onChange={e => setNewCourse(prev => ({...prev, description: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                      </div>
                    </div>

                    <div className="mt-8 mb-6 border-t border-slate-200 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">Modules</h4>
                        <Button type="button" variant="outline" onClick={handleAddModule} className="text-xs"> + Add Module </Button>
                      </div>
                      <div className="space-y-4">
                        {newCourse.modules.map((module, index) => (
                          <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 relative">
                            <button type="button" onClick={() => handleRemoveModule(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                            <input required type="text" value={module.title} onChange={e => handleModuleChange(index, "title", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2" placeholder="Module Title" />
                            <div className="grid grid-cols-2 gap-2">
                              <input type="text" value={module.videoUrl} onChange={e => handleModuleChange(index, "videoUrl", e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Video URL" />
                              <input type="text" value={module.notesUrl} onChange={e => handleModuleChange(index, "notesUrl", e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Notes URL" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Course"}</Button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-sm text-slate-500">
                        <th className="py-4 px-4 font-semibold">Title</th>
                        <th className="py-4 px-4 font-semibold">Price</th>
                        <th className="py-4 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c: any) => (
                        <tr key={c._id} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-semibold text-slate-800">{c.title}</td>
                          <td className="py-4 px-4 text-slate-600">₹{c.price}</td>
                          <td className="py-4 px-4 text-right">
                            <button onClick={() => startEdit(c)} className="p-2 text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteCourse(c._id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* TAB: LIVE CLASSES */}
            {tab === "live" && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">Live Classes</h1>
                  <p className="text-slate-600 text-sm">Schedule new live sessions for students.</p>
                </div>
                
                <form onSubmit={handleCreateLiveClass} className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Class Title</label>
                    <input required type="text" value={newLiveClass.title} onChange={e => setNewLiveClass(prev => ({...prev, title: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Instructor Name</label>
                    <input required type="text" value={newLiveClass.instructor} onChange={e => setNewLiveClass(prev => ({...prev, instructor: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Start Date & Time</label>
                    <input required type="datetime-local" value={newLiveClass.startTime} onChange={e => setNewLiveClass(prev => ({...prev, startTime: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Meeting URL (Zoom/Meet)</label>
                    <input required type="url" value={newLiveClass.meetingUrl} onChange={e => setNewLiveClass(prev => ({...prev, meetingUrl: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2" />
                  </div>
                  <Button type="submit" className="md:col-span-2">Create Live Class</Button>
                </form>

                <div className="space-y-4">
                  {liveClasses.map((lc: any) => (
                    <div key={lc._id} className="p-4 bg-white border rounded-2xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800">{lc.title}</h4>
                        <p className="text-sm text-slate-500">{lc.instructor} • {new Date(lc.startTime).toLocaleString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{lc.status}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TAB: STUDENTS & MENTORS */}
            {tab === "students" && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">Mentorship Assignment</h1>
                  <p className="text-slate-600 text-sm">Assign senior math experts to students.</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-sm text-slate-500">
                        <th className="py-4 px-4 font-semibold">Student Name</th>
                        <th className="py-4 px-4 font-semibold">Current Mentor</th>
                        <th className="py-4 px-4 text-right font-semibold">Assign New</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student: any) => (
                        <tr key={student._id} className="border-b hover:bg-slate-50">
                          <td className="py-4 px-4 font-semibold text-slate-800">{student.name}</td>
                          <td className="py-4 px-4 text-slate-600">{student.mentorId?.name || "No Mentor"}</td>
                          <td className="py-4 px-4 text-right">
                             <select 
                               className="text-sm border border-slate-200 rounded-lg px-2 py-1"
                               onChange={(e) => handleAssignMentor(student._id, e.target.value)}
                               defaultValue=""
                             >
                               <option value="" disabled>Select Mentor</option>
                               {admins.map(admin => (
                                 <option key={admin._id} value={admin._id}>{admin.name}</option>
                               ))}
                             </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* TAB: SCHOOLS & B2B */}
            {tab === "schools" && (
              <>
                <div className="mb-8 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">School & B2B Partners</h1>
                    <p className="text-slate-600 text-sm">Create school accounts and assign course licenses to them.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Create School Form */}
                  <div className="lg:col-span-1 border border-slate-200 rounded-3xl p-6 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Create New School</h3>
                    <form onSubmit={handleCreateSchool} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">School Name</label>
                        <input 
                          required 
                          placeholder="e.g. Springfield High"
                          value={newSchool.name} 
                          onChange={e => setNewSchool({...newSchool, name: e.target.value})}
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Admin Email</label>
                        <input 
                          required 
                          type="email"
                          placeholder="admin@school.edu"
                          value={newSchool.email} 
                          onChange={e => setNewSchool({...newSchool, email: e.target.value})}
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Temp Password</label>
                        <input 
                          required 
                          type="password"
                          value={newSchool.password} 
                          onChange={e => setNewSchool({...newSchool, password: e.target.value})}
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <Button type="submit" disabled={loadingSchool} className="w-full rounded-xl">
                        {loadingSchool ? "Creating..." : "Create School"}
                      </Button>
                    </form>
                  </div>

                  {/* Schools List & Assignments */}
                  <div className="lg:col-span-2 space-y-6">
                    {schools.length === 0 ? (
                      <p className="text-slate-500 py-10 text-center border border-dashed border-slate-200 rounded-2xl">No schools found.</p>
                    ) : (
                      schools.map(school => (
                        <div key={school._id} className="border border-slate-200 rounded-3xl p-6 relative overflow-hidden group">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-slate-800">{school.name}</h4>
                              <p className="text-sm text-slate-500">{school.email}</p>
                            </div>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">B2B Partner</span>
                          </div>

                          <div className="border-t border-slate-100 pt-4 mt-4">
                            <h5 className="text-sm font-bold text-slate-700 mb-3">Licensed Courses</h5>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {school.assignedCourses && school.assignedCourses.length > 0 ? (
                                courses.filter(c => school.assignedCourses.includes(c._id)).map(course => (
                                  <div key={course._id} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-sm text-slate-700 border border-slate-200">
                                    <span className="truncate max-w-[150px]">{course.title}</span>
                                    <button 
                                      onClick={() => handleAssignCourseToSchool(school._id, course._id, "remove")}
                                      className="text-red-500 hover:text-red-700 font-bold ml-2"
                                      title="Revoke License"
                                    >×</button>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400">No courses licensed yet.</p>
                              )}
                            </div>

                            {/* Assign New Courses with Checkboxes */}
                            <div className="mt-4 border border-slate-200 rounded-xl p-4 bg-white">
                              <h6 className="text-xs font-bold text-slate-500 uppercase mb-3">Assign New Courses</h6>
                              
                              {courses.filter(c => !(school.assignedCourses || []).includes(c._id)).length === 0 ? (
                                <p className="text-sm text-slate-500">All available courses are already licensed to this school.</p>
                              ) : (
                                <div className="space-y-4">
                                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                    {courses.filter(c => !(school.assignedCourses || []).includes(c._id)).map(course => (
                                      <label key={course._id} className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                        <input 
                                          type="checkbox" 
                                          className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                          checked={(selectedCoursesBySchool[school._id] || []).includes(course._id)}
                                          onChange={(e) => handleCheckboxChange(school._id, course._id, e.target.checked)}
                                        />
                                        <span className="truncate flex-grow">{course.title}</span>
                                      </label>
                                    ))}
                                  </div>
                                  
                                  {(selectedCoursesBySchool[school._id] || []).length > 0 && (
                                    <Button 
                                      size="sm"
                                      className="w-full"
                                      onClick={() => handleAssignMultipleCourses(school._id)}
                                    >
                                      Assign {(selectedCoursesBySchool[school._id] || []).length} Selected Courses
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </PageWrapper>
  );
}

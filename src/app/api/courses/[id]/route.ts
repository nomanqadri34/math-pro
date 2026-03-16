import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest, props: any) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    await connectToDatabase();
    
    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let isEnrolled = false;
    if (session?.user?.email) {
      const user = await User.findOne({ 
        email: session.user.email,
        "enrolledCourses.courseId": params.id 
      });
      if (user) isEnrolled = true;
    }

    return NextResponse.json({ ...course.toObject(), isEnrolled }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: any) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await Course.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: any) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log(`PUT /api/courses/${params.id} - Received body:`, JSON.stringify(body, null, 2));
    await connectToDatabase();
    
    const updatedCourse = await Course.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    console.log(`PUT /api/courses/${params.id} - Updated course modules count:`, updatedCourse?.modules?.length);
    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

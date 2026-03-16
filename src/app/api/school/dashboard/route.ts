import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch the school user to get assigned courses
    const school = await User.findOne({ email: session.user.email });
    if (!school) {
      return NextResponse.json({ error: "School profile not found" }, { status: 404 });
    }

    // Fetch students created by this school
    const students = await User.find({ schoolId: school._id }).select("name email isVerified createdAt");
    
    // Fetch the actual course objects based on the assigned course IDs
    let courses = [];
    if (school.assignedCourses && school.assignedCourses.length > 0) {
      courses = await Course.find({ _id: { $in: school.assignedCourses } });
    }

    return NextResponse.json({ students, courses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching school dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}

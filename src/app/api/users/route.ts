import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const users = await User.find({}).select("name email role points mentorId").populate("mentorId", "name");
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, role } = await req.json();
    const creatorRole = (session.user as any).role;

    // Permissions logic
    if (creatorRole === "admin") {
      // Admin can create admins, schools, and students
      if (role !== "admin" && role !== "school" && role !== "student") {
        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
      }
    } else if (creatorRole === "school") {
      // Schools can ONLY create students
      if (role !== "student") {
        return NextResponse.json({ error: "Schools can only create student accounts" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized to create users" }, { status: 403 });
    }

    await connectToDatabase();
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUserObj: any = {
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true, // Auto-verify accounts created by admins/schools
    };

    // If a school created this student, link them and assign course access
    if (creatorRole === "school") {
      const schoolDoc = await User.findOne({ email: session.user.email });
      if (schoolDoc) {
        newUserObj.schoolId = schoolDoc._id;
        // Pre-enroll student in all courses licensed to the school
        if (schoolDoc.assignedCourses && schoolDoc.assignedCourses.length > 0) {
          newUserObj.enrolledCourses = schoolDoc.assignedCourses.map((cId: any) => ({
            courseId: cId,
            progress: 0
          }));
        }
      }
    }

    const newUser = await User.create(newUserObj);
    return NextResponse.json({ message: "User created successfully", userId: newUser._id }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user", details: error.message }, { status: 500 });
  }
}

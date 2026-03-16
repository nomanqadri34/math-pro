import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const courses = await Course.find({}).sort({ createdAt: -1 });
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("POST /api/courses - Received body:", JSON.stringify(body, null, 2));
    await connectToDatabase();

    const course = await Course.create(body);
    console.log("POST /api/courses - Created course:", course._id);
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}

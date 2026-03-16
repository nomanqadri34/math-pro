import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: NextRequest, props: any) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, courseId, courseIds } = await req.json();
    await connectToDatabase();

    let updateQuery: any = {};
    if (action === "assign") {
      updateQuery = { $addToSet: { assignedCourses: courseId } };
    } else if (action === "remove") {
      updateQuery = { $pull: { assignedCourses: courseId } };
    } else if (action === "assignMultiple") {
      updateQuery = { $addToSet: { assignedCourses: { $each: courseIds } } };
    }

    const updatedSchool = await User.findByIdAndUpdate(
      params.id,
      updateQuery,
      { new: true }
    ).populate('assignedCourses');

    if (!updatedSchool) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Course assignment updated", school: updatedSchool }, { status: 200 });
  } catch (error) {
    console.error("Error assigning course to school:", error);
    return NextResponse.json({ error: "Failed to assign course" }, { status: 500 });
  }
}

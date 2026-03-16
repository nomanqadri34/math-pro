import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const topStudents = await User.find({ role: "student" })
      .select("name points")
      .sort({ points: -1 })
      .limit(10);
    
    return NextResponse.json(topStudents, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}

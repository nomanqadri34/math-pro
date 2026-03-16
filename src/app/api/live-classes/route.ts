import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import LiveClass from "@/models/LiveClass";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const classes = await LiveClass.find({
      status: { $in: ["upcoming", "live"] }
    }).sort({ startTime: 1 });
    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch live classes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();
    const liveClass = await LiveClass.create(body);
    return NextResponse.json(liveClass, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create live class" }, { status: 500 });
  }
}

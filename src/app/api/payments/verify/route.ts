import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await connectToDatabase();
      
      // Add course to user's enrolledCourses if not already present
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        const isAlreadyEnrolled = user.enrolledCourses?.some(
          (e: any) => {
             const id = e.courseId?._id || e.courseId || e;
             return id?.toString() === courseId;
          }
        );
        
        if (!isAlreadyEnrolled) {
          user.enrolledCourses.push({ courseId, progress: 0 });
          await user.save();
        }
        return NextResponse.json({ message: "Payment verified and enrollment successful" }, { status: 200 });
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}

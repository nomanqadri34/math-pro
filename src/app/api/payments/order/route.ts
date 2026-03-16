import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import Course from "@/models/Course";

let razorpay: any = null;

export async function POST(req: NextRequest) {
  try {
    if (!razorpay) {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("Razorpay Keys are missing from environment variables!");
        return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
      }
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });
    }
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();
    await connectToDatabase();
    
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const price = Number(course.price) || 0;
    if (price <= 0) {
      return NextResponse.json({ error: "Invalid course price" }, { status: 400 });
    }

    const amount = Math.round(price * 100); // Razorpay expects amount in paise (integer)
    
    // Create Razorpay order
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${courseId.toString().slice(-6)}_${Date.now()}`,
    };

    console.log("Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created successfully:", order.id);
    
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay Order Error Details:", {
      message: error.message,
      description: error.description,
      metadata: error.metadata,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: "Failed to create order", 
      details: error.message 
    }, { status: 500 });
  }
}

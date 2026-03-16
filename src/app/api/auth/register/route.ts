import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password should be at least 6 characters" }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json({ error: "Email is already registered and verified" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If user exists but is not verified, we'll update their password and resend OTP
    if (existingUser && !existingUser.isVerified) {
      existingUser.password = hashedPassword;
      existingUser.name = name;
      await existingUser.save();
    } else {
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: "student",
        isVerified: false,
      });
    }

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp: otpCode,
    });

    // Send email
    await sendEmail({
      to: email,
      subject: "MathPro - Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to MathPro, ${name}!</h2>
          <p>Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; border-radius: 8px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "OTP sent to your email" }, { status: 200 });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Failed to process registration" }, { status: 500 });
  }
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { UserPlus, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterState = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessMsg(data.message || "OTP sent to your email!");
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "OTP Verification failed");
      }

      // Automatically sign in the user after successful verification
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInRes?.error) {
        throw new Error("Verified successfully, but auto-login failed. Please log in manually.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper className="bg-slate-50 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md my-12"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
             {step === 1 ? <UserPlus className="w-8 h-8 text-primary" /> : <MailCheck className="w-8 h-8 text-primary" />}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {step === 1 ? "Create Account" : "Verify Email"}
          </h1>
          <p className="text-slate-600 text-sm">
            {step === 1 ? "Join MathPro to access courses and AI support." : `Enter the 6-digit code sent to ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm mb-6 border border-green-100">
            {successMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRegisterState} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="student@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input 
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Sending Code..." : "Continue"}
            </Button>
          </form>
        )}

        {step === 2 && (
           <form onSubmit={handleVerifyOTP} className="space-y-4 mb-6">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code (OTP)</label>
               <input 
                 type="text"
                 name="otp"
                 value={formData.otp}
                 onChange={handleChange}
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-center tracking-[0.5em] font-semibold text-lg"
                 placeholder="123456"
                 maxLength={6}
                 required
               />
             </div>
             <Button type="submit" className="w-full mt-2" disabled={isLoading}>
               {isLoading ? "Verifying..." : "Verify & Sign In"}
             </Button>
             <button 
               type="button" 
               onClick={() => { setStep(1); setError(""); setSuccessMsg(""); }}
               className="w-full text-center text-sm text-slate-500 hover:text-primary mt-4"
             >
               Back to details
             </button>
           </form>
        )}

        {step === 1 && (
          <div className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log in here
            </Link>
          </div>
        )}
      </motion.div>
    </PageWrapper>
  );
}

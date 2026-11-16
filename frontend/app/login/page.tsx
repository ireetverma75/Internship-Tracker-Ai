"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Signed in successfully (Demo Session)");
      router.push("/dashboard");
    }, 500);
  };

  const handleDemoBypass = () => {
    toast.info("Entering Academic Reviewer Demo Environment");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="h-10 w-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-sm">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#0F172A]">
              Internship<span className="text-[#2563EB]">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Access your internship tracker and resume matching dashboard
          </p>
        </div>

        {/* Demo Fast Access Pill */}
        <div className="mb-5 p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#2563EB] mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Academic Reviewer One-Click Access</span>
          </div>
          <p className="text-[11px] text-[#64748B] mb-3">
            Evaluate all features with preloaded opportunities and applications without creating an account.
          </p>
          <Button
            onClick={handleDemoBypass}
            className="w-full shadow-sm"
            size="sm"
          >
            <span>Enter as Demo Reviewer</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#F8FAFC]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#0F172A]">
                  Password
                </label>
                <a href="#" className="text-[11px] text-[#2563EB] font-medium hover:underline">
                  Forgot?
                </a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#F8FAFC]"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full mt-2 text-xs"
              isLoading={isLoading}
            >
              Sign In with Credentials
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-[#64748B]">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#2563EB] font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#64748B]">
          <Link href="/" className="hover:text-[#0F172A] font-medium">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

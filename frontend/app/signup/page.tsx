"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Account created successfully (Demo Mode)");
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
        <div className="text-center mb-5">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="h-10 w-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-sm">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#0F172A]">
              Internship<span className="text-[#2563EB]">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Supercharge your tech internship application lifecycle
          </p>
        </div>

        <div className="mb-4 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-center shadow-sm">
          <Button
            onClick={handleDemoBypass}
            className="w-full shadow-sm"
            size="sm"
          >
            <span>Skip to Academic Reviewer Demo</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Student User"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-[#F8FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                University / Institution
              </label>
              <Input
                type="text"
                placeholder="University of Washington"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="bg-[#F8FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Student Email
              </label>
              <Input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#F8FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#F8FAFC]"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-3 shadow-sm text-xs"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-[#64748B]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2563EB] font-semibold hover:underline">
              Sign in
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

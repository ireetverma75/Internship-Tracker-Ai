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
    }, 600);
  };

  const handleDemoBypass = () => {
    toast.info("Entering Academic Reviewer Demo Environment");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#35D5F2] flex items-center justify-center shadow-lg shadow-[#4F7CFF]/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              Internship<span className="text-[#4F7CFF]">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supercharge your tech internship application lifecycle
          </p>
        </div>

        <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 via-[#35D5F2]/10 to-blue-500/10 border border-blue-500/30 text-center">
          <Button
            onClick={handleDemoBypass}
            className="w-full glow-blue"
            size="sm"
          >
            <span>Skip to Academic Reviewer Demo</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/80 shadow-2xl glass-card">
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Alex Chen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                University / Institution
              </label>
              <Input
                type="text"
                placeholder="University of Washington"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Student Email
              </label>
              <Input
                type="email"
                placeholder="alex.chen@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-[#4F7CFF] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

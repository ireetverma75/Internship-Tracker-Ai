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
    }, 600);
  };

  const handleDemoBypass = () => {
    toast.info("Entering Academic Reviewer Demo Environment");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col justify-center items-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4F7CFF]/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#35D5F2] flex items-center justify-center shadow-lg shadow-[#4F7CFF]/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              Internship<span className="text-[#4F7CFF]">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your internship tracker and resume matching dashboard
          </p>
        </div>

        {/* Demo Fast Access Pill */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-[#35D5F2]/10 to-blue-500/10 border border-blue-500/30 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#35D5F2] mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Academic Reviewer One-Click Access</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Evaluate all features with preloaded opportunities and applications without creating an account.
          </p>
          <Button
            onClick={handleDemoBypass}
            className="w-full glow-blue"
            size="sm"
          >
            <span>Enter as Demo Reviewer</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/80 shadow-2xl glass-card">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="alex.chen@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <a href="#" className="text-[11px] text-[#4F7CFF] hover:underline">
                  Forgot?
                </a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In with Credentials
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#4F7CFF] font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

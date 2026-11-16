"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Sparkles,
  FileCheck,
  Kanban,
  Clock,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 overflow-x-hidden selection:bg-[#6366F1] selection:text-white">
      {/* Public Navbar */}
      <header className="relative z-10 w-full border-b border-[#1E293B] bg-[#0B1220]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center shadow-[0_16px_30px_rgba(99,102,241,0.28)] group-hover:scale-105 transition-transform">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white">
                Internship<span className="text-[#06B6D4]">AI</span>
              </span>
              <span className="text-[10px] tracking-wider text-slate-400 font-medium uppercase">
                Modern Career Platform
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#matching-science" className="hover:text-white transition-colors">
              Matching Engine
            </a>
            <Link href="/jobs" className="hover:text-white transition-colors">
              HF Jobs Dataset
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" className="shadow-sm">
                <span>Enter Platform</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-16 md:pt-24 md:pb-28 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10182B] border border-[#1E293B] text-xs text-[#8AD7FF] font-semibold mb-6 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI-Powered Discovery, Resume Matching & Application Tracking</span>
          <span className="h-1 w-1 rounded-full bg-blue-300" />
          <span className="font-bold">Hugging Face Dataset Integrated</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
        >
          Your Next Tech Opportunity <br />
          <span className="bg-gradient-to-r from-[#818CF8] via-[#06B6D4] to-[#A78BFA] bg-clip-text text-transparent">Accelerated by AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Discover 1,900+ curated and dataset tech listings, parse job requirements in seconds, benchmark your resume with genuine TF-IDF cosine matching, and track your recruitment journey.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto shadow-sm">
              <span>Launch Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/jobs" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <span>Explore Hugging Face Jobs</span>
            </Button>
          </Link>
        </motion.div>

        {/* Live Interactive Product Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 rounded-3xl border border-[#1E293B] bg-[#0F172A]/90 p-5 sm:p-6 shadow-[0_30px_80px_rgba(2,6,23,0.7)] text-left max-w-5xl mx-auto relative overflow-hidden"
        >
          {/* Mock Window Controls */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-semibold text-[#64748B]">
                Internship Tracker AI — SaaS Workspace
              </span>
            </div>
            <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              Live Product Demo
            </span>
          </div>

          {/* Simulated Dashboard Grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-[#0B1220] border border-[#1E293B]">
              <span className="text-[11px] font-semibold text-[#64748B]">Saved Opportunities</span>
              <p className="text-2xl font-bold text-[#0F172A] mt-1 tabular-nums">12</p>
              <span className="text-[10px] text-[#16A34A] font-medium">Top tech opportunities</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] font-semibold text-[#64748B]">Applications Sent</span>
              <p className="text-2xl font-bold text-[#2563EB] mt-1 tabular-nums">6</p>
              <span className="text-[10px] text-[#2563EB] font-medium">In active pipeline</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] font-semibold text-[#64748B]">Interviews Scheduled</span>
              <p className="text-2xl font-bold text-[#0F172A] mt-1 tabular-nums">2</p>
              <span className="text-[10px] text-[#64748B] font-medium">Microsoft, NVIDIA</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[11px] font-semibold text-[#64748B]">Average Match Score</span>
              <p className="text-2xl font-bold text-[#16A34A] mt-1 tabular-nums">88%</p>
              <span className="text-[10px] text-[#16A34A] font-medium">Strong profile fit</span>
            </div>
          </div>

          {/* Simulated Opportunity Pill */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#0B1220] border border-[#1E293B] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm border border-blue-200">
                MS
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0F172A]">
                  Software Engineering Intern — Cloud & AI Platform
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  Microsoft · Redmond, WA · $52/hr · Deadline in 24 days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="primary">Python</Badge>
              <Badge variant="primary">C++</Badge>
              <Badge variant="primary">Docker</Badge>
              <Badge variant="success">92% Match</Badge>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4-Step Architecture Section */}
      <section id="how-it-works" className="relative z-10 py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-2 block">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              From Discovery to Offer Letter
            </h2>
            <p className="mt-2 text-[#64748B] text-xs sm:text-sm">
              A complete lifecycle system designed specifically for technical internship recruitment.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Discover</h3>
                <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                  Browse structured opportunities with verified deadlines, work modes, compensations, and skill tags.
                </p>
              </div>
              <Link href="/internships" className="mt-5 text-xs font-semibold text-[#2563EB] inline-flex items-center gap-1">
                Explore Roles <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="h-10 w-10 rounded-xl bg-sky-50 text-[#38BDF8] border border-sky-200 flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Analyze</h3>
                <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                  Extract required skills, eligibility criteria, and core responsibilities from any job posting.
                </p>
              </div>
              <Link href="/analyzer" className="mt-5 text-xs font-semibold text-[#2563EB] inline-flex items-center gap-1">
                AI Analyzer <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Match</h3>
                <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                  Upload your PDF resume to compute genuine TF-IDF cosine similarity and skill gap breakdowns.
                </p>
              </div>
              <Link href="/resume-match" className="mt-5 text-xs font-semibold text-[#16A34A] inline-flex items-center gap-1">
                Resume Benchmarking <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-[#F59E0B] border border-amber-200 flex items-center justify-center font-bold text-sm mb-3">
                  4
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Track</h3>
                <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                  Manage applications through Kanban stages: Saved, Applied, Assessment, Interview, Selected, or Rejected.
                </p>
              </div>
              <Link href="/applications" className="mt-5 text-xs font-semibold text-[#F59E0B] inline-flex items-center gap-1">
                Kanban Pipeline <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Science Section */}
      <section id="matching-science" className="relative z-10 py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-2 block">
              Objective Scoring Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight leading-tight">
              Transparent Scoring, Zero Hallucinated Decisions
            </h2>
            <p className="mt-3 text-[#64748B] text-xs sm:text-sm leading-relaxed">
              Unlike generic hiring systems that output arbitrary match percentages, Internship Tracker AI adheres to a published, evidence-backed evaluation model:
            </p>

            <div className="mt-5 space-y-3 text-xs text-[#0F172A]">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                <div className="h-6 w-6 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  55%
                </div>
                <div>
                  <h4 className="font-bold text-[#0F172A]">Direct Skill Overlap Ratio</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Proportion of required technical stack requirements matched in your resume text.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                <div className="h-6 w-6 rounded-full bg-sky-50 text-[#38BDF8] border border-sky-200 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  35%
                </div>
                <div>
                  <h4 className="font-bold text-[#0F172A]">TF-IDF Cosine Similarity</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Calibrated semantic vector comparison between candidate experiences and job descriptions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                <div className="h-6 w-6 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  10%
                </div>
                <div>
                  <h4 className="font-bold text-[#0F172A]">Academic Qualification & Level Alignment</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Verification of relevant degree credentials, GPA, and graduation status.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/resume-match">
                <Button size="sm">Try Resume Matcher Now</Button>
              </Link>
            </div>
          </div>

          {/* Interactive Scoring Mock Visual */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Sample Report: Student User
              </span>
              <Badge variant="success">92% Match</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-[#0F172A]">
                  <span>Required Skills (5/5)</span>
                  <span className="text-[#16A34A]">100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#16A34A] rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-[#0F172A]">
                  <span>TF-IDF Vector Similarity</span>
                  <span className="text-[#2563EB]">84%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full w-[84%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-[#0F172A]">
                  <span>Academic Credentials</span>
                  <span className="text-[#38BDF8]">100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#38BDF8] rounded-full w-full" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <span className="text-[#16A34A] font-semibold block mb-1">
                Matched Technical Skills:
              </span>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 rounded bg-white text-emerald-800 text-[11px] border border-emerald-200 font-medium">
                  Python
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-emerald-800 text-[11px] border border-emerald-200 font-medium">
                  React
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-emerald-800 text-[11px] border border-emerald-200 font-medium">
                  TypeScript
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-emerald-800 text-[11px] border border-emerald-200 font-medium">
                  FastAPI
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Navy CTA Card (Section 2 & 4 contrast) */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#101D35] text-white shadow-xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to Supercharge Your Internship Applications?
          </h2>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
            Experience our production-ready AI SaaS platform right now. Zero setup required to evaluate the demo environment.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Launch Platform
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-slate-700 text-white hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E2E8F0] py-8 px-4 text-center text-xs text-[#64748B] bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Internship Tracker AI · Premium SaaS Platform.</p>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/dashboard" className="hover:text-[#0F172A]">
              Dashboard
            </Link>
            <Link href="/internships" className="hover:text-[#0F172A]">
              Internships
            </Link>
            <Link href="/jobs" className="hover:text-[#0F172A]">
              HF Jobs
            </Link>
            <Link href="/skill-gap" className="hover:text-[#0F172A]">
              Skill Gap
            </Link>
            <Link href="/analyzer" className="hover:text-[#0F172A]">
              Resume Analyzer
            </Link>
            <Link href="/settings" className="hover:text-[#0F172A]">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

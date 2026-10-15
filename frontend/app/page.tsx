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
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] overflow-x-hidden selection:bg-[#4F7CFF] selection:text-white">
      {/* Background Accent Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#4F7CFF]/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-[#35D5F2]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Public Navbar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-[#0B1020]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#35D5F2] flex items-center justify-center shadow-lg shadow-[#4F7CFF]/20 group-hover:scale-105 transition-transform">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white">
                Internship<span className="text-[#4F7CFF]">AI</span>
              </span>
              <span className="text-[10px] tracking-wider text-slate-400 font-medium uppercase">
                Academic Edition
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#matching-science" className="hover:text-white transition-colors">
              Matching Engine
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" className="shadow-lg shadow-[#4F7CFF]/25">
                <span>Enter Demo App</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 mb-8 backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#35D5F2]" />
          <span>Intelligent Discovery, Semantic Parsing & Application Pipeline</span>
          <span className="h-1 w-1 rounded-full bg-slate-500" />
          <span className="text-[#4F7CFF] font-semibold">Ready for Evaluation</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
        >
          Your Next Opportunity <br />
          <span className="bg-gradient-to-r from-[#4F7CFF] via-[#35D5F2] to-white bg-clip-text text-transparent">
            Starts Here
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Discover curated tech internships, parse job descriptions in seconds,
          benchmark your resume against job requirements with transparent scoring,
          and track application milestones on an interactive Kanban board.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto glow-blue">
              <span>Explore Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Live Interactive Product Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 sm:mt-20 rounded-2xl border border-slate-700/80 bg-[#111827]/90 p-4 sm:p-6 shadow-2xl glass-card text-left max-w-5xl mx-auto relative overflow-hidden"
        >
          {/* Mock Window Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-medium text-slate-400">
                Internship Tracker AI — Interactive Workspace
              </span>
            </div>
            <Badge variant="accent">Live Interactive Demo</Badge>
          </div>

          {/* Simulated Dashboard Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">Saved Internships</span>
              <p className="text-2xl font-bold text-white mt-1 tabular-nums">12</p>
              <span className="text-[10px] text-emerald-400 font-medium">Top tech opportunities</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">Applications Sent</span>
              <p className="text-2xl font-bold text-[#4F7CFF] mt-1 tabular-nums">6</p>
              <span className="text-[10px] text-blue-400 font-medium">In active pipeline</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">Interviews Scheduled</span>
              <p className="text-2xl font-bold text-[#35D5F2] mt-1 tabular-nums">2</p>
              <span className="text-[10px] text-cyan-400 font-medium">Microsoft, NVIDIA</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">Average Match Score</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">88%</p>
              <span className="text-[10px] text-slate-400 font-medium">Strong alignment</span>
            </div>
          </div>

          {/* Simulated Opportunity Pill */}
          <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600/20 text-[#4F7CFF] flex items-center justify-center font-bold text-sm border border-blue-500/30">
                MS
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Software Engineering Intern — Cloud & AI Platform
                </h4>
                <p className="text-xs text-slate-400">
                  Microsoft · Redmond, WA · $52/hr · Deadline in 24 days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">Python</Badge>
              <Badge variant="primary">C++</Badge>
              <Badge variant="primary">Distributed Systems</Badge>
              <Badge variant="success">92% Match</Badge>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4-Step Workflow Section */}
      <section id="how-it-works" className="relative z-10 py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="primary" className="mb-3">
              Four-Step Architecture
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              From Discovery to Offer Letter
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              A comprehensive lifecycle system designed specifically for technical internship recruitment.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#4F7CFF] flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-white">Discover</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Browse structured opportunities with verified deadlines, work modes, compensations, and skill tags.
                </p>
              </div>
              <span className="mt-6 text-[11px] font-semibold text-[#4F7CFF] inline-flex items-center gap-1">
                Explore Roles <ChevronRight className="h-3 w-3" />
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="h-12 w-12 rounded-xl bg-[#35D5F2]/10 border border-[#35D5F2]/20 text-[#35D5F2] flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-white">Analyze</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Paste any job description to extract required skills, eligibility criteria, and core responsibilities with AI.
                </p>
              </div>
              <span className="mt-6 text-[11px] font-semibold text-[#35D5F2] inline-flex items-center gap-1">
                AI Parser <ChevronRight className="h-3 w-3" />
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-white">Match</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Upload your PDF resume to generate an objective match score with matched vs missing skill breakdowns.
                </p>
              </div>
              <span className="mt-6 text-[11px] font-semibold text-emerald-400 inline-flex items-center gap-1">
                Resume Benchmarking <ChevronRight className="h-3 w-3" />
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
                  4
                </div>
                <h3 className="text-lg font-semibold text-white">Track</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Move applications through Kanban stages: Saved, Applied, Assessment, Interview, Selected, or Rejected.
                </p>
              </div>
              <span className="mt-6 text-[11px] font-semibold text-amber-400 inline-flex items-center gap-1">
                Kanban Pipeline <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Science Section */}
      <section id="matching-science" className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="accent" className="mb-3">
              Objective Scoring Engine
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Transparent Scoring, <br />
              <span className="text-[#35D5F2]">Zero Hallucinated Decisions</span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Unlike generic hiring systems that output arbitrary percentages, Internship Tracker AI adheres to a published, evidence-backed evaluation model:
            </p>

            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="h-6 w-6 rounded-full bg-blue-500/20 text-[#4F7CFF] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  70%
                </div>
                <div>
                  <h4 className="font-semibold text-white">Required Skills Overlap</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Proportion of mandatory technical stack requirements verified in your resume.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="h-6 w-6 rounded-full bg-[#35D5F2]/20 text-[#35D5F2] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  20%
                </div>
                <div>
                  <h4 className="font-semibold text-white">Preferred & Bonus Stack Alignment</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Familiarity with secondary tools (e.g. Docker, GraphQL, Kubernetes, Cloud).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  10%
                </div>
                <div>
                  <h4 className="font-semibold text-white">Academic Baseline & Project Evidence</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verification of relevant degree enrollment and concrete project implementations.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/resume-match">
                <Button>Try Resume Matcher Now</Button>
              </Link>
            </div>
          </div>

          {/* Interactive Scoring Mock Visual */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-700/80 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Sample Report: Alex Chen
              </span>
              <Badge variant="success">92% Match</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Required Skills (5/5)</span>
                  <span className="text-emerald-400 font-semibold">100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Preferred Skills (2/3)</span>
                  <span className="text-[#35D5F2] font-semibold">67%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-[#35D5F2] rounded-full w-2/3" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Academic & Project Evidence</span>
                  <span className="text-[#4F7CFF] font-semibold">100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-[#4F7CFF] rounded-full w-full" />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
              <span className="text-emerald-400 font-semibold block mb-1">
                Matched Required Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                  Python
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                  C++
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                  Distributed Systems
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                  Docker
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-10 py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#111827] to-[#0B1020] border border-slate-700 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4F7CFF]/10 to-[#35D5F2]/10 pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Accelerate Your Career Search?
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Test the live application right now. No sign-up or API credentials required to evaluate the demo environment.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto glow-blue">
                Launch Academic Demo
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Internship Tracker AI. University Project Demonstration.</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-slate-300">
              Dashboard
            </Link>
            <Link href="/internships" className="hover:text-slate-300">
              Internships
            </Link>
            <Link href="/analyzer" className="hover:text-slate-300">
              AI Analyzer
            </Link>
            <Link href="/resume-match" className="hover:text-slate-300">
              Resume Match
            </Link>
            <Link href="/settings" className="hover:text-slate-300">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

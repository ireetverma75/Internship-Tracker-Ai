"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookOpen,
  Award,
  Code,
  Server,
  Cloud,
  Brain,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Filter
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { store } from "@/lib/storage";
import { toast } from "sonner";

interface SkillCategory {
  name: string;
  icon: any;
  skills: {
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    status: "acquired" | "missing" | "in_progress";
    importance: "High" | "Medium" | "Nice-to-have";
    learningTopic?: string;
    resource?: string;
  }[];
}

const BENCHMARK_ROLES: Record<string, { role: string; description: string; targetSkills: string[] }> = {
  "swe-intern": {
    role: "Full-Stack Software Engineer",
    description: "Modern web applications, scalable backend REST/GraphQL APIs, relational databases, and clean code principles.",
    targetSkills: ["Python", "TypeScript", "React", "Next.js", "Node.js", "SQL", "PostgreSQL", "Docker", "Git", "REST APIs", "Tailwind CSS"]
  },
  "ai-ml-intern": {
    role: "AI & Machine Learning Engineer",
    description: "Deep learning models, natural language processing, vector search, PyTorch pipelines, and ML serving.",
    targetSkills: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "Hugging Face", "NLP", "SQL", "Docker", "FastAPI"]
  },
  "cloud-devops": {
    role: "Cloud & DevOps Specialist",
    description: "Containerization, infrastructure as code, CI/CD pipelines, automated testing, and scalable microservices.",
    targetSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git", "Python", "Terraform", "PostgreSQL", "Bash"]
  },
  "data-engineer": {
    role: "Data Platform & Analytics Engineer",
    description: "ETL pipelines, data warehousing, stream processing, distributed computing, and schema design.",
    targetSkills: ["Python", "SQL", "Apache Spark", "Pandas", "PostgreSQL", "Kafka", "Docker", "Git", "Data Modeling"]
  }
};

const DEFAULT_CANDIDATE_SKILLS = [
  "Python",
  "React",
  "TypeScript",
  "Next.js",
  "JavaScript",
  "HTML5/CSS3",
  "SQL",
  "PostgreSQL",
  "Git",
  "REST APIs",
  "FastAPI",
  "Tailwind CSS"
];

export default function SkillGapPage() {
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("swe-intern");
  const [candidateSkills, setCandidateSkills] = useState<string[]>(DEFAULT_CANDIDATE_SKILLS);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");

  useEffect(() => {
    // Load student profile skills if available
    const prof = store.getStudentProfile();
    if (prof && prof.skills && prof.skills.length > 0) {
      setCandidateSkills(prof.skills);
    }
  }, []);

  const currentRole = BENCHMARK_ROLES[selectedRoleKey];

  // Matched vs Missing
  const matchedSkills = useMemo(() => {
    const candidateLower = new Set(candidateSkills.map((s) => s.toLowerCase()));
    return currentRole.targetSkills.filter((s) => candidateLower.has(s.toLowerCase()));
  }, [candidateSkills, currentRole]);

  const missingSkills = useMemo(() => {
    const candidateLower = new Set(candidateSkills.map((s) => s.toLowerCase()));
    return currentRole.targetSkills.filter((s) => !candidateLower.has(s.toLowerCase()));
  }, [candidateSkills, currentRole]);

  const matchPercentage = Math.round(
    (matchedSkills.length / Math.max(1, currentRole.targetSkills.length)) * 100
  );

  // Categorized skill matrix
  const categories: SkillCategory[] = [
    {
      name: "Languages & Core",
      icon: Code,
      skills: [
        { name: "Python", level: "Advanced", status: candidateSkills.some(s => s.toLowerCase() === "python") ? "acquired" : "missing", importance: "High", learningTopic: "Modern Async Python 3.11 & Typing", resource: "https://docs.python.org/3/tutorial/" },
        { name: "TypeScript", level: "Advanced", status: candidateSkills.some(s => s.toLowerCase() === "typescript") ? "acquired" : "missing", importance: "High", learningTopic: "Strict Typing, Generics & Utility Types", resource: "https://www.typescriptlang.org/docs/" },
        { name: "JavaScript", level: "Advanced", status: candidateSkills.some(s => s.toLowerCase() === "javascript") ? "acquired" : "missing", importance: "High", learningTopic: "ES6+, Event Loop & Closures", resource: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
        { name: "SQL", level: "Intermediate", status: candidateSkills.some(s => s.toLowerCase() === "sql") ? "acquired" : "missing", importance: "High", learningTopic: "Joins, Indexes & CTE Query Optimization", resource: "https://sqlbolt.com/" }
      ]
    },
    {
      name: "Frontend & Web",
      icon: Layers,
      skills: [
        { name: "React", level: "Advanced", status: candidateSkills.some(s => s.toLowerCase() === "react") ? "acquired" : "missing", importance: "High", learningTopic: "Concurrent React, Hooks & State Modeling", resource: "https://react.dev" },
        { name: "Next.js", level: "Intermediate", status: candidateSkills.some(s => s.toLowerCase() === "next.js") ? "acquired" : "missing", importance: "High", learningTopic: "App Router, Server Components & Streaming", resource: "https://nextjs.org/docs" },
        { name: "Tailwind CSS", level: "Advanced", status: candidateSkills.some(s => s.toLowerCase().includes("tailwind")) ? "acquired" : "missing", importance: "Medium", learningTopic: "Design Tokens & Responsive Layouts", resource: "https://tailwindcss.com/docs" }
      ]
    },
    {
      name: "Backend & Systems",
      icon: Server,
      skills: [
        { name: "FastAPI", level: "Intermediate", status: candidateSkills.some(s => s.toLowerCase() === "fastapi") ? "acquired" : "missing", importance: "High", learningTopic: "Pydantic V2 Schemas & Dependency Injection", resource: "https://fastapi.tiangolo.com" },
        { name: "Node.js", level: "Beginner", status: candidateSkills.some(s => s.toLowerCase() === "node.js") ? "acquired" : "missing", importance: "Medium", learningTopic: "Express/Nest.js Microservices", resource: "https://nodejs.org" },
        { name: "PostgreSQL", level: "Intermediate", status: candidateSkills.some(s => s.toLowerCase() === "postgresql") ? "acquired" : "missing", importance: "High", learningTopic: "ACID Transactions & Connection Pooling", resource: "https://www.postgresql.org/docs/" },
        { name: "REST APIs", level: "Advanced", status: candidateSkills.some(s => s.toLowerCase().includes("rest")) ? "acquired" : "missing", importance: "High", learningTopic: "API Contracts, OpenAPI & Rate Limiting", resource: "https://restfulapi.net/" }
      ]
    },
    {
      name: "Cloud & DevOps",
      icon: Cloud,
      skills: [
        { name: "Docker", level: "Beginner", status: candidateSkills.some(s => s.toLowerCase() === "docker") ? "acquired" : "missing", importance: "High", learningTopic: "Multi-stage Builds & Container Orchestration", resource: "https://docs.docker.com/get-started/" },
        { name: "Git", level: "Advanced", status: candidateSkills.some(s => s.toLowerCase() === "git") ? "acquired" : "missing", importance: "High", learningTopic: "Interactive Rebase, Feature Branches & CI Hooks", resource: "https://git-scm.com/book/en/v2" },
        { name: "Kubernetes", level: "Beginner", status: candidateSkills.some(s => s.toLowerCase() === "kubernetes") ? "acquired" : "missing", importance: "Nice-to-have", learningTopic: "Pods, Deployments & Cluster Networking", resource: "https://kubernetes.io/docs/tutorials/" },
        { name: "AWS", level: "Beginner", status: candidateSkills.some(s => s.toLowerCase() === "aws") ? "acquired" : "missing", importance: "Medium", learningTopic: "S3, Lambda, EC2 & IAM Security", resource: "https://aws.amazon.com/training/" }
      ]
    },
    {
      name: "AI & Data Science",
      icon: Brain,
      skills: [
        { name: "PyTorch", level: "Beginner", status: candidateSkills.some(s => s.toLowerCase() === "pytorch") ? "acquired" : "missing", importance: "High", learningTopic: "Tensors, Autograd & Neural Network Layers", resource: "https://pytorch.org/tutorials/" },
        { name: "Scikit-Learn", level: "Intermediate", status: candidateSkills.some(s => s.toLowerCase().includes("scikit")) ? "acquired" : "missing", importance: "High", learningTopic: "TF-IDF Vectorization & Classification Pipelines", resource: "https://scikit-learn.org" },
        { name: "Hugging Face", level: "Beginner", status: candidateSkills.some(s => s.toLowerCase().includes("hugging")) ? "acquired" : "missing", importance: "Medium", learningTopic: "Transformers, Datasets & Inference Pipelines", resource: "https://huggingface.co/learn" }
      ]
    }
  ];

  const filteredCategories = activeCategoryFilter === "All"
    ? categories
    : categories.filter((c) => c.name.toLowerCase().includes(activeCategoryFilter.toLowerCase()));

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Skill Matrix & Competency Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Skill Gap Analysis
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl">
              Compare your extracted resume profile against top industry benchmarks to detect high-impact qualification gaps.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/analyzer">
              <Button variant="outline" size="sm">
                <span>Update Resume Skills</span>
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="sm" className="shadow-sm">
                <span>Explore Matching Jobs</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Target Benchmark Selector & Hero Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Target Role Selector Card */}
          <div className="lg:col-span-8 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Select Target Career Path
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {Object.entries(BENCHMARK_ROLES).map(([key, data]) => {
                  const isSelected = selectedRoleKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedRoleKey(key)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-blue-50/60 border-[#2563EB] ring-1 ring-[#2563EB] shadow-sm"
                          : "bg-white border-[#E2E8F0] hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold ${isSelected ? "text-[#2563EB]" : "text-[#0F172A]"}`}>
                          {data.role}
                        </h4>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-[#2563EB]" />}
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                        {data.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Target Overview */}
            <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#0F172A]">
                  Benchmark Target: <span className="text-[#2563EB]">{currentRole.role}</span>
                </span>
                <p className="text-[11px] text-[#64748B]">
                  Analyzing {currentRole.targetSkills.length} core technical requirements for competitive candidates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#64748B]">Benchmark Alignment:</span>
                <span className="text-xs font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {matchPercentage}% Ready
                </span>
              </div>
            </div>
          </div>

          {/* Metric Gauge Card */}
          <div className="lg:col-span-4 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Alignment Overview
              </span>
              <div className="mt-4 flex flex-col items-center justify-center text-center">
                <div className="relative flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full border-4 border-blue-500/20 bg-blue-50 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-3xl font-extrabold text-[#2563EB] tracking-tight">
                      {matchPercentage}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#64748B] mt-0.5">
                      Overlap
                    </span>
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-[#0F172A] mt-3">
                  {matchPercentage >= 75 ? "Strong Candidate Standing" : matchPercentage >= 50 ? "Solid Technical Foundation" : "Focused Skill Upskilling Needed"}
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  You possess {matchedSkills.length} of {currentRole.targetSkills.length} required competencies.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-base font-bold text-[#16A34A]">{matchedSkills.length}</div>
                <div className="text-[10px] text-[#16A34A] font-medium">Acquired Skills</div>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                <div className="text-base font-bold text-[#DC2626]">{missingSkills.length}</div>
                <div className="text-[10px] text-[#DC2626] font-medium">Skills to Learn</div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Overlap Quick Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Skills Card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Verified In Your Profile ({matchedSkills.length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Passing Criteria
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              These skills directly match employers' primary hiring criteria for this role:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <CheckCircle2 className="h-3 w-3 text-[#16A34A]" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills Card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-rose-50 text-[#DC2626] border border-rose-200 flex items-center justify-center">
                  <XCircle className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  High-Priority Skill Gaps ({missingSkills.length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-[#DC2626] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Action Required
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Adding these topics or project bullets will noticeably increase your interview selection rate:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200"
                >
                  <XCircle className="h-3 w-3 text-[#DC2626]" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Grouped by Domain Category */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Comprehensive Domain Competencies
              </h2>
              <p className="text-xs text-[#64748B]">
                Categorized skill proficiencies and verified curriculum recommendations.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {["All", "Languages", "Frontend", "Backend", "Cloud", "AI"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeCategoryFilter === cat
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.name}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                        {category.name}
                      </h3>
                    </div>
                    <span className="text-[11px] text-[#64748B] font-medium">
                      {category.skills.filter((s) => s.status === "acquired").length} / {category.skills.length} Mastered
                    </span>
                  </div>

                  <div className="space-y-3">
                    {category.skills.map((skill) => {
                      const isAcquired = skill.status === "acquired";
                      return (
                        <div
                          key={skill.name}
                          className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#0F172A]">
                                {skill.name}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  isAcquired
                                    ? "bg-emerald-50 text-[#16A34A] border border-emerald-200"
                                    : "bg-rose-50 text-[#DC2626] border border-rose-200"
                                }`}
                              >
                                {isAcquired ? "Acquired" : "Skill Gap"}
                              </span>
                              <span className="text-[10px] font-mono text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                                {skill.level}
                              </span>
                            </div>
                            {skill.learningTopic && (
                              <p className="text-[11px] text-[#64748B]">
                                <span className="font-semibold text-[#0F172A]">Recommended Focus: </span>
                                {skill.learningTopic}
                              </p>
                            )}
                          </div>

                          {skill.resource && (
                            <a
                              href={skill.resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline self-start sm:self-auto shrink-0"
                            >
                              <span>Official Docs</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Callout Card */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Want personalized bullet point recommendations for missing skills?
            </h3>
            <p className="text-xs text-[#64748B] max-w-xl">
              Use our AI Job Matcher or Resume Analyzer to automatically formulate resume achievements demonstrating competencies in {missingSkills.slice(0, 3).join(", ")}.
            </p>
          </div>
          <Link href="/resume-match">
            <Button size="sm" className="whitespace-nowrap shadow-sm">
              <span>Run AI Matcher</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

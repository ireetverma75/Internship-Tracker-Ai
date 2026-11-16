"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Clipboard,
  Trash2,
  Send,
  FileCheck,
  CheckCircle2,
  Copy,
  Plus,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  Cpu,
  UploadCloud,
  FileText,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  Check,
  ArrowRight,
  TrendingUp,
  Percent,
  Download
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SAMPLE_JOB_TEMPLATES, SAMPLE_RESUME_TEXT } from "@/lib/demo-data";
import { api } from "@/lib/api";
import { store } from "@/lib/storage";
import { JobAnalysis } from "@/types";
import { toast } from "sonner";

interface ParsedResumeData {
  filename: string;
  word_count: number;
  char_count: number;
  extracted_text: string;
  detected_skills: string[];
  education?: string;
  experience?: string[];
  quality_score: number;
  quality_breakdown: {
    impact: number;
    skills_density: number;
    structure: number;
    conciseness: number;
  };
  suggestions: string[];
}

export default function AnalyzerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"resume" | "job">("resume");

  // --- Resume PDF Analyzer State ---
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  // --- Job Description Analyzer State ---
  const [description, setDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [jobAnalysisResult, setJobAnalysisResult] = useState<JobAnalysis | null>(null);

  // Resume PDF parser handler
  const processResumeFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF format resume.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("File exceeds maximum allowed size (8MB).");
      return;
    }

    setIsUploadingResume(true);
    try {
      // 1. Upload & persist to backend database
      try {
        await api.uploadResume(file);
      } catch {
        // continue if upload had warning
      }

      // 2. Perform deep analysis via backend API
      const res = await api.analyzeResume({ file });
      const text = res.extracted_text || "";
      const words = res.word_count || text.split(/\s+/).filter(Boolean).length;
      const skills = res.detected_skills || [];

      setResumeData({
        filename: file.name,
        word_count: words,
        char_count: res.char_count || text.length,
        extracted_text: text,
        detected_skills: skills,
        quality_score: res.quality_score,
        quality_breakdown: res.quality_breakdown,
        suggestions: res.suggestions
      });

      toast.success(`Uploaded and analyzed ${file.name} successfully! Quality score: ${res.quality_score}%`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Resume parse failed. Ensure file is a text-based PDF.";
      toast.error(msg);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleDownloadReport = () => {
    if (!resumeData) return;
    const report = `# ATS Resume Analysis & Quality Report
Generated: ${new Date().toLocaleString()}
Document: ${resumeData.filename}

## Overall Quality Score: ${resumeData.quality_score}%
- Impact & Action Verbs: ${resumeData.quality_breakdown.impact}%
- Skills Keyword Density: ${resumeData.quality_breakdown.skills_density}%
- Document Structure: ${resumeData.quality_breakdown.structure}%
- Conciseness & Length: ${resumeData.quality_breakdown.conciseness}%

## Word & Character Count
- Total Words: ${resumeData.word_count}
- Total Characters: ${resumeData.char_count}

## Extracted Technical Skills (${resumeData.detected_skills.length})
${resumeData.detected_skills.map((s) => `- ${s}`).join("\n")}

## ATS Improvement Recommendations
${resumeData.suggestions.map((s) => `- ${s}`).join("\n")}
`;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `resume_report_${resumeData.filename.replace(/\.pdf$/i, "")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded Resume Analysis Report!");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processResumeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processResumeFile(e.target.files[0]);
    }
  };

  const loadSampleResume = () => {
    const text = SAMPLE_RESUME_TEXT;
    const words = text.split(/\s+/).filter(Boolean);
    const skills = ["Python", "React", "TypeScript", "FastAPI", "SQL", "PostgreSQL", "Docker", "Git", "PyTorch", "Tailwind CSS"];
    setResumeData({
      filename: "sample_alex_chen_swe_resume.pdf",
      word_count: words.length,
      char_count: text.length,
      extracted_text: text,
      detected_skills: skills,
      quality_score: 88,
      quality_breakdown: {
        impact: 85,
        skills_density: 90,
        structure: 95,
        conciseness: 85
      },
      suggestions: [
        "Include more concrete numerical business metrics to quantify latency reductions.",
        "Add continuous integration (CI/CD) and cloud deployment tools to highlight DevOps familiarity."
      ]
    });
    toast.info("Loaded sample engineering resume");
  };

  // Job analysis handler
  const handleAnalyzeJob = async () => {
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Please enter at least 10 characters of job description text.");
      return;
    }

    setIsAnalyzingJob(true);
    try {
      let result: JobAnalysis;
      try {
        result = await api.analyzeJob(description, jobUrl || undefined);
      } catch {
        result = store.deterministicAnalyzeJob(description, jobUrl || undefined);
      }
      setJobAnalysisResult(result);
      toast.success("Job description parsed successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze job description";
      toast.error(msg);
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI NLP Extraction Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Resume & Opportunity Analyzer
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl">
              Extract verified technical skills, calculate resume quality indicators, and benchmark against industry expectations.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center rounded-xl bg-white border border-[#E2E8F0] p-1 shadow-sm text-xs self-start md:self-auto">
            <button
              onClick={() => setActiveTab("resume")}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "resume"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Resume PDF Analyzer
            </button>
            <button
              onClick={() => setActiveTab("job")}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "job"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Job Posting Extractor
            </button>
          </div>
        </div>

        {/* TAB 1: RESUME PDF ANALYZER */}
        {activeTab === "resume" && (
          <div className="space-y-6">
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center ${
                isDragOver
                  ? "border-[#2563EB] bg-blue-50/50"
                  : "border-[#E2E8F0] bg-white hover:border-slate-300"
              } shadow-sm`}
            >
              <div className="max-w-md mx-auto space-y-3">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center mx-auto shadow-sm">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Upload your Resume PDF for Deep AI Analysis
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Drag and drop your file here, or browse your device (Max 8MB, text-based PDF).
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <label className="cursor-pointer">
                    <Button size="sm" disabled={isUploadingResume} className="shadow-sm">
                      <span>{isUploadingResume ? "Analyzing PDF..." : "Choose File"}</span>
                    </Button>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileInputChange}
                      disabled={isUploadingResume}
                    />
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSampleResume}
                    disabled={isUploadingResume}
                  >
                    Load Sample Resume
                  </Button>
                </div>
              </div>
            </div>

            {/* Analysis Results View */}
            {resumeData && (
              <div className="space-y-6">
                {/* Result Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A]">{resumeData.filename}</h4>
                      <p className="text-[11px] text-[#64748B]">
                        Parsed with backend PyMuPDF extraction engine · {resumeData.word_count} words
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer">
                      <Button size="sm" variant="outline" className="h-8 text-xs" disabled={isUploadingResume}>
                        <UploadCloud className="h-3.5 w-3.5 mr-1 text-[#2563EB]" />
                        <span>Replace Resume</span>
                      </Button>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileInputChange}
                        disabled={isUploadingResume}
                      />
                    </label>

                    <Button size="sm" variant="outline" onClick={handleDownloadReport} className="h-8 text-xs">
                      <Download className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                      <span>Download Report</span>
                    </Button>

                    <Link href={`/resume-match?skills=${encodeURIComponent(resumeData.detected_skills.join(","))}`}>
                      <Button size="sm" className="h-8 text-xs shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        <span>Match Target Jobs</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                      Overall Quality Score
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-[#2563EB]">
                        {resumeData.quality_score}%
                      </span>
                      <span className="text-xs font-semibold text-[#16A34A]">
                        {resumeData.quality_score >= 80 ? "Top 15% Candidate" : "Competitive"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                      Extracted Technical Skills
                    </span>
                    <div className="text-2xl font-extrabold text-[#0F172A]">
                      {resumeData.detected_skills.length}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                      Resume Word Count
                    </span>
                    <div className="text-2xl font-extrabold text-[#0F172A]">
                      {resumeData.word_count}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                      Target Role Matching
                    </span>
                    <div className="pt-1">
                      <Link
                        href={`/resume-match?skills=${encodeURIComponent(resumeData.detected_skills.join(","))}`}
                      >
                        <Button size="sm" variant="outline" className="w-full text-xs h-8">
                          <span>Match Roles</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Quality Score Breakdown & Skill Cloud */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Quality Breakdown Card */}
                  <div className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-5">
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Resume Quality Breakdown
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
                          <span>Impact & Action Verbs</span>
                          <span>{resumeData.quality_breakdown.impact}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-[#2563EB] rounded-full transition-all"
                            style={{ width: `${resumeData.quality_breakdown.impact}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
                          <span>Skills Keyword Density</span>
                          <span>{resumeData.quality_breakdown.skills_density}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-[#38BDF8] rounded-full transition-all"
                            style={{ width: `${resumeData.quality_breakdown.skills_density}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
                          <span>Document Structure & Hierarchy</span>
                          <span>{resumeData.quality_breakdown.structure}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-[#16A34A] rounded-full transition-all"
                            style={{ width: `${resumeData.quality_breakdown.structure}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
                          <span>Conciseness & Length Balance</span>
                          <span>{resumeData.quality_breakdown.conciseness}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${resumeData.quality_breakdown.conciseness}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Improvement Suggestions */}
                    <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                        <Lightbulb className="h-4 w-4" />
                        <span>AI Improvement Recommendations</span>
                      </div>
                      <div className="space-y-2">
                        {resumeData.suggestions.map((sug, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-[#0F172A] leading-relaxed flex items-start gap-2"
                          >
                            <Check className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
                            <span>{sug}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detected Technical Skills Cloud */}
                  <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                      <div>
                        <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                          Extracted Technical Competencies ({resumeData.detected_skills.length})
                        </h3>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Identified via NLP dictionary and pattern matching across your document.
                        </p>
                      </div>
                      <Link href="/skill-gap">
                        <span className="text-xs font-semibold text-[#2563EB] hover:underline">
                          View Skill Gap →
                        </span>
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {resumeData.detected_skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-[#2563EB] border border-blue-200"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB]" />
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Extracted Raw Text Preview */}
                    <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-[#64748B]" />
                          Extracted Text Preview ({resumeData.filename})
                        </span>
                        <button
                          onClick={() => setShowFullText(!showFullText)}
                          className="text-xs text-[#2563EB] hover:underline font-medium"
                        >
                          {showFullText ? "Collapse Preview" : "Expand Full Text"}
                        </button>
                      </div>

                      <div
                        className={`p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#0F172A] leading-relaxed overflow-y-auto ${
                          showFullText ? "max-h-96" : "max-h-36"
                        }`}
                      >
                        <pre className="whitespace-pre-wrap font-sans text-xs text-[#0F172A]/80">
                          {resumeData.extracted_text}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: JOB DESCRIPTION EXTRACTOR */}
        {activeTab === "job" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
                {/* Sample Templates */}
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                    Load Sample Job Posting
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {SAMPLE_JOB_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.company}
                        type="button"
                        onClick={() => setDescription(tmpl.text)}
                        className="w-full text-left p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] transition-colors text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-[#0F172A]">{tmpl.company}</span>
                        <span className="text-[#64748B] truncate max-w-[200px]">{tmpl.role}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Posting URL (Optional)
                  </label>
                  <Input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://careers.google.com/jobs/..."
                    className="text-xs bg-[#F8FAFC]"
                  />
                </div>

                {/* Job Textarea */}
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Job Description Content *
                  </label>
                  <Textarea
                    rows={10}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Paste full job description text here..."
                    className="text-xs bg-[#F8FAFC]"
                  />
                </div>

                <Button
                  onClick={handleAnalyzeJob}
                  disabled={isAnalyzingJob}
                  className="w-full shadow-sm text-xs"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  <span>{isAnalyzingJob ? "Extracting Details..." : "Extract Job Details"}</span>
                </Button>
              </div>
            </div>

            {/* Right Column: Output */}
            <div className="lg:col-span-7">
              {jobAnalysisResult ? (
                <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                    <div>
                      <span className="text-xs font-bold text-[#2563EB]">
                        {jobAnalysisResult.company || "Identified Company"}
                      </span>
                      <h2 className="text-xl font-bold text-[#0F172A] mt-0.5">
                        {jobAnalysisResult.role}
                      </h2>
                    </div>
                    <Badge variant="default">{jobAnalysisResult.work_mode || "Remote"}</Badge>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Role Summary
                    </h3>
                    <p className="text-xs text-[#0F172A]/80 leading-relaxed">
                      {jobAnalysisResult.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                      Required Technical Skills ({jobAnalysisResult.required_skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {jobAnalysisResult.required_skills.map((s) => (
                        <Badge key={s} variant="primary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {jobAnalysisResult.preferred_skills.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                        Preferred Qualifications
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {jobAnalysisResult.preferred_skills.map((s) => (
                          <Badge key={s} variant="accent">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-xs text-[#64748B]">
                      Stipend / Comp: <strong className="text-[#0F172A]">{jobAnalysisResult.stipend_or_salary}</strong>
                    </span>
                    <Link
                      href={`/resume-match?role=${encodeURIComponent(
                        jobAnalysisResult.role
                      )}&company=${encodeURIComponent(
                        jobAnalysisResult.company || ""
                      )}&skills=${encodeURIComponent(
                        jobAnalysisResult.required_skills.join(",")
                      )}`}
                    >
                      <Button size="sm">
                        <span>Match With Resume</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-white border border-[#E2E8F0] text-center shadow-sm space-y-2">
                  <FileText className="h-8 w-8 text-[#64748B] mx-auto" />
                  <h3 className="text-sm font-semibold text-[#0F172A]">No analysis yet</h3>
                  <p className="text-xs text-[#64748B]">
                    Paste a job description or choose a sample to extract structured criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

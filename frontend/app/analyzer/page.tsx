"use client";

import React, { useState } from "react";
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
  Cpu
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SAMPLE_JOB_TEMPLATES } from "@/lib/demo-data";
import { api } from "@/lib/api";
import { store } from "@/lib/storage";
import { JobAnalysis } from "@/types";
import { toast } from "sonner";

const LOADING_STEPS = [
  "Parsing raw text & scanning document hierarchy...",
  "Extracting required & preferred technical skills...",
  "Analyzing eligibility criteria, work mode & compensation...",
  "Synthesizing structured job profile & responsibilities..."
];

export default function AnalyzerPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<JobAnalysis | null>(null);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setDescription(text);
        toast.info("Pasted job description from clipboard");
      }
    } catch {
      toast.error("Clipboard access not available. Please paste with Ctrl+V / Cmd+V.");
    }
  };

  const handleSelectTemplate = (template: typeof SAMPLE_JOB_TEMPLATES[0]) => {
    setDescription(template.text);
    toast.info(`Loaded sample posting for ${template.company}`);
  };

  const handleAnalyze = async () => {
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Please enter at least 10 characters of job description text.");
      return;
    }

    setIsAnalyzing(true);
    setLoadingStepIdx(0);

    // Multi-stage animated loading progress
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 700);

    try {
      let result: JobAnalysis;
      // Try backend if online
      if (store.getIsBackendOnline()) {
        try {
          result = await api.analyzeJob(description, jobUrl || undefined);
        } catch (backendErr) {
          result = store.deterministicAnalyzeJob(description, jobUrl || undefined);
        }
      } else {
        // Deterministic engine
        await new Promise((r) => setTimeout(r, 1400));
        result = store.deterministicAnalyzeJob(description, jobUrl || undefined);
      }

      setAnalysisResult(result);
      toast.success("Job description successfully analyzed!");
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze job description");
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const handleSaveAsInternship = async () => {
    if (!analysisResult) return;
    try {
      await store.saveInternship({
        company: analysisResult.company || "Company",
        role: analysisResult.role,
        description: analysisResult.summary,
        location: analysisResult.location || "Remote",
        work_mode: analysisResult.work_mode || "Remote",
        stipend:
          analysisResult.stipend_or_salary !== "Not specified"
            ? analysisResult.stipend_or_salary
            : undefined,
        deadline:
          analysisResult.application_deadline !== "Not specified"
            ? analysisResult.application_deadline
            : undefined,
        job_url: jobUrl || undefined,
        required_skills: analysisResult.required_skills,
        preferred_skills: analysisResult.preferred_skills,
        eligibility:
          analysisResult.eligibility_criteria !== "Not specified"
            ? analysisResult.eligibility_criteria
            : undefined,
        is_saved: true
      });
      toast.success(`Saved "${analysisResult.role}" to My Internships!`);
    } catch {
      toast.error("Failed to save internship.");
    }
  };

  const handleSendToResumeMatch = () => {
    if (!analysisResult) return;
    const q = new URLSearchParams({
      role: analysisResult.role,
      company: analysisResult.company || "",
      skills: analysisResult.required_skills.join(",")
    });
    router.push(`/resume-match?${q.toString()}`);
  };

  const handleCopySummary = () => {
    if (!analysisResult) return;
    const text = `Role: ${analysisResult.role}\nCompany: ${analysisResult.company}\nRequired Skills: ${analysisResult.required_skills.join(", ")}\nSummary: ${analysisResult.summary}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied structured summary to clipboard!");
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-7 w-7 text-[#35D5F2]" />
            <span>AI Job Description Analyzer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Extract technical skills, eligibility criteria, compensation, and work mode from any internship posting.
          </p>
        </div>

        {/* Engine Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs self-start md:self-auto">
          <Cpu className="h-4 w-4 text-[#4F7CFF]" />
          <span className="text-slate-300">
            {store.getIsBackendOnline() ? "FastAPI Live Engine" : "Deterministic Semantic Fallback"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Load Sample Tech Posting
              </label>
              <div className="flex flex-col gap-1.5">
                {SAMPLE_JOB_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.company}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-white">{tmpl.company}</span>
                    <span className="text-slate-400 truncate max-w-[200px]">
                      {tmpl.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Original Posting URL (Optional)
              </label>
              <Input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://careers.company.com/job/..."
                className="text-xs"
              />
            </div>

            {/* Job Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Job Description Text *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="inline-flex items-center gap-1 text-[11px] text-[#4F7CFF] hover:underline"
                  >
                    <Clipboard className="h-3 w-3" />
                    <span>Paste</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDescription("")}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <Textarea
                rows={12}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the raw internship description here (e.g. responsibilities, requirements, qualifications)..."
                className="text-xs font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {description.length} characters
              </span>
            </div>

            <Button
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              className="w-full glow-blue"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span>{isAnalyzing ? "Analyzing..." : "Analyze Description"}</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Analysis Results */}
        <div className="lg:col-span-7">
          {isAnalyzing ? (
            /* Multi-step Animated Loading Skeleton */
            <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-[#4F7CFF] animate-pulse">
                <Sparkles className="h-8 w-8 animate-spin" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Running Neural Job Analyzer
                </h3>
                <p className="text-xs text-[#35D5F2] font-medium mt-2 animate-bounce">
                  {LOADING_STEPS[loadingStepIdx]}
                </p>
              </div>

              <div className="space-y-3 max-w-md mx-auto pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5 mx-auto" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : analysisResult ? (
            /* Structured Analysis Card */
            <div className="p-6 md:p-8 rounded-2xl bg-[#111827] border border-slate-800 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#4F7CFF]">
                      {analysisResult.company || "Identified Company"}
                    </span>
                    <Badge variant="default">{analysisResult.work_mode || "Remote"}</Badge>
                    {analysisResult.is_demo && (
                      <Badge variant="warning">Demo Output</Badge>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">
                    {analysisResult.role}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopySummary}>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span>Copy</span>
                  </Button>
                </div>
              </div>

              {/* Key Meta Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Location</span>
                  <p className="text-xs font-semibold text-white mt-0.5 truncate">
                    {analysisResult.location}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Work Mode</span>
                  <p className="text-xs font-semibold text-white mt-0.5 truncate">
                    {analysisResult.work_mode}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Stipend</span>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5 truncate">
                    {analysisResult.stipend_or_salary}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Deadline</span>
                  <p className="text-xs font-semibold text-amber-400 mt-0.5 truncate">
                    {analysisResult.application_deadline}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                  Opportunity Summary
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Required Skills */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Required Technical Skills ({analysisResult.required_skills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.required_skills.map((skill) => (
                    <Badge key={skill} variant="primary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              {analysisResult.preferred_skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Preferred / Nice-to-Have Skills ({analysisResult.preferred_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.preferred_skills.map((skill) => (
                      <Badge key={skill} variant="accent">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {analysisResult.responsibilities.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Core Responsibilities
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysisResult.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Eligibility */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Eligibility & Qualifications
                </h4>
                <p className="text-xs text-slate-300">
                  {analysisResult.eligibility_criteria}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <Button variant="secondary" onClick={() => setAnalysisResult(null)}>
                  Analyze Another
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleSaveAsInternship}>
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Save as Internship</span>
                  </Button>
                  <Button onClick={handleSendToResumeMatch} className="glow-blue">
                    <FileCheck className="h-4 w-4 mr-1" />
                    <span>Compare with Resume</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center max-w-md mx-auto my-12">
              <Sparkles className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">
                No Job Posting Analyzed Yet
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Paste a description from LinkedIn, Handshake, or company careers portals on the left, or select a pre-loaded sample.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

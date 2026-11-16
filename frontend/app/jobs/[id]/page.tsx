"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  FileText,
  UploadCloud,
  Bookmark,
  Share2,
  Calendar,
  Layers,
  GraduationCap,
  ShieldCheck,
  Check,
  AlertTriangle,
  Info
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { DatasetJob, JobMatchResultDetail } from "@/types";
import { store } from "@/lib/storage";
import { SAMPLE_RESUME_TEXT } from "@/lib/demo-data";
import { toast } from "sonner";

function JobDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [job, setJob] = useState<DatasetJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resume & Match State
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME_TEXT);
  const [resumeFileName, setResumeFileName] = useState("sample_student_resume.pdf");
  const [isUploading, setIsUploading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResultDetail | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadJobAndMatch = async () => {
      setIsLoading(true);
      try {
        const jobData = await api.getDatasetJob(id);
        setJob(jobData);

        // Auto-run AI match with current resume text
        if (resumeText) {
          const matchRes = await api.matchResumeWithJob({
            job_id: id,
            resume_text: resumeText
          });
          setMatchResult(matchRes.match_result);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load job details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadJobAndMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF resume file.");
      return;
    }

    setIsUploading(true);
    setResumeFileName(file.name);

    try {
      const matchRes = await api.matchResumeWithJob({
        job_id: id,
        file: file
      });
      setMatchResult(matchRes.match_result);

      // Extract text as well for display
      const parseRes = await api.parseResume(file);
      setResumeText(parseRes.parsed_data.raw_text);
      toast.success(`Matched ${file.name} against this role!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to match resume file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRecomputeMatch = async () => {
    if (!resumeText) {
      toast.info("Please provide resume text to calculate match.");
      return;
    }
    setIsMatching(true);
    try {
      const matchRes = await api.matchResumeWithJob({
        job_id: id,
        resume_text: resumeText
      });
      setMatchResult(matchRes.match_result);
      toast.success("AI Match score updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Match recomputation failed.");
    } finally {
      setIsMatching(false);
    }
  };

  const handleSaveToPipeline = async () => {
    if (!job) return;
    try {
      await store.saveApplication({
        company: job.company,
        role: job.job_title,
        status: "Applied",
        match_score: matchResult ? Math.round(matchResult.match_score) : 80,
        notes: `Applied from Hugging Face Jobs Dataset (${job.job_type || "General"}). Pay: ${job.pay || "N/A"}.`,
        applied_date: new Date().toISOString().split("T")[0],
        deadline: null
      });
      setIsSaved(true);
      toast.success(`Added ${job.job_title} at ${job.company} to your applications pipeline!`);
    } catch {
      toast.error("Failed to add to application pipeline.");
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto py-24 text-center space-y-4">
          <div className="h-8 w-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#64748B] text-xs">Loading job data & calculating match...</p>
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-[#0F172A]">Job Listing Not Found</h2>
          <p className="text-sm text-[#64748B]">The requested job could not be located in the dataset.</p>
          <Link href="/jobs">
            <Button>Back to Jobs Explorer</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const score = matchResult ? Math.round(matchResult.match_score) : 0;
  const scoreBadgeBg =
    score >= 75
      ? "text-[#16A34A] border-emerald-200 bg-emerald-50"
      : score >= 50
      ? "text-[#2563EB] border-blue-200 bg-blue-50"
      : "text-[#F59E0B] border-amber-200 bg-amber-50";

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Jobs Discovery
          </Link>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveToPipeline}
              size="sm"
              className="shadow-sm text-xs font-medium"
            >
              <Bookmark className={`h-3.5 w-3.5 mr-1.5 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved to Pipeline" : "Save to Application Pipeline"}
            </Button>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 lg:p-7 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {job.is_synthetic ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Synthetic Record (Augmented Split)
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Hugging Face Dataset · Original Sample
              </span>
            )}
            {job.job_type && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-[#2563EB] border border-blue-200">
                {job.job_type}
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono text-[#64748B] bg-slate-50 border border-[#E2E8F0]">
              Source: priyaagarwal19/Jobs-tabular-dataset
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
              {job.job_title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-[#64748B]">
              <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                <Building2 className="h-4 w-4 text-[#2563EB]" />
                {job.company}
              </span>
              {job.pay && (
                <span className="flex items-center gap-1.5 text-[#16A34A] font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {job.pay}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI RESUME MATCH SECTION */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 lg:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">AI Match & Skill Gap Analysis</h2>
                <p className="text-xs text-[#64748B]">
                  Calculated using TF-IDF Cosine Similarity & NLP Skill Overlap
                </p>
              </div>
            </div>

            {/* Resume Upload / Change Button */}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-[#0F172A] font-medium text-xs transition-colors">
                <UploadCloud className="h-4 w-4 text-[#2563EB]" />
                <span>{isUploading ? "Uploading..." : "Upload Different Resume (PDF)"}</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {matchResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Match Score Circle & TF-IDF Stats */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className={`h-32 w-32 rounded-full border-4 flex flex-col items-center justify-center shadow-sm ${scoreBadgeBg}`}>
                    <span className="text-3xl font-extrabold tracking-tight">
                      {score}%
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90 mt-0.5">
                      Match Score
                    </span>
                  </div>
                </div>

                <div className="space-y-1 w-full">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {score >= 75 ? "High Profile Alignment" : score >= 50 ? "Moderate Qualification Match" : "Skill Gap Identified"}
                  </span>
                  <div className="text-[11px] text-[#64748B] space-y-1 pt-2 border-t border-[#E2E8F0]">
                    <div className="flex justify-between">
                      <span>TF-IDF Cosine Similarity:</span>
                      <span className="text-[#0F172A] font-mono font-medium">{(matchResult.tfidf_similarity * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skill Overlap Ratio:</span>
                      <span className="text-[#0F172A] font-mono font-medium">{(matchResult.skill_overlap_ratio * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Matched Skills, Missing Skills & AI Recommendation */}
              <div className="lg:col-span-8 space-y-5">
                {/* Matched Skills */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A] uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Matched Skills ({matchResult.matched_skills.length})</span>
                  </div>
                  {matchResult.matched_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.matched_skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          <Check className="h-3 w-3 text-emerald-600" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748B] italic">No direct keyword skill matches detected.</p>
                  )}
                </div>

                {/* Missing Skills */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626] uppercase tracking-wider">
                    <XCircle className="h-4 w-4" />
                    <span>Missing Skills to Learn ({matchResult.missing_skills.length})</span>
                  </div>
                  {matchResult.missing_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missing_skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                        >
                          <AlertTriangle className="h-3 w-3 text-[#DC2626]" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#16A34A] font-medium">
                      Zero missing skills! Your profile satisfies all extracted core technical requirements.
                    </p>
                  )}
                </div>

                {/* Qualification Comparison */}
                {matchResult.qualification_match && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#0F172A] flex items-start gap-2.5">
                    <GraduationCap className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0F172A]">Qualification Comparison: </strong>
                      {matchResult.qualification_match}
                    </div>
                  </div>
                )}

                {/* AI-Generated Improvement Recommendation */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-[#0F172A] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2563EB] uppercase tracking-wider text-[11px]">
                    <Lightbulb className="h-4 w-4" />
                    <span>AI Improvement Recommendation</span>
                  </div>
                  <p className="text-xs text-[#0F172A]/90 leading-relaxed font-normal">
                    {matchResult.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Button onClick={handleRecomputeMatch} size="sm">
                Calculate AI Match
              </Button>
            </div>
          )}
        </div>

        {/* Detailed Job Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-2.5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 uppercase tracking-wide">
              <FileText className="h-4 w-4 text-[#2563EB]" />
              Job Description
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed whitespace-pre-line">
              {job.description || "No detailed description provided."}
            </p>
          </div>

          {/* Duties & Responsibilities */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-2.5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 uppercase tracking-wide">
              <Briefcase className="h-4 w-4 text-[#2563EB]" />
              Duties & Responsibilities
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed whitespace-pre-line">
              {job.duties || "Duties not specifically itemized."}
            </p>
          </div>

          {/* Qualifications */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-2.5 shadow-sm md:col-span-2">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 uppercase tracking-wide">
              <GraduationCap className="h-4 w-4 text-[#2563EB]" />
              Qualifications & Requirements
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed whitespace-pre-line">
              {job.qualifications || "No specific qualifications listed."}
            </p>
          </div>
        </div>

        {/* Interactive Resume Text Review / Tweaker */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#64748B]" />
              <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wide">
                Candidate Resume Text in Analysis
              </h3>
            </div>
            <Button
              size="sm"
              onClick={handleRecomputeMatch}
              disabled={isMatching}
              className="text-xs h-7"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {isMatching ? "Recalculating..." : "Recalculate AI Match"}
            </Button>
          </div>

          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={5}
            className="bg-[#F8FAFC] border-[#E2E8F0] text-xs font-mono text-[#0F172A]"
            placeholder="Paste resume text to test matching against this job..."
          />
        </div>
      </div>
    </AppShell>
  );
}

export default function JobDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] text-[#64748B] p-8 text-center flex items-center justify-center text-sm">
          Loading job details & AI matching...
        </div>
      }
    >
      <JobDetailContent />
    </React.Suspense>
  );
}

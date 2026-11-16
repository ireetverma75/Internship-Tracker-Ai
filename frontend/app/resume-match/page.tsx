"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileCheck,
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookOpen,
  Info,
  ShieldCheck,
  ChevronDown,
  Layers,
  GraduationCap,
  ArrowRight,
  Send,
  BarChart3
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MatchScoreRing } from "@/components/resume/match-score-ring";
import { SAMPLE_RESUME_TEXT } from "@/lib/demo-data";
import { store } from "@/lib/storage";
import { api } from "@/lib/api";
import { Internship, ResumeMatchResult } from "@/types";
import { toast } from "sonner";

function ResumeMatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "";
  const initialCompany = searchParams.get("company") || "";
  const initialSkills = searchParams.get("skills") || "";

  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>("");

  // Target Role & Requirements
  const [targetRole, setTargetRole] = useState(initialRole || "Software Engineering Intern");
  const [targetCompany, setTargetCompany] = useState(initialCompany || "Microsoft");
  const [requiredSkills, setRequiredSkills] = useState(
    initialSkills || "Python, C++, Distributed Systems, Azure, Docker"
  );
  const [preferredSkills, setPreferredSkills] = useState("Kubernetes, Linux, System Design");

  // Resume State
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME_TEXT);
  const [uploadedFileName, setUploadedFileName] = useState<string>("alex_chen_resume.pdf");
  const [isUploading, setIsUploading] = useState(false);

  // Match Result
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<ResumeMatchResult | null>(null);

  // Personalized Recommendations
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const handleGetRecommendations = async () => {
    setIsLoadingRecs(true);
    try {
      const res = await api.getJobRecommendations({
        resume_text: resumeText,
        top_n: 4,
        include_synthetic: false
      });
      setRecommendations(res.recommendations);
      toast.success(`Fetched ${res.recommendations.length} recommended opportunities for your skills!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load recommendations";
      toast.error(msg);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleTrackTargetRole = async () => {
    await store.saveApplication({
      company: targetCompany,
      role: targetRole,
      status: "Saved",
      match_score: matchResult?.match_score ?? 85,
      notes: `Target role matched from AI Benchmark. Required skills: ${requiredSkills}.`
    });
    toast.success(`Added ${targetCompany} (${targetRole}) to your applications pipeline!`);
  };

  useEffect(() => {
    store.getInternships().then((list) => {
      setInternships(list);
      if (initialRole) {
        const found = list.find((i) => i.role === initialRole);
        if (found) setSelectedInternshipId(found.id);
      }
    });
  }, [initialRole]);

  const handleSelectInternship = (id: string) => {
    setSelectedInternshipId(id);
    const found = internships.find((i) => i.id === id);
    if (found) {
      setTargetRole(found.role);
      setTargetCompany(found.company);
      setRequiredSkills((found.required_skills || []).join(", "));
      setPreferredSkills((found.preferred_skills || []).join(", "));
      toast.info(`Configured requirements for ${found.company} — ${found.role}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF document (.pdf).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF exceeds 10MB maximum limit.");
      return;
    }

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      if (store.getIsBackendOnline()) {
        const res = await api.parseResume(file);
        setResumeText(res.extracted_text);
        if (res.warning) toast.warning(res.warning);
        else toast.success(`Extracted ${res.word_count} words from ${res.filename}`);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        setResumeText(SAMPLE_RESUME_TEXT);
        toast.success(`Loaded "${file.name}" for demonstration.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunMatch = async () => {
    if (!resumeText.trim() || resumeText.length < 20) {
      toast.error("Resume content is too brief to analyze.");
      return;
    }

    const reqSkillsList = requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const prefSkillsList = preferredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setIsMatching(true);
    try {
      let result: ResumeMatchResult;
      if (store.getIsBackendOnline()) {
        try {
          result = await api.matchResume({
            resume_text: resumeText,
            job_role: targetRole,
            job_company: targetCompany,
            required_skills: reqSkillsList,
            preferred_skills: prefSkillsList
          });
        } catch {
          result = store.deterministicMatchResume(
            resumeText,
            targetRole,
            targetCompany,
            reqSkillsList,
            prefSkillsList
          );
        }
      } else {
        await new Promise((r) => setTimeout(r, 800));
        result = store.deterministicMatchResume(
          resumeText,
          targetRole,
          targetCompany,
          reqSkillsList,
          prefSkillsList
        );
      }

      setMatchResult(result);
      toast.success("Match report generated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to match resume");
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Resume Matching Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <span>AI Job Matching & Qualification Benchmark</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl">
            Compare candidate resume against target job requirements with transparent scoring, matched skills, and tailored suggestions.
          </p>
        </div>

        {/* Fast Action */}
        <Button
          onClick={() => {
            setResumeText(SAMPLE_RESUME_TEXT);
            setUploadedFileName("student_sample_resume.pdf");
            toast.info("Pre-loaded sample student resume");
          }}
          variant="secondary"
          size="sm"
          className="self-start md:self-auto"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#2563EB]" />
          <span>Reload Sample Candidate Resume</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Configuration (Resume + Target Job) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Job Configuration */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
              <span>1. Target Role & Requirements</span>
            </h3>

            {/* Select from existing */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Select from Discovered Internships
              </label>
              <select
                value={selectedInternshipId}
                onChange={(e) => handleSelectInternship(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">-- Choose an opportunity to autofill --</option>
                {internships.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.company} — {item.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Company
                </label>
                <Input
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Microsoft"
                  className="text-xs bg-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Role Title
                </label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. SWE Intern"
                  className="text-xs bg-[#F8FAFC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Required Technical Skills (comma-separated) *
              </label>
              <Input
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="Python, C++, Azure, Docker"
                className="text-xs bg-[#F8FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Preferred Skills (comma-separated)
              </label>
              <Input
                value={preferredSkills}
                onChange={(e) => setPreferredSkills(e.target.value)}
                placeholder="Kubernetes, Linux, System Design"
                className="text-xs bg-[#F8FAFC]"
              />
            </div>
          </div>

          {/* Resume Upload / Inspection */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              <span>2. Candidate Resume</span>
            </h3>

            {/* Drag & Drop Box */}
            <div className="relative border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] rounded-xl p-4 text-center bg-[#F8FAFC] transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                <UploadCloud className="h-7 w-7 text-[#2563EB] mb-1.5" />
                <span className="text-xs font-semibold text-[#0F172A]">
                  Upload PDF Resume (PyMuPDF Extractor)
                </span>
                <span className="text-[11px] text-[#64748B] mt-0.5">
                  Drag and drop or click to browse (Max 10MB)
                </span>
              </div>
            </div>

            {/* Current Loaded Resume Status */}
            {uploadedFileName && (
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-[#2563EB] shrink-0" />
                  <span className="font-semibold text-[#0F172A] truncate">
                    {uploadedFileName}
                  </span>
                </div>
                <Badge variant="primary">Ready</Badge>
              </div>
            )}

            {/* Resume Text Area Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#0F172A]">
                  Extracted Resume Text
                </label>
                <button
                  type="button"
                  onClick={() => setResumeText("")}
                  className="text-[11px] text-[#64748B] hover:text-[#DC2626] inline-flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>
              <Textarea
                rows={7}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste or review extracted resume text..."
                className="text-xs font-mono bg-[#F8FAFC]"
              />
            </div>

            <Button
              onClick={handleRunMatch}
              isLoading={isMatching}
              className="w-full shadow-sm"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span>{isMatching ? "Computing Match..." : "Run AI Match Analysis"}</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Match Analysis Report */}
        <div className="lg:col-span-7">
          {isMatching ? (
            <div className="p-12 rounded-2xl bg-white border border-[#E2E8F0] text-center space-y-4 shadow-sm">
              <div className="h-14 w-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-[#2563EB] animate-pulse">
                <FileCheck className="h-7 w-7 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Evaluating Skill Overlap & Credentials...
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Comparing required vs preferred skills, inspecting relevant experience evidence, and generating optimization suggestions.
              </p>
            </div>
          ) : matchResult ? (
            /* Complete Report */
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-6">
              {/* Report Header with Score Ring */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xs font-bold text-[#2563EB]">
                      {targetCompany}
                    </span>
                    {matchResult.is_demo && (
                      <Badge variant="warning">Demo Matching Result</Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                    {targetRole}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Transparent Technical Requirements Compatibility Report
                  </p>
                </div>

                <div className="shrink-0">
                  <MatchScoreRing score={matchResult.match_score} />
                </div>
              </div>

              {/* Skills Comparison Cards */}
              {(() => {
                const matchedReq = matchResult.matched_required_skills || (matchResult as any).matched_skills || [];
                const missingReq = matchResult.missing_required_skills || (matchResult as any).missing_skills || [];
                const prefFound = matchResult.preferred_skills_found || [];
                const evidence = matchResult.relevant_experience_evidence || [];
                const tips = matchResult.resume_improvement_suggestions || (matchResult as any).recommendations || [];
                const upskill = matchResult.recommended_skills_to_learn || [];

                return (
                  <>
                    {/* Horizontal Progress Bars */}
                    <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                        Alignment Breakdown
                      </h4>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
                          <span>Required Skills Overlap</span>
                          <span>{Math.round((matchedReq.length / Math.max(1, matchedReq.length + missingReq.length)) * 100)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-[#16A34A] rounded-full transition-all"
                            style={{ width: `${Math.round((matchedReq.length / Math.max(1, matchedReq.length + missingReq.length)) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
                          <span>Preferred / Bonus Skills</span>
                          <span>{prefFound.length > 0 ? "Detected" : "None"}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-[#38BDF8] rounded-full transition-all"
                            style={{ width: `${Math.min(100, prefFound.length * 35)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Matched Required Skills */}
                      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            Matched Skills ({matchedReq.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {matchedReq.length === 0 ? (
                            <span className="text-xs text-[#64748B]">None detected</span>
                          ) : (
                            matchedReq.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded text-xs bg-white text-emerald-800 border border-emerald-200 font-medium"
                              >
                                {s}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Missing Required Skills */}
                      <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626]">
                          <XCircle className="h-4 w-4" />
                          <span>
                            Missing Skills ({missingReq.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {missingReq.length === 0 ? (
                            <span className="text-xs text-[#16A34A] font-medium">All required skills matched!</span>
                          ) : (
                            missingReq.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded text-xs bg-white text-rose-800 border border-rose-200 font-medium"
                              >
                                {s}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Preferred Skills */}
                    {prefFound.length > 0 && (
                      <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] mb-2">
                          <Sparkles className="h-4 w-4" />
                          <span>Bonus / Preferred Skills Detected</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {prefFound.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded text-xs bg-white text-[#2563EB] border border-sky-200 font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Relevant Experience Evidence */}
                    {evidence.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-[#2563EB]" />
                          <span>Resume Text Evidence Extracts</span>
                        </h4>
                        <div className="space-y-2">
                          {evidence.map((snippet, idx) => (
                            <blockquote
                              key={idx}
                              className="p-3 rounded-xl bg-[#F8FAFC] border-l-2 border-[#2563EB] text-xs text-[#0F172A] italic"
                            >
                              "{snippet}"
                            </blockquote>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actionable Resume Improvement Suggestions */}
                    {tips.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Lightbulb className="h-4 w-4 text-[#F59E0B]" />
                          <span>Tailored Optimization Suggestions</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-[#0F172A]">
                          {tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/60 border border-blue-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] shrink-0 mt-1.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Skills to Learn */}
                    {upskill.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                          Recommended Technologies to Upskill
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {upskill.map((skill) => (
                            <Badge key={skill} variant="warning">
                              + {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scoring Methodology & Privacy Disclaimer */}
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                        <Info className="h-3.5 w-3.5 text-[#2563EB]" />
                        <span>Methodology & Disclaimer</span>
                      </div>
                      <p>{matchResult.scoring_explanation || "Transparent technical requirements compatibility evaluation."}</p>
                      <p className="text-[#64748B] text-[10px] pt-1">
                        Privacy Notice: Resume text is processed strictly in-memory for this evaluation. No persistent document storage is maintained without explicit consent.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-[#E2E8F0] text-center max-w-md mx-auto my-12 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-[#64748B]">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-[#0F172A]">
                No Resume Match Generated Yet
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Configure your target role and requirements on the left, then click "Run AI Match Analysis".
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function ResumeMatchPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] text-[#64748B] p-8 text-center text-sm">Loading resume match engine...</div>}>
      <ResumeMatchContent />
    </React.Suspense>
  );
}

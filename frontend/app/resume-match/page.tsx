"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  ChevronDown
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MatchScoreRing } from "@/components/resume/match-score-ring";
import { SAMPLE_RESUME_TEXT } from "@/lib/demo-data";
import { store, NOTIFY_CHANGE_EVENT } from "@/lib/storage";
import { api } from "@/lib/api";
import { Internship, ResumeMatchResult } from "@/types";
import { toast } from "sonner";

function ResumeMatchContent() {
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
      // If backend is running, parse using PyMuPDF endpoint
      if (store.getIsBackendOnline()) {
        const res = await api.parseResumePdf(file);
        setResumeText(res.extracted_text);
        if (res.warning) toast.warning(res.warning);
        else toast.success(`Extracted ${res.word_count} words from ${res.filename}`);
      } else {
        // Standalone browser demonstration fallback:
        // Read text preview or use extracted sample text
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
        await new Promise((r) => setTimeout(r, 900));
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileCheck className="h-7 w-7 text-emerald-400" />
            <span>AI Resume Match & Gap Analysis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compare candidate resume against target job requirements with transparent scoring, matched skills, and tailored suggestions.
          </p>
        </div>

        {/* Fast Action */}
        <Button
          onClick={() => {
            setResumeText(SAMPLE_RESUME_TEXT);
            setUploadedFileName("alex_chen_sample_resume.pdf");
            toast.info("Pre-loaded Alex Chen CS resume");
          }}
          variant="secondary"
          size="sm"
          className="self-start md:self-auto"
        >
          <Sparkles className="h-4 w-4 mr-1 text-[#35D5F2]" />
          <span>Reload Sample Candidate Resume</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Configuration (Resume + Target Job) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Job Configuration */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4F7CFF]" />
              <span>1. Target Role & Requirements</span>
            </h3>

            {/* Select from existing */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select from Discovered Internships
              </label>
              <select
                value={selectedInternshipId}
                onChange={(e) => handleSelectInternship(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900 px-3 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company
                </label>
                <Input
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Microsoft"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role Title
                </label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. SWE Intern"
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Required Technical Skills (comma-separated) *
              </label>
              <Input
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="Python, C++, Azure, Docker"
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preferred Skills (comma-separated)
              </label>
              <Input
                value={preferredSkills}
                onChange={(e) => setPreferredSkills(e.target.value)}
                placeholder="Kubernetes, Linux, System Design"
                className="text-xs"
              />
            </div>
          </div>

          {/* Resume Upload / Inspection */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>2. Candidate Resume</span>
            </h3>

            {/* Drag & Drop Box */}
            <div className="relative border-2 border-dashed border-slate-700/80 hover:border-[#4F7CFF] rounded-2xl p-4 text-center bg-slate-900/60 transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                <UploadCloud className="h-8 w-8 text-[#4F7CFF] mb-2" />
                <span className="text-xs font-semibold text-white">
                  Upload PDF Resume (PyMuPDF Extractor)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Drag and drop or click to browse (Max 10MB)
                </span>
              </div>
            </div>

            {/* Current Loaded Resume Status */}
            {uploadedFileName && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-[#35D5F2] shrink-0" />
                  <span className="font-semibold text-white truncate">
                    {uploadedFileName}
                  </span>
                </div>
                <Badge variant="accent">Ready</Badge>
              </div>
            )}

            {/* Resume Text Area Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Extracted Resume Text
                </label>
                <button
                  type="button"
                  onClick={() => setResumeText("")}
                  className="text-[11px] text-slate-400 hover:text-rose-400 inline-flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>
              <Textarea
                rows={8}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste or review extracted resume text..."
                className="text-xs font-mono"
              />
            </div>

            <Button
              onClick={handleRunMatch}
              isLoading={isMatching}
              className="w-full glow-blue"
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
            <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                <FileCheck className="h-8 w-8 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white">
                Evaluating Skill Overlap & Credentials...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Comparing required vs preferred skills, inspecting relevant experience evidence, and generating optimization suggestions.
              </p>
            </div>
          ) : matchResult ? (
            /* Complete Report */
            <div className="p-6 md:p-8 rounded-2xl bg-[#111827] border border-slate-800 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Report Header with Score Ring */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xs font-bold text-[#4F7CFF]">
                      {targetCompany}
                    </span>
                    {matchResult.is_demo && (
                      <Badge variant="warning">Demo Matching Result</Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {targetRole}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Transparent Technical Requirements Compatibility Report
                  </p>
                </div>

                <div className="shrink-0">
                  <MatchScoreRing score={matchResult.match_score} />
                </div>
              </div>

              {/* Skills Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Matched Required Skills */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Matched Required Skills ({matchResult.matched_required_skills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchResult.matched_required_skills.length === 0 ? (
                      <span className="text-xs text-slate-500">None detected</span>
                    ) : (
                      matchResult.matched_required_skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium"
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Missing Required Skills */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/25 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <XCircle className="h-4 w-4" />
                    <span>
                      Missing Required Skills ({matchResult.missing_required_skills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchResult.missing_required_skills.length === 0 ? (
                      <span className="text-xs text-emerald-400">All required skills matched!</span>
                    ) : (
                      matchResult.missing_required_skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded text-xs bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium"
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Preferred Skills */}
              {matchResult.preferred_skills_found.length > 0 && (
                <div className="p-4 rounded-xl bg-[#35D5F2]/10 border border-[#35D5F2]/25">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#35D5F2] mb-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Bonus / Preferred Skills Detected</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.preferred_skills_found.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-xs bg-[#35D5F2]/20 text-[#35D5F2] border border-[#35D5F2]/30 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant Experience Evidence */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#4F7CFF]" />
                  <span>Resume Text Evidence Extracts</span>
                </h4>
                <div className="space-y-2">
                  {matchResult.relevant_experience_evidence.map((snippet, idx) => (
                    <blockquote
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border-l-2 border-[#4F7CFF] text-xs text-slate-300 italic"
                    >
                      "{snippet}"
                    </blockquote>
                  ))}
                </div>
              </div>

              {/* Actionable Resume Improvement Suggestions */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span>Tailored Optimization Suggestions</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {matchResult.resume_improvement_suggestions.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Skills to Learn */}
              {matchResult.recommended_skills_to_learn.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Recommended Technologies to Upskill
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.recommended_skills_to_learn.map((skill) => (
                      <Badge key={skill} variant="warning">
                        + {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Scoring Methodology & Privacy Disclaimer */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Info className="h-3.5 w-3.5 text-[#4F7CFF]" />
                  <span>Methodology & Disclaimer</span>
                </div>
                <p>{matchResult.scoring_explanation}</p>
                <p className="text-slate-500 text-[10px] pt-1">
                  Privacy Notice: Resume text is processed strictly in-memory for this evaluation. No persistent document storage is maintained without explicit consent.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center max-w-md mx-auto my-12">
              <FileCheck className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">
                No Resume Match Generated Yet
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
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
    <React.Suspense fallback={<div className="min-h-screen bg-[#0B1020] text-slate-400 p-8 text-center">Loading resume match engine...</div>}>
      <ResumeMatchContent />
    </React.Suspense>
  );
}

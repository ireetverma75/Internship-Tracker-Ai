"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Sparkles,
  Building2,
  DollarSign,
  GraduationCap,
  Layers,
  Database,
  ArrowUpDown,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Info
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { DatasetJob, JobMatchResultDetail } from "@/types";
import { toast } from "sonner";
import { store } from "@/lib/storage";

function JobsDiscoveryContent() {
  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [jobTypeFilter, setJobTypeFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("");
  const [splitFilter, setSplitFilter] = useState<"all" | "original" | "augmented">("original");

  // Pagination & Data State
  const [jobs, setJobs] = useState<DatasetJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);

  // Resume Matching State
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isMatchingBatch, setIsMatchingBatch] = useState(false);
  const [matchResultsMap, setMatchResultsMap] = useState<Record<string, JobMatchResultDetail>>({});

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const isSyntheticParam =
        splitFilter === "original" ? false : splitFilter === "augmented" ? true : undefined;

      const res = await api.getDatasetJobs({
        query: searchQuery || undefined,
        job_title: jobTitleFilter || undefined,
        company: companyFilter !== "All" ? companyFilter : undefined,
        job_type: jobTypeFilter !== "All" ? jobTypeFilter : undefined,
        skill: skillFilter || undefined,
        is_synthetic: isSyntheticParam,
        page: currentPage,
        limit: 12
      });

      setJobs(res.jobs);
      setTotalJobs(res.total);
      setTotalPages(res.total_pages);
      if (res.job_types.length > 0) setJobTypes(res.job_types);
      if (res.companies.length > 0) setCompanies(res.companies);
    } catch (err: any) {
      toast.error(err.message || "Failed to load jobs from dataset.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, splitFilter, companyFilter, jobTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setJobTitleFilter("");
    setCompanyFilter("All");
    setJobTypeFilter("All");
    setSkillFilter("");
    setSplitFilter("original");
    setCurrentPage(1);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF resume file.");
      return;
    }

    setIsUploadingResume(true);
    setResumeFileName(file.name);

    try {
      const res = await api.parseResume(file);
      setResumeText(res.parsed_data.raw_text);
      toast.success(`Parsed resume: ${file.name}`);
      await runBatchMatch(res.parsed_data.raw_text);
    } catch (err: any) {
      toast.error(err.message || "Resume upload failed.");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const runBatchMatch = async (textToUse?: string) => {
    const activeText = textToUse || resumeText;
    if (!activeText) {
      toast.info("Please upload your resume to run matching.");
      return;
    }

    setIsMatchingBatch(true);
    try {
      const res = await api.getJobRecommendations({
        resume_text: activeText,
        top_n: 15,
        include_synthetic: splitFilter !== "original"
      });

      const map: Record<string, JobMatchResultDetail> = {};
      for (const m of res.recommendations) {
        map[m.job_id] = m;
      }
      setMatchResultsMap(map);
      toast.success(`Computed AI match scores for ${res.recommendations.length} opportunities!`);
    } catch (err: any) {
      toast.error(err.message || "Batch matching failed.");
    } finally {
      setIsMatchingBatch(false);
    }
  };

  const handleSaveToPipeline = async (job: DatasetJob) => {
    try {
      const match = matchResultsMap[job.id];
      await store.saveApplication({
        company: job.company,
        role: job.job_title,
        status: "Saved",
        match_score: match ? Math.round(match.match_score) : 75,
        notes: `Saved from Hugging Face Jobs Dataset (${job.job_type || "General"}). Pay: ${job.pay || "Not specified"}.`,
        applied_date: null,
        deadline: null
      });
      toast.success(`Added ${job.job_title} at ${job.company} to your applications pipeline!`);
    } catch {
      toast.error("Failed to save application.");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 lg:p-7 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold mb-2.5">
                <Database className="h-3.5 w-3.5" />
                <span>Hugging Face Jobs Tabular Dataset Integration</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
                Internship & Job Discovery Engine
              </h1>
              <p className="mt-1.5 text-xs md:text-sm text-[#64748B] max-w-2xl leading-relaxed">
                Explore listings from the <span className="text-[#2563EB] font-mono font-medium">priyaagarwal19/Jobs-tabular-dataset</span> repository.
                Upload your resume to calculate genuine TF-IDF cosine similarity scores and uncover skill gaps.
              </p>
            </div>

            {/* Quick Resume Upload Widget */}
            <div className="shrink-0 flex flex-col gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl min-w-[270px]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
                  AI Resume Matcher
                </span>
                {resumeFileName && (
                  <span className="text-[#16A34A] font-mono text-[11px] truncate max-w-[110px]">
                    {resumeFileName}
                  </span>
                )}
              </div>

              <label className="cursor-pointer flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all">
                <UploadCloud className="h-4 w-4" />
                <span>{isUploadingResume ? "Analyzing PDF..." : resumeFileName ? "Replace Resume PDF" : "Upload PDF Resume"}</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleResumeUpload}
                  disabled={isUploadingResume}
                />
              </label>

              {resumeText && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runBatchMatch()}
                  disabled={isMatchingBatch}
                  className="h-7 text-xs border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isMatchingBatch ? "animate-spin" : ""}`} />
                  {isMatchingBatch ? "Recomputing Matches..." : "Re-score Listings"}
                </Button>
              )}
            </div>
          </div>

          {/* Dataset Status Notice */}
          <div className="mt-5 pt-3.5 border-t border-[#E2E8F0] flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
            <span className="flex items-center gap-1.5 text-[#0F172A]">
              <Info className="h-3.5 w-3.5 text-[#2563EB]" />
              <strong>Dataset Attribution:</strong> Static reference dataset. Historical sample data; not live employer postings.
            </span>
            <span className="text-[#E2E8F0]">|</span>
            <span>Original Split: <strong className="text-[#0F172A]">391 Real-world Listings</strong></span>
            <span className="text-[#E2E8F0]">|</span>
            <span>Augmented Split: <strong className="text-[#0F172A]">1,600 Synthetic Records</strong></span>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-3.5 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across title, company, duties, or requirements..."
                className="pl-10 bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#64748B] focus:bg-white text-xs"
              />
            </div>
            <div className="relative md:w-64">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                value={jobTitleFilter}
                onChange={(e) => setJobTitleFilter(e.target.value)}
                placeholder="Job title filter..."
                className="pl-10 bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#64748B] focus:bg-white text-xs"
              />
            </div>
            <Button
              type="submit"
              className="px-5 font-medium text-xs shadow-sm"
            >
              Search
            </Button>
          </form>

          {/* Secondary Filter Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
            {/* Split Switcher */}
            <div className="flex items-center rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-0.5">
              <button
                type="button"
                onClick={() => { setSplitFilter("original"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  splitFilter === "original"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Real-World (391)
              </button>
              <button
                type="button"
                onClick={() => { setSplitFilter("all"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  splitFilter === "all"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                All Listings
              </button>
              <button
                type="button"
                onClick={() => { setSplitFilter("augmented"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  splitFilter === "augmented"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Synthetic Only (1.6k)
              </button>
            </div>

            {/* Job Type Dropdown */}
            <select
              value={jobTypeFilter}
              onChange={(e) => { setJobTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-[#E2E8F0] text-[#0F172A] rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="All">All Job Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Company Dropdown */}
            <select
              value={companyFilter}
              onChange={(e) => { setCompanyFilter(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-[#E2E8F0] text-[#0F172A] rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB] max-w-[180px] truncate"
            >
              <option value="All">All Companies</option>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Skill Filter Input */}
            <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1">
              <span className="text-[#64748B] font-medium">Skill:</span>
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); fetchJobs(); } }}
                placeholder="e.g. Python, Docker, SQL"
                className="bg-transparent text-[#0F172A] placeholder:text-[#64748B] focus:outline-none text-xs w-36"
              />
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || jobTitleFilter || companyFilter !== "All" || jobTypeFilter !== "All" || skillFilter || splitFilter !== "original") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs text-[#DC2626] hover:bg-rose-50"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Counter & Active Match Status */}
        <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
          <div>
            Showing <span className="text-[#0F172A] font-semibold">{jobs.length}</span> of{" "}
            <span className="text-[#0F172A] font-semibold">{totalJobs}</span> matching opportunities
          </div>
          {Object.keys(matchResultsMap).length > 0 && (
            <div className="flex items-center gap-1.5 text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Matching active against your resume</span>
            </div>
          )}
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 rounded-xl border border-[#E2E8F0] bg-white p-5 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-6 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-12 bg-slate-100 rounded w-full mt-4" />
                </div>
                <div className="h-8 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center space-y-4 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-[#64748B]">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">No job listings found</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              No dataset records matched your query. Try broadening your search or resetting filters.
            </p>
            <Button onClick={handleClearFilters} variant="outline" size="sm">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                matchResult={matchResultsMap[job.id]}
                onQuickMatch={() => {
                  if (!resumeText) {
                    toast.info("Please upload a resume first using the button above.");
                  } else {
                    api.matchResumeWithJob({ job_id: job.id, resume_text: resumeText })
                      .then((res) => {
                        setMatchResultsMap((prev) => ({ ...prev, [job.id]: res.match_result }));
                        toast.success(`${job.job_title}: ${Math.round(res.match_result.match_score)}% match calculated!`);
                      })
                      .catch((err) => toast.error(err.message || "Match calculation failed."));
                  }
                }}
                onSaveToPipeline={handleSaveToPipeline}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#E2E8F0]">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs text-[#64748B]">
              Page <strong className="text-[#0F172A]">{currentPage}</strong> of <strong className="text-[#0F172A]">{totalPages}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function JobsDiscoveryPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] text-[#64748B] p-8 text-center flex items-center justify-center text-sm">
          Loading Jobs Discovery Dashboard...
        </div>
      }
    >
      <JobsDiscoveryContent />
    </React.Suspense>
  );
}

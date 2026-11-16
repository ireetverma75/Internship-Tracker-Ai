"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  DollarSign,
  Sparkles,
  ArrowRight,
  Bookmark
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatasetJob, JobMatchResultDetail } from "@/types";

interface JobCardProps {
  job: DatasetJob;
  matchResult?: JobMatchResultDetail;
  onQuickMatch?: (job: DatasetJob) => void;
  onSaveToPipeline?: (job: DatasetJob) => void;
  isSaved?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  matchResult,
  onQuickMatch,
  onSaveToPipeline,
  isSaved = false
}) => {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all duration-150 hover:border-slate-300 hover:shadow-sm">
      {/* Top Meta & Badges */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {job.is_synthetic ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-[#D97706] border border-amber-200">
                Synthetic
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                HF Dataset
              </span>
            )}
            {job.job_type && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-[#2563EB] border border-blue-100">
                {job.job_type}
              </span>
            )}
          </div>

          {matchResult ? (
            <div className="shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] font-bold text-xs">
              <Sparkles className="h-3 w-3 text-[#2563EB]" />
              <span>{Math.round(matchResult.match_score)}% Match</span>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuickMatch?.(job)}
              className="h-7 text-xs text-slate-500 hover:text-[#2563EB] hover:bg-blue-50"
              title="Calculate AI Match Percentage"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Match
            </Button>
          )}
        </div>

        {/* Job Title & Company */}
        <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-1">
          {job.job_title}
        </h3>

        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600">
          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{job.company}</span>
        </div>

        {/* Pay Information */}
        {job.pay && (
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span>{job.pay}</span>
          </div>
        )}

        {/* Qualifications Snippet */}
        {job.qualifications && (
          <div className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            <span className="text-slate-700 font-medium">Requirements: </span>
            {job.qualifications}
          </div>
        )}

        {/* Key Skills Tags */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium border border-slate-200"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          View Details & Match
          <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {onSaveToPipeline && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSaveToPipeline(job)}
            className="h-7 text-xs text-slate-500 hover:text-slate-900"
          >
            <Bookmark className={`h-3.5 w-3.5 mr-1 ${isSaved ? "fill-current text-[#2563EB]" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>
        )}
      </div>
    </div>
  );
};

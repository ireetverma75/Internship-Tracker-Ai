"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Send,
  FileCheck
} from "lucide-react";
import { Internship } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { store } from "@/lib/storage";
import { toast } from "sonner";

interface InternshipCardProps {
  internship: Internship;
  viewMode?: "grid" | "list";
  onEdit: (item: Internship) => void;
  onDelete: (id: string) => void;
  onApplyPipeline: (item: Internship) => void;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  viewMode = "grid",
  onEdit,
  onDelete,
  onApplyPipeline
}) => {
  const [isSaved, setIsSaved] = useState(internship.is_saved ?? false);
  const timing = getDaysRemaining(internship.deadline);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isSaved;
    setIsSaved(nextState);
    await store.updateInternship(internship.id, { is_saved: nextState });
    toast.success(
      nextState
        ? `Saved ${internship.company} to bookmarks`
        : `Removed ${internship.company} from bookmarks`
    );
  };

  const urgencyBadge = {
    overdue: "danger",
    urgent: "warning",
    soon: "warning",
    future: "default",
    none: "default"
  }[timing.urgency] as any;

  if (viewMode === "list") {
    return (
      <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#4F7CFF] flex items-center justify-center font-bold text-sm">
            {internship.company.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">
                {internship.company}
              </span>
              <Badge variant="default">{internship.work_mode || "Remote"}</Badge>
              {internship.is_demo && (
                <span className="text-[10px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  Demo
                </span>
              )}
            </div>
            <Link
              href={`/internships/${internship.id}`}
              className="text-sm font-semibold text-white hover:text-[#4F7CFF] transition-colors truncate block mt-0.5"
            >
              {internship.role}
            </Link>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {internship.location}
              </span>
              <span>·</span>
              <span className="text-emerald-400 font-medium">
                {internship.stipend || "Competitive Stipend"}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(internship.deadline)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <Badge variant={urgencyBadge}>{timing.label}</Badge>
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg border transition-colors ${
              isSaved
                ? "bg-[#4F7CFF]/15 border-[#4F7CFF]/40 text-[#4F7CFF]"
                : "border-slate-700 text-slate-400 hover:text-white"
            }`}
            title={isSaved ? "Saved" : "Save opportunity"}
          >
            <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
          </button>
          <Link href={`/internships/${internship.id}`}>
            <Button variant="ghost" size="sm">
              Details
            </Button>
          </Link>
          <Link
            href={`/resume-match?role=${encodeURIComponent(
              internship.role
            )}&company=${encodeURIComponent(
              internship.company
            )}&skills=${encodeURIComponent(
              (internship.required_skills || []).join(",")
            )}`}
          >
            <Button size="sm">
              <FileCheck className="h-3.5 w-3.5 mr-1" />
              <span>Match</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-xl">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500/10 to-[#35D5F2]/10 border border-blue-500/20 text-[#4F7CFF] flex items-center justify-center font-bold text-sm shrink-0">
              {internship.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {internship.company}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {internship.location || "Remote"}
              </span>
            </div>
          </div>

          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl border transition-colors ${
              isSaved
                ? "bg-[#4F7CFF]/20 border-[#4F7CFF]/40 text-[#4F7CFF]"
                : "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title={isSaved ? "Saved" : "Save opportunity"}
          >
            <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Title */}
        <Link
          href={`/internships/${internship.id}`}
          className="text-sm font-bold text-white hover:text-[#4F7CFF] transition-colors block mt-3 line-clamp-1"
        >
          {internship.role}
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {internship.description || "Exciting opportunity in engineering and product innovation."}
        </p>

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {(internship.required_skills || []).slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60 font-medium"
            >
              {skill}
            </span>
          ))}
          {(internship.required_skills || []).length > 4 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500">
              +{internship.required_skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-400 font-medium truncate max-w-[130px]">
            {internship.stipend || "Competitive"}
          </span>
          <Badge variant={urgencyBadge}>{timing.label}</Badge>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(internship)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(internship.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/resume-match?role=${encodeURIComponent(
                internship.role
              )}&company=${encodeURIComponent(
                internship.company
              )}&skills=${encodeURIComponent(
                (internship.required_skills || []).join(",")
              )}`}
            >
              <Button size="sm" variant="secondary">
                <FileCheck className="h-3.5 w-3.5 mr-1 text-[#35D5F2]" />
                <span>Match</span>
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => onApplyPipeline(internship)}
              title="Add to Kanban Application pipeline"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              <span>Track</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

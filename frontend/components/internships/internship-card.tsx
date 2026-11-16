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
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Internship } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { store } from "@/lib/storage";
import { api } from "@/lib/api";
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

  const destinationUrl = internship.job_url || (internship as any).official_url;

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isSaved;
    setIsSaved(nextState);
    try {
      if (nextState) {
        await api.saveInternship(internship.id);
      } else {
        await api.unsaveInternship(internship.id);
      }
    } catch {
      // offline fallback handled by store
    }
    await store.updateInternship(internship.id, { is_saved: nextState });
    toast.success(
      nextState
        ? `Saved ${internship.company} to database bookmarks`
        : `Removed ${internship.company} from bookmarks`
    );
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (destinationUrl) {
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
      toast.success(`Opening application portal for ${internship.company}`);
      onApplyPipeline(internship);
    } else {
      onApplyPipeline(internship);
    }
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
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm">
            {internship.company.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#0F172A]">
                {internship.company}
              </span>
              <Badge variant="default">{internship.work_mode || "Remote"}</Badge>
              {internship.is_demo && (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  Demo
                </span>
              )}
            </div>
            <Link
              href={`/internships/${internship.id}`}
              className="text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors truncate block mt-0.5"
            >
              {internship.role}
            </Link>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {internship.location}
              </span>
              <span>&bull;</span>
              <span className="text-emerald-600 font-medium">
                {internship.stipend || "Competitive Stipend"}
              </span>
              <span>&bull;</span>
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
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? "bg-blue-50 border-blue-200 text-[#2563EB]"
                : "border-slate-200 text-slate-400 hover:text-slate-700 bg-white"
            }`}
            title={isSaved ? "Saved" : "Save opportunity"}
          >
            <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
          </button>
          <Link href={`/internships/${internship.id}`}>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
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
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-[#2563EB]" />
              <span>Match</span>
            </Button>
          </Link>
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={handleApplyClick}
            title={destinationUrl ? "Apply on external portal and track" : "Add to Kanban Application pipeline"}
          >
            {destinationUrl ? (
              <>
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                <span>Apply Now</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1" />
                <span>Track</span>
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-slate-300 transition-all duration-150 flex flex-col justify-between shadow-xs">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0">
              {internship.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">
                {internship.company}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {internship.location || "Remote"}
              </span>
            </div>
          </div>

          <button
            onClick={toggleBookmark}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? "bg-blue-50 border-blue-200 text-[#2563EB]"
                : "border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            }`}
            title={isSaved ? "Saved" : "Save opportunity"}
          >
            <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Title */}
        <Link
          href={`/internships/${internship.id}`}
          className="text-sm font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors block mt-3 line-clamp-1"
        >
          {internship.role}
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {internship.description || "Exciting opportunity in engineering and product innovation."}
        </p>

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {(internship.required_skills || []).slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium"
            >
              {skill}
            </span>
          ))}
          {(internship.required_skills || []).length > 4 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
              +{internship.required_skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-600 font-medium truncate max-w-[130px]">
            {internship.stipend || "Competitive"}
          </span>
          <Badge variant={urgencyBadge}>{timing.label}</Badge>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(internship)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(internship.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-[#2563EB]" />
                <span>Match</span>
              </Button>
            </Link>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={handleApplyClick}
              title={destinationUrl ? "Apply on external portal and track" : "Add to Kanban Application pipeline"}
            >
              {destinationUrl ? (
                <>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  <span>Apply Now</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1" />
                  <span>Track</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

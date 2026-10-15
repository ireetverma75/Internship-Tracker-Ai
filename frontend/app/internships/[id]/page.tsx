"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Edit2,
  Trash2,
  Send,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Bookmark
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { InternshipFormModal } from "@/components/internships/internship-form-modal";
import { Internship } from "@/types";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { store } from "@/lib/storage";
import { toast } from "sonner";

function InternshipDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [internship, setInternship] = useState<Internship | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const loadData = async () => {
    const item = await store.getInternshipById(id);
    if (item) {
      setInternship(item);
      setIsSaved(item.is_saved ?? false);
    }
  };

  useEffect(() => {
    if (id) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!internship) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="text-slate-400">Loading opportunity details...</p>
        </div>
      </AppShell>
    );
  }

  const timing = getDaysRemaining(internship.deadline);
  const urgencyBadge = {
    overdue: "danger",
    urgent: "warning",
    soon: "warning",
    future: "default",
    none: "default"
  }[timing.urgency] as any;

  const toggleBookmark = async () => {
    const next = !isSaved;
    setIsSaved(next);
    await store.updateInternship(internship.id, { is_saved: next });
    toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
  };

  const handleApplyToPipeline = async () => {
    await store.saveApplication({
      internship_id: internship.id,
      company: internship.company,
      role: internship.role,
      status: "Applied",
      applied_date: new Date().toISOString().split("T")[0],
      deadline: internship.deadline || null,
      match_score: 85,
      next_action: "Review online assessment criteria",
      notes: `Added from opportunity detail page. Stipend: ${internship.stipend || "N/A"}.`
    });
    toast.success(`Added ${internship.company} to your Application Pipeline!`);
  };

  const handleDelete = async () => {
    await store.deleteInternship(internship.id);
    toast.success("Opportunity deleted");
    router.push("/internships");
  };

  return (
    <AppShell>
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/internships"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Internships</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#4F7CFF] to-[#35D5F2] flex items-center justify-center font-bold text-xl text-white shadow-lg shrink-0">
              {internship.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-[#4F7CFF]">
                  {internship.company}
                </span>
                <Badge variant="default">{internship.work_mode || "Remote"}</Badge>
                {internship.is_demo && (
                  <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded font-mono">
                    DEMO RECORD
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1 tracking-tight">
                {internship.role}
              </h1>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {internship.location || "Remote"}
                </span>
                <span>·</span>
                <span className="text-emerald-400 font-medium">
                  {internship.stipend || "Competitive compensation"}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  Deadline: {formatDate(internship.deadline)}
                </span>
                <Badge variant={urgencyBadge}>{timing.label}</Badge>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleBookmark}
              className={`p-2.5 rounded-xl border transition-colors ${
                isSaved
                  ? "bg-[#4F7CFF]/20 border-[#4F7CFF]/50 text-[#4F7CFF]"
                  : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
              }`}
              title={isSaved ? "Saved" : "Save to bookmarks"}
            >
              <Bookmark className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} />
            </button>
            <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
              <Edit2 className="h-4 w-4 mr-1.5" />
              <span>Edit</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(true)}
              className="text-rose-400 hover:bg-rose-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button onClick={handleApplyToPipeline} className="glow-blue">
              <Send className="h-4 w-4 mr-1.5" />
              <span>Track in Pipeline</span>
            </Button>
          </div>
        </div>

        {/* AI Resume Match Quick Action Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-600/15 via-[#35D5F2]/10 to-transparent border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-[#35D5F2] flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Benchmark Your Resume Against This Role
              </h4>
              <p className="text-xs text-slate-400">
                Run an instant semantic skill gap analysis and receive tailored resume bullet recommendations.
              </p>
            </div>
          </div>
          <Link
            href={`/resume-match?role=${encodeURIComponent(
              internship.role
            )}&company=${encodeURIComponent(
              internship.company
            )}&skills=${encodeURIComponent(
              (internship.required_skills || []).join(",")
            )}`}
          >
            <Button size="sm" className="whitespace-nowrap glow-blue">
              <FileCheck className="h-4 w-4 mr-1.5" />
              <span>Run AI Match Report</span>
            </Button>
          </Link>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-base font-bold text-white mb-2">Role Overview</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {internship.description || "No overview provided."}
              </p>
            </div>

            {/* Eligibility */}
            {internship.eligibility && (
              <div>
                <h3 className="text-base font-bold text-white mb-2">
                  Eligibility & Qualifications
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {internship.eligibility}
                </p>
              </div>
            )}

            {/* Personal Notes */}
            {internship.notes && (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Recruiting Notes & Insights
                </h4>
                <p className="text-sm text-white">{internship.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column: Skills & Links */}
          <div className="space-y-6">
            {/* Required Skills */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(internship.required_skills || []).map((skill) => (
                  <Badge key={skill} variant="primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            {(internship.preferred_skills || []).length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Preferred / Bonus Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {internship.preferred_skills.map((skill) => (
                    <Badge key={skill} variant="accent">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Official Link */}
            {internship.job_url && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <a
                  href={internship.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-xs text-[#4F7CFF] font-semibold hover:underline"
                >
                  <span>Official Careers Portal</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <InternshipFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={internship}
        onSuccess={loadData}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Opportunity"
        description="Are you sure you want to permanently delete this opportunity record?"
        maxWidth="sm"
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

export default function InternshipDetailPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0B1020] text-slate-400 p-8 text-center">Loading opportunity details...</div>}>
      <InternshipDetailContent />
    </React.Suspense>
  );
}

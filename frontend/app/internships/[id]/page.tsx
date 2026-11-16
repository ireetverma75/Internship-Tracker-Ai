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
import { api } from "@/lib/api";
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
          <p className="text-sm text-[#64748B]">Loading opportunity details...</p>
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
    try {
      if (next) {
        await api.saveInternship(internship.id);
      } else {
        await api.unsaveInternship(internship.id);
      }
    } catch {
      // offline fallback
    }
    await store.updateInternship(internship.id, { is_saved: next });
    toast.success(next ? "Saved to database bookmarks" : "Removed from bookmarks");
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
      <div className="mb-5">
        <Link
          href="/internships"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Internships</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center font-bold text-xl text-white shadow-sm shrink-0">
              {internship.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-[#2563EB]">
                  {internship.company}
                </span>
                <Badge variant="default">{internship.work_mode || "Remote"}</Badge>
                {internship.is_demo && (
                  <span className="text-[10px] text-[#64748B] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                    DEMO RECORD
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mt-1 tracking-tight">
                {internship.role}
              </h1>
              <div className="flex items-center gap-4 text-xs text-[#64748B] mt-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#64748B]" />
                  {internship.location || "Remote"}
                </span>
                <span>·</span>
                <span className="text-[#16A34A] font-medium">
                  {internship.stipend || "Competitive compensation"}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />
                  Deadline: {formatDate(internship.deadline)}
                </span>
                <Badge variant={urgencyBadge}>{timing.label}</Badge>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? "bg-blue-50 border-blue-200 text-[#2563EB]"
                  : "bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
              }`}
              title={isSaved ? "Saved" : "Save to bookmarks"}
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
            </button>
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              <span>Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="text-[#DC2626] hover:bg-rose-50 hover:border-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            {internship.job_url ? (
              <Button
                size="sm"
                onClick={() => {
                  window.open(internship.job_url, "_blank", "noopener,noreferrer");
                  handleApplyToPipeline();
                }}
                className="shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                <span>Apply on Official Portal</span>
              </Button>
            ) : (
              <Button size="sm" onClick={handleApplyToPipeline} className="shadow-sm">
                <Send className="h-3.5 w-3.5 mr-1.5" />
                <span>Track in Pipeline</span>
              </Button>
            )}
          </div>
        </div>

        {/* AI Resume Match Quick Action Banner */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100/80 text-[#2563EB] flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A]">
                Benchmark Your Resume Against This Role
              </h4>
              <p className="text-[11px] sm:text-xs text-[#64748B]">
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
            <Button size="sm" className="whitespace-nowrap shadow-sm">
              <FileCheck className="h-3.5 w-3.5 mr-1.5" />
              <span>Run AI Match Report</span>
            </Button>
          </Link>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2 uppercase tracking-wide">Role Overview</h3>
              <p className="text-sm text-[#0F172A]/80 leading-relaxed whitespace-pre-line">
                {internship.description || "No overview provided."}
              </p>
            </div>

            {/* Eligibility */}
            {internship.eligibility && (
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] mb-2 uppercase tracking-wide">
                  Eligibility & Qualifications
                </h3>
                <p className="text-sm text-[#0F172A]/80 leading-relaxed">
                  {internship.eligibility}
                </p>
              </div>
            )}

            {/* Personal Notes */}
            {internship.notes && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Recruiting Notes & Insights
                </h4>
                <p className="text-sm text-[#0F172A]">{internship.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column: Skills & Links */}
          <div className="space-y-5">
            {/* Required Skills */}
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
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
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
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
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <a
                  href={internship.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-xs text-[#2563EB] font-semibold hover:underline"
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
    <React.Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] text-[#64748B] p-8 text-center text-sm">Loading opportunity details...</div>}>
      <InternshipDetailContent />
    </React.Suspense>
  );
}

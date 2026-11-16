"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Bookmark,
  ArrowUpDown,
  Sparkles,
  Database,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { InternshipCard } from "@/components/internships/internship-card";
import { InternshipFormModal } from "@/components/internships/internship-form-modal";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Internship, WorkMode } from "@/types";
import { store, NOTIFY_CHANGE_EVENT } from "@/lib/storage";
import { toast } from "sonner";

function InternshipsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialSaved = searchParams.get("saved") === "true";

  const [internships, setInternships] = useState<Internship[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [workModeFilter, setWorkModeFilter] = useState<string>("All");
  const [savedOnly, setSavedOnly] = useState(initialSaved);
  const [sortBy, setSortBy] = useState<"deadline" | "newest" | "company">("deadline");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Internship | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadInternships = async () => {
    const list = await store.getInternships();
    setInternships(list);
  };

  useEffect(() => {
    loadInternships();
    window.addEventListener(NOTIFY_CHANGE_EVENT, loadInternships);
    return () => window.removeEventListener(NOTIFY_CHANGE_EVENT, loadInternships);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (searchParams.get("saved") === "true") {
      setSavedOnly(true);
    }
  }, [searchParams]);

  // Filter & Sort
  const filteredInternships = useMemo(() => {
    return internships
      .filter((item) => {
        if (savedOnly && !item.is_saved) return false;
        if (
          workModeFilter !== "All" &&
          item.work_mode?.toLowerCase() !== workModeFilter.toLowerCase()
        )
          return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = item.company.toLowerCase().includes(q);
          const matchRole = item.role.toLowerCase().includes(q);
          const matchLocation = (item.location || "").toLowerCase().includes(q);
          const matchSkills = (item.required_skills || []).some((s) =>
            s.toLowerCase().includes(q)
          );
          if (!matchCompany && !matchRole && !matchLocation && !matchSkills)
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "deadline") {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        } else if (sortBy === "company") {
          return a.company.localeCompare(b.company);
        } else {
          // newest
          return (
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
          );
        }
      });
  }, [internships, searchQuery, workModeFilter, savedOnly, sortBy]);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    await store.deleteInternship(deletingId);
    toast.success("Opportunity removed successfully");
    setDeletingId(null);
    loadInternships();
  };

  const handleApplyToPipeline = async (item: Internship) => {
    await store.saveApplication({
      internship_id: item.id,
      company: item.company,
      role: item.role,
      status: "Applied",
      applied_date: new Date().toISOString().split("T")[0],
      deadline: item.deadline || null,
      match_score: 85,
      next_action: "Review online assessment criteria",
      notes: `Added from discovered internships list. Stipend: ${item.stipend || "N/A"}.`
    });
    toast.success(`Added ${item.company} to your Application Pipeline!`);
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Compass className="h-7 w-7 text-[#2563EB]" />
            <span>Discover Tech Internships</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Curated software engineering, AI/ML, and design internships with verified criteria and AI matching.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
          className="self-start md:self-auto shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Add Opportunity</span>
        </Button>
      </div>

      {/* Hugging Face Jobs Dataset Discovery Banner */}
      <div className="mt-5 p-4 rounded-xl border border-[#E2E8F0] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-[#38BDF8]/60 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
            <Database className="h-5 w-5 text-[#38BDF8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A]">
                Looking for 390+ Hugging Face Dataset Jobs?
              </h4>
              <span className="text-[10px] font-semibold text-[#2563EB] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                AI Dataset
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5">
              Explore real-world listings and synthetic records with calculated TF-IDF semantic resume matching.
            </p>
          </div>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors self-start sm:self-auto shrink-0 shadow-sm"
        >
          <span>Explore HF Jobs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, company, or skill (e.g. Python, PyTorch, React)..."
            className="pl-10 h-9 bg-[#F8FAFC] border-[#E2E8F0] text-xs focus:bg-white"
          />
        </div>

        {/* Filter Badges & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Work Mode filter */}
          <div className="flex items-center rounded-lg bg-[#F8FAFC] p-1 border border-[#E2E8F0] text-xs">
            {["All", "Remote", "Hybrid", "On-site"].map((mode) => (
              <button
                key={mode}
                onClick={() => setWorkModeFilter(mode)}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  workModeFilter === mode
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Saved Toggle */}
          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              savedOnly
                ? "bg-blue-50 border-blue-200 text-[#2563EB]"
                : "bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" fill={savedOnly ? "currentColor" : "none"} />
            <span>Saved Only</span>
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="deadline">Sort: Deadline Soonest</option>
            <option value="newest">Sort: Newest Added</option>
            <option value="company">Sort: Company (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-[#F8FAFC] p-1 border border-[#E2E8F0]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-[#0F172A] shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-[#0F172A] shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-[#64748B] mt-4 px-1">
        <span>
          Showing <strong className="text-[#0F172A] font-semibold">{filteredInternships.length}</strong> opportunities
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-[#2563EB] font-medium hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Internships List / Grid */}
      {filteredInternships.length === 0 ? (
        <div className="mt-10 text-center p-12 rounded-2xl bg-white border border-[#E2E8F0] max-w-md mx-auto shadow-sm">
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 text-[#64748B]">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-[#0F172A]">No opportunities found</h3>
          <p className="text-xs text-[#64748B] mt-1">
            No internships match your current filters or search query.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setWorkModeFilter("All");
                setSavedOnly(false);
              }}
            >
              Reset Filters
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
            >
              Add New Role
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`mt-4 ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "space-y-3"
          }`}
        >
          {filteredInternships.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              viewMode={viewMode}
              onEdit={(item) => {
                setEditingItem(item);
                setIsFormOpen(true);
              }}
              onDelete={(id) => setDeletingId(id)}
              onApplyPipeline={handleApplyToPipeline}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <InternshipFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
        onSuccess={loadInternships}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Delete Internship"
        description="Are you sure you want to delete this opportunity? This action cannot be undone."
        maxWidth="sm"
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setDeletingId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

export default function InternshipsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] text-[#64748B] p-8 text-center text-sm">Loading opportunities...</div>}>
      <InternshipsContent />
    </React.Suspense>
  );
}

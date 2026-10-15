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
  Sparkles
} from "lucide-react";
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

  const [internships, setInternships] = useState<Internship[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [workModeFilter, setWorkModeFilter] = useState<string>("All");
  const [savedOnly, setSavedOnly] = useState(false);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="h-7 w-7 text-[#4F7CFF]" />
            <span>Discover Tech Internships</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Curated software engineering, AI/ML, and design internships with verified requirements.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
          className="glow-blue self-start md:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Add Opportunity</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, company, or skill (e.g. Python, PyTorch, React)..."
            className="pl-10 h-10 bg-slate-900 border-slate-700/80"
          />
        </div>

        {/* Filter Badges & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Work Mode filter */}
          <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            {["All", "Remote", "Hybrid", "On-site"].map((mode) => (
              <button
                key={mode}
                onClick={() => setWorkModeFilter(mode)}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                  workModeFilter === mode
                    ? "bg-[#4F7CFF] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Saved Toggle */}
          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              savedOnly
                ? "bg-[#4F7CFF]/20 border-[#4F7CFF]/50 text-[#4F7CFF]"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" fill={savedOnly ? "currentColor" : "none"} />
            <span>Saved Only</span>
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="h-9 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-[#4F7CFF]"
          >
            <option value="deadline">Sort: Deadline Soonest</option>
            <option value="newest">Sort: Newest Added</option>
            <option value="company">Sort: Company (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 mt-4 px-1">
        <span>
          Showing <strong className="text-white">{filteredInternships.length}</strong> opportunities
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-[#4F7CFF] hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Internships List / Grid */}
      {filteredInternships.length === 0 ? (
        <div className="mt-12 text-center p-12 rounded-2xl bg-[#111827] border border-slate-800 max-w-md mx-auto">
          <Compass className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No opportunities found</h3>
          <p className="text-xs text-slate-400 mt-1">
            No internships match your current filters or search query.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
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
    <React.Suspense fallback={<div className="min-h-screen bg-[#0B1020] text-slate-400 p-8 text-center">Loading opportunities...</div>}>
      <InternshipsContent />
    </React.Suspense>
  );
}

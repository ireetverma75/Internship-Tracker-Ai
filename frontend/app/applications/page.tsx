"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit2
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ApplicationDrawer } from "@/components/applications/application-drawer";
import { ApplicationCreateModal } from "@/components/applications/application-create-modal";
import { Modal } from "@/components/ui/modal";
import { Application, ApplicationStatus } from "@/types";
import { store, NOTIFY_CHANGE_EVENT } from "@/lib/storage";
import { formatDate, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

const STAGES: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: "Saved", title: "Saved", color: "border-slate-300" },
  { id: "Applied", title: "Applied", color: "border-blue-400" },
  { id: "Assessment", title: "OA / Assessment", color: "border-amber-400" },
  { id: "Interview", title: "Interview", color: "border-sky-400" },
  { id: "Selected", title: "Offer / Selected", color: "border-emerald-400" },
  { id: "Rejected", title: "Archived / Rejected", color: "border-rose-300" }
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Drawers & Modals
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    const list = await store.getApplications();
    setApplications(list);
  };

  useEffect(() => {
    loadData();
    window.addEventListener(NOTIFY_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(NOTIFY_CHANGE_EVENT, loadData);
  }, []);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== "All" && app.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchComp = app.company.toLowerCase().includes(q);
        const matchRole = app.role.toLowerCase().includes(q);
        const matchNotes = (app.notes || "").toLowerCase().includes(q);
        if (!matchComp && !matchRole && !matchNotes) return false;
      }
      return true;
    });
  }, [applications, searchQuery, statusFilter]);

  const handleQuickStatusChange = async (
    e: React.MouseEvent,
    appId: string,
    newStatus: ApplicationStatus
  ) => {
    e.stopPropagation();
    await store.updateApplication(appId, { status: newStatus });
    toast.success(`Moved application to ${newStatus}`);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    await store.deleteApplication(deletingId);
    toast.success("Application deleted");
    setDeletingId(null);
    loadData();
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Kanban className="h-7 w-7 text-[#2563EB]" />
            <span>Application Tracking Pipeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage your recruitment stages with drag-ready Kanban columns, interview alerts, and progress metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg bg-[#F8FAFC] p-1 border border-[#E2E8F0]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-[#0F172A] shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-white text-[#0F172A] shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add Application</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, role, notes..."
            className="pl-10 h-9 bg-[#F8FAFC] border-[#E2E8F0] text-xs focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-xs text-[#64748B] font-medium">Filter Stage:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="All">All Stages ({applications.length})</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area: Kanban Board or Table */}
      {viewMode === "kanban" ? (
        /* KANBAN BOARD VIEW */
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-6">
          {STAGES.map((stage) => {
            const stageApps = filtered.filter((a) => a.status === stage.id);

            return (
              <div
                key={stage.id}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0] mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getStatusColor(stage.id).bg} border ${getStatusColor(stage.id).border}`}
                    />
                    <h3 className="text-xs font-bold text-[#0F172A] tracking-wide">
                      {stage.title}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[10px] font-bold text-[#64748B]">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh] pr-0.5">
                  {stageApps.length === 0 ? (
                    <div className="h-28 border border-dashed border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#64748B] text-[11px] text-center p-3">
                      No applications
                    </div>
                  ) : (
                    stageApps.map((app) => {
                      return (
                        <div
                          key={app.id}
                          onClick={() => {
                            setSelectedApp(app);
                            setIsDrawerOpen(true);
                          }}
                          className="p-3.5 rounded-xl bg-white hover:border-[#2563EB]/40 border border-[#E2E8F0] transition-all cursor-pointer shadow-sm hover:shadow-md space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <span className="text-[11px] font-bold text-[#2563EB] block truncate">
                                {app.company}
                              </span>
                              <h4 className="text-xs font-semibold text-[#0F172A] line-clamp-1">
                                {app.role}
                              </h4>
                            </div>

                            {app.match_score && (
                              <span className="text-[10px] font-bold text-[#16A34A] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {app.match_score}%
                              </span>
                            )}
                          </div>

                          {/* Next Action */}
                          {app.next_action && (
                            <p className="text-[10px] text-[#0F172A] bg-slate-50 p-1.5 rounded-md border border-[#E2E8F0] line-clamp-2">
                              👉 {app.next_action}
                            </p>
                          )}

                          {/* Dates & Status Change */}
                          <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
                            {app.interview_date ? (
                              <span className="text-[#2563EB] font-semibold flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(app.interview_date)}
                              </span>
                            ) : app.deadline ? (
                              <span className="flex items-center gap-1 text-[#F59E0B]">
                                <Clock className="h-3 w-3" />
                                {formatDate(app.deadline)}
                              </span>
                            ) : (
                              <span>{formatDate(app.applied_date)}</span>
                            )}

                            {/* Stage move dropdown */}
                            <select
                              value={app.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e: any) =>
                                handleQuickStatusChange(
                                  e,
                                  app.id,
                                  e.target.value as ApplicationStatus
                                )
                              }
                              className="text-[9px] bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded px-1.5 py-0.5 focus:outline-none"
                            >
                              {STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Move to {s.id}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DATA TABLE VIEW */
        <div className="mt-6 rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-semibold border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3.5 pl-5">Company & Role</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Applied Date</th>
                  <th className="p-3.5">Interview Date</th>
                  <th className="p-3.5">Match Score</th>
                  <th className="p-3.5">Next Action</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#64748B]">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => {
                    const statusStyle = getStatusColor(app.status);

                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedApp(app);
                          setIsDrawerOpen(true);
                        }}
                      >
                        <td className="p-3.5 pl-5">
                          <span className="font-bold text-[#0F172A] block">
                            {app.company}
                          </span>
                          <span className="text-[#64748B] text-[11px]">
                            {app.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#64748B]">{formatDate(app.applied_date)}</td>
                        <td className="p-3.5">
                          {app.interview_date ? (
                            <span className="text-[#2563EB] font-semibold">
                              {formatDate(app.interview_date)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3.5">
                          {app.match_score ? (
                            <Badge variant="primary">{app.match_score}%</Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3.5 max-w-[200px] truncate text-[11px] text-[#64748B]">
                          {app.next_action || "—"}
                        </td>
                        <td
                          className="p-3.5 text-right pr-5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setIsDrawerOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingId(app.id)}
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Drawer for Details and Editing */}
      <ApplicationDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedApp(null);
        }}
        application={selectedApp}
        onUpdated={loadData}
        onDelete={(id) => setDeletingId(id)}
      />

      {/* Add Application Modal */}
      <ApplicationCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Delete Application"
        description="Are you sure you want to permanently delete this application record?"
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

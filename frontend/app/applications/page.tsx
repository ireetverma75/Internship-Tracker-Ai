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
  { id: "Saved", title: "Saved", color: "border-slate-700" },
  { id: "Applied", title: "Applied", color: "border-blue-500/50" },
  { id: "Assessment", title: "OA / Assessment", color: "border-amber-500/50" },
  { id: "Interview", title: "Interview", color: "border-cyan-500/50" },
  { id: "Selected", title: "Offer / Selected", color: "border-emerald-500/50" },
  { id: "Rejected", title: "Archived / Rejected", color: "border-rose-500/50" }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Kanban className="h-7 w-7 text-[#4F7CFF]" />
            <span>Application Tracking Pipeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your recruitment stages with drag-ready Kanban columns, interview alerts, and progress metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === "kanban"
                  ? "bg-[#4F7CFF] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === "table"
                  ? "bg-[#4F7CFF] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="glow-blue"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add Application</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, role, notes..."
            className="pl-10 h-9 bg-slate-900 border-slate-700/80 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-xs text-slate-400">Filter Stage:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-[#4F7CFF]"
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageApps = filtered.filter((a) => a.status === stage.id);

            return (
              <div
                key={stage.id}
                className="bg-[#111827]/70 border border-slate-800/90 rounded-2xl p-3.5 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getStatusColor(stage.id).bg} border ${getStatusColor(stage.id).border}`}
                    />
                    <h3 className="text-xs font-bold text-white tracking-wide">
                      {stage.title}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-0.5">
                  {stageApps.length === 0 ? (
                    <div className="h-32 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-[11px] text-center p-3">
                      No applications in this stage
                    </div>
                  ) : (
                    stageApps.map((app) => {
                      const statusStyle = getStatusColor(app.status);

                      return (
                        <div
                          key={app.id}
                          onClick={() => {
                            setSelectedApp(app);
                            setIsDrawerOpen(true);
                          }}
                          className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-md hover:shadow-lg space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <span className="text-[11px] font-bold text-[#4F7CFF] block truncate">
                                {app.company}
                              </span>
                              <h4 className="text-xs font-semibold text-white line-clamp-1">
                                {app.role}
                              </h4>
                            </div>

                            {app.match_score && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {app.match_score}%
                              </span>
                            )}
                          </div>

                          {/* Next Action */}
                          {app.next_action && (
                            <p className="text-[10px] text-slate-300 bg-slate-800/60 p-1.5 rounded-md border border-slate-700/40 line-clamp-2">
                              👉 {app.next_action}
                            </p>
                          )}

                          {/* Dates */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            {app.interview_date ? (
                              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(app.interview_date)}
                              </span>
                            ) : app.deadline ? (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-amber-400" />
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
                              className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 rounded px-1 py-0.5 focus:outline-none"
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
        <div className="mt-6 rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => {
                    const statusStyle = getStatusColor(app.status);

                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedApp(app);
                          setIsDrawerOpen(true);
                        }}
                      >
                        <td className="p-3.5 pl-5">
                          <span className="font-bold text-white block">
                            {app.company}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {app.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3.5">{formatDate(app.applied_date)}</td>
                        <td className="p-3.5">
                          {app.interview_date ? (
                            <span className="text-cyan-400 font-semibold">
                              {formatDate(app.interview_date)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3.5">
                          {app.match_score ? (
                            <Badge variant="success">{app.match_score}%</Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3.5 max-w-[200px] truncate text-[11px]">
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
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingId(app.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
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

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  Calendar,
  Building,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Filter
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Internship, Application } from "@/types";
import { store, NOTIFY_CHANGE_EVENT } from "@/lib/storage";
import { formatDate, getDaysRemaining, getStatusColor } from "@/lib/utils";

export default function DeadlinesPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "closing_soon" | "overdue">("all");

  const loadData = async () => {
    const [ints, apps] = await Promise.all([
      store.getInternships(),
      store.getApplications()
    ]);
    setInternships(ints);
    setApplications(apps);
  };

  useEffect(() => {
    loadData();
    window.addEventListener(NOTIFY_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(NOTIFY_CHANGE_EVENT, loadData);
  }, []);

  // Consolidate all deadline items
  const deadlineItems = useMemo(() => {
    const map = new Map<string, any>();

    internships.forEach((item) => {
      if (!item.deadline) return;
      const timing = getDaysRemaining(item.deadline);
      const matchedApp = applications.find(
        (a) => a.internship_id === item.id || a.company.toLowerCase() === item.company.toLowerCase()
      );

      map.set(item.id, {
        id: item.id,
        company: item.company,
        role: item.role,
        deadline: item.deadline,
        location: item.location,
        stipend: item.stipend,
        timing,
        applicationStatus: matchedApp?.status || null,
        jobUrl: item.job_url
      });
    });

    return Array.from(map.values()).sort(
      (a, b) => a.timing.days - b.timing.days
    );
  }, [internships, applications]);

  const overdueList = deadlineItems.filter((i) => i.timing.days < 0);
  const closingSoonList = deadlineItems.filter(
    (i) => i.timing.days >= 0 && i.timing.days <= 7
  );
  const upcomingList = deadlineItems.filter((i) => i.timing.days > 7);

  const displayedItems = useMemo(() => {
    if (filterMode === "closing_soon") return closingSoonList;
    if (filterMode === "overdue") return overdueList;
    return deadlineItems;
  }, [filterMode, deadlineItems, closingSoonList, overdueList]);

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Clock className="h-7 w-7 text-amber-400" />
            <span>Deadlines & Milestones</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological timeline and urgency countdowns for all active applications and saved opportunities.
          </p>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center rounded-xl bg-[#111827] p-1 border border-slate-800 self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterMode === "all"
                ? "bg-[#4F7CFF] text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Deadlines ({deadlineItems.length})
          </button>
          <button
            onClick={() => setFilterMode("closing_soon")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              filterMode === "closing_soon"
                ? "bg-amber-500 text-[#0B1020]"
                : "text-amber-400 hover:text-amber-300"
            }`}
          >
            <span>Closing Soon</span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>({closingSoonList.length})</span>
          </button>
          {overdueList.length > 0 && (
            <button
              onClick={() => setFilterMode("overdue")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                filterMode === "overdue"
                  ? "bg-rose-600 text-white"
                  : "text-rose-400 hover:text-rose-300"
              }`}
            >
              <span>Overdue ({overdueList.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Urgency Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-400">Due Within 7 Days</span>
            <p className="text-2xl font-extrabold text-white mt-1 tabular-nums">
              {closingSoonList.length}
            </p>
          </div>
          <AlertTriangle className="h-8 w-8 text-amber-400/80" />
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#4F7CFF]">Upcoming Later (8+ Days)</span>
            <p className="text-2xl font-extrabold text-white mt-1 tabular-nums">
              {upcomingList.length}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-[#4F7CFF]/80" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Monitored Deadlines</span>
            <p className="text-2xl font-extrabold text-white mt-1 tabular-nums">
              {deadlineItems.length}
            </p>
          </div>
          <Clock className="h-8 w-8 text-slate-600" />
        </div>
      </div>

      {/* Chronological List */}
      <div className="mt-8 space-y-4">
        {displayedItems.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center max-w-md mx-auto my-8">
            <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No deadlines in this view</h3>
            <p className="text-xs text-slate-400 mt-1">
              All deadlines are either completed or scheduled for later cycles.
            </p>
          </div>
        ) : (
          displayedItems.map((item) => {
            const urgencyBadge = (
              item.timing.urgency === "overdue"
                ? "danger"
                : item.timing.urgency === "urgent" || item.timing.urgency === "soon"
                ? "warning"
                : "default"
            ) as "danger" | "warning" | "default";

            const statusStyle = item.applicationStatus
              ? getStatusColor(item.applicationStatus)
              : null;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[#4F7CFF]/20 to-[#35D5F2]/20 border border-blue-500/20 text-[#4F7CFF] flex items-center justify-center font-bold text-sm shrink-0">
                    {item.company.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#4F7CFF]">
                        {item.company}
                      </span>
                      {statusStyle && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {item.applicationStatus}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/internships/${item.id}`}
                      className="text-base font-bold text-white hover:text-[#4F7CFF] transition-colors block mt-0.5"
                    >
                      {item.role}
                    </Link>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span>{item.location}</span>
                      <span>·</span>
                      <span className="text-emerald-400">{item.stipend || "Competitive"}</span>
                    </div>
                  </div>
                </div>

                {/* Right timing countdown & actions */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-white block">
                      {formatDate(item.deadline)}
                    </span>
                    <Badge variant={urgencyBadge} className="mt-0.5">
                      {item.timing.label}
                    </Badge>
                  </div>

                  <Link href={`/internships/${item.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>

                  <Link
                    href={`/resume-match?role=${encodeURIComponent(
                      item.role
                    )}&company=${encodeURIComponent(item.company)}`}
                  >
                    <Button size="sm" className="glow-blue">
                      <span>Match Resume</span>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Clock className="h-7 w-7 text-[#2563EB]" />
            <span>Deadlines & Milestones</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Chronological timeline and urgency countdowns for all active applications and saved opportunities.
          </p>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center rounded-xl bg-white p-1 border border-[#E2E8F0] shadow-sm self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === "all"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            All Deadlines ({deadlineItems.length})
          </button>
          <button
            onClick={() => setFilterMode("closing_soon")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterMode === "closing_soon"
                ? "bg-[#F59E0B] text-white shadow-sm"
                : "text-[#F59E0B] hover:bg-amber-50"
            }`}
          >
            <span>Closing Soon ({closingSoonList.length})</span>
          </button>
          {overdueList.length > 0 && (
            <button
              onClick={() => setFilterMode("overdue")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                filterMode === "overdue"
                  ? "bg-[#DC2626] text-white shadow-sm"
                  : "text-[#DC2626] hover:bg-rose-50"
              }`}
            >
              <span>Overdue ({overdueList.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Urgency Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">Due Within 7 Days</span>
            <p className="text-2xl font-extrabold text-[#0F172A] mt-1 tabular-nums">
              {closingSoonList.length}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#F59E0B]">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Upcoming Later (8+ Days)</span>
            <p className="text-2xl font-extrabold text-[#0F172A] mt-1 tabular-nums">
              {upcomingList.length}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB]">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Monitored Deadlines</span>
            <p className="text-2xl font-extrabold text-[#0F172A] mt-1 tabular-nums">
              {deadlineItems.length}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#64748B]">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Chronological List */}
      <div className="mt-6 space-y-3.5">
        {displayedItems.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-[#E2E8F0] text-center max-w-md mx-auto my-8 shadow-sm">
            <Clock className="h-10 w-10 text-[#64748B] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#0F172A]">No deadlines in this view</h3>
            <p className="text-xs text-[#64748B] mt-1">
              All deadlines are either completed or scheduled for later recruitment cycles.
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
                className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#2563EB]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0">
                    {item.company.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#2563EB]">
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
                      className="text-base font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors block mt-0.5"
                    >
                      {item.role}
                    </Link>

                    <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1 flex-wrap">
                      <span>{item.location}</span>
                      <span>·</span>
                      <span className="text-[#16A34A] font-medium">{item.stipend || "Competitive"}</span>
                    </div>
                  </div>
                </div>

                {/* Right timing countdown & actions */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#0F172A] block">
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
                    <Button size="sm" className="shadow-sm">
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

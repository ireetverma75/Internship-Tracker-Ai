"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Send,
  CalendarCheck,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StatusDonutChart } from "@/components/dashboard/status-donut-chart";
import { ApplicationsBarChart } from "@/components/dashboard/applications-bar-chart";
import { UpcomingDeadlinesWidget } from "@/components/dashboard/upcoming-deadlines-widget";
import { RecentActivityWidget } from "@/components/dashboard/recent-activity-widget";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { InternshipFormModal } from "@/components/internships/internship-form-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { store, NOTIFY_CHANGE_EVENT } from "@/lib/storage";
import { Internship, Application, DashboardMetrics } from "@/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [m, ints, apps] = await Promise.all([
        store.computeDashboardMetrics(),
        store.getInternships(),
        store.getApplications()
      ]);
      setMetrics(m);
      setInternships(ints);
      setApplications(apps);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(NOTIFY_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(NOTIFY_CHANGE_EVENT, loadData);
  }, []);

  const barChartData = [
    { month: "Aug", applications: 1, interviews: 0 },
    { month: "Sep", applications: 3, interviews: 1 },
    { month: "Oct", applications: applications.length || 5, interviews: metrics?.interviewsScheduledCount || 2 }
  ];

  return (
    <AppShell>
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recruitment Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry on your technical internship applications, matches, and deadlines.
          </p>
        </div>
        <DashboardQuickActions onOpenAddModal={() => setIsAddModalOpen(true)} />
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <MetricCard
          title="Saved Internships"
          value={metrics?.savedInternshipsCount ?? 0}
          subtitle="Opportunities bookmarked"
          icon={Bookmark}
          color="blue"
          delay={0.05}
        />
        <MetricCard
          title="Applications Sent"
          value={metrics?.applicationsSubmittedCount ?? 0}
          subtitle="In active recruiting stages"
          icon={Send}
          color="cyan"
          delay={0.1}
        />
        <MetricCard
          title="Interviews Scheduled"
          value={metrics?.interviewsScheduledCount ?? 0}
          subtitle="Technical & behavioral rounds"
          icon={CalendarCheck}
          color="emerald"
          delay={0.15}
        />
        <MetricCard
          title="Upcoming Deadlines"
          value={metrics?.upcomingDeadlinesCount ?? 0}
          subtitle="Closing in next 30 days"
          icon={Clock}
          color="amber"
          delay={0.2}
        />
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Pipeline Distribution Donut */}
        <div className="rounded-2xl bg-[#111827] border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">Pipeline Breakdown</h3>
            <span className="text-[11px] text-slate-400">By status stage</span>
          </div>
          {metrics && <StatusDonutChart statusCounts={metrics.statusCounts} />}
        </div>

        {/* Applications Over Time Bar Chart */}
        <div className="rounded-2xl bg-[#111827] border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">Activity Velocity</h3>
            <span className="text-[11px] text-slate-400">Monthly submissions</span>
          </div>
          <ApplicationsBarChart data={barChartData} />
        </div>

        {/* Deadlines Widget */}
        <div className="flex flex-col gap-6">
          <UpcomingDeadlinesWidget internships={internships} />
          <RecentActivityWidget applications={applications} />
        </div>
      </div>

      {/* Recommended Internships Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#35D5F2]" />
              <span>Recommended Target Opportunities</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              High match probability opportunities from top tech companies
            </p>
          </div>
          <Link
            href="/internships"
            className="text-xs text-[#4F7CFF] hover:underline inline-flex items-center gap-1"
          >
            Explore All Opportunities <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {internships.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-[#4F7CFF]">
                    {item.company}
                  </span>
                  <Badge variant="default">{item.work_mode || "Remote"}</Badge>
                </div>
                <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">
                  {item.role}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {item.description || "Exciting engineering role with cutting-edge stack."}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {(item.required_skills || []).slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">{item.stipend || "Competitive"}</span>
                <div className="flex items-center gap-2">
                  <Link href={`/internships/${item.id}`}>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </Link>
                  <Link
                    href={`/resume-match?role=${encodeURIComponent(
                      item.role
                    )}&company=${encodeURIComponent(
                      item.company
                    )}&skills=${encodeURIComponent(
                      (item.required_skills || []).join(",")
                    )}`}
                  >
                    <Button size="sm">
                      <FileCheck className="h-3.5 w-3.5 mr-1" />
                      <span>Match</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      <InternshipFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
      />
    </AppShell>
  );
}

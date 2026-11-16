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
  FileCheck,
  CheckCircle2,
  Award,
  Layers,
  ChevronRight,
  Database,
  BarChart3,
  UserCheck
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
import { INITIAL_PROFILE } from "@/lib/demo-data";
import { Internship, Application, DashboardMetrics, StudentProfile } from "@/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_PROFILE);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setProfile(store.getStudentProfile());
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

  const barChartData = applications.reduce<Array<{ month: string; applications: number; interviews: number }>>((months, application) => {
    const dateValue = application.applied_date || application.created_at;
    if (!dateValue) return months;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return months;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    let month = months.find((entry) => entry.month === key);
    if (!month) {
      month = { month: key, applications: 0, interviews: 0 };
      months.push(month);
    }
    month.applications += 1;
    if (application.status === "Interview") month.interviews += 1;
    return months;
  }, []).slice(-4).map((month) => ({
    ...month,
    month: new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(`${month.month}-01T00:00:00`))
  }));

  const scoredApplications = applications.filter((application) => typeof application.match_score === "number");
  const averageResumeMatch = scoredApplications.length
    ? Math.round(scoredApplications.reduce((total, application) => total + (application.match_score || 0), 0) / scoredApplications.length)
    : null;

  return (
    <AppShell>
      {/* 1. Personalized Welcome Section */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 backdrop-blur-sm p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Candidate Dashboard
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">Class of {profile.graduation_year}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Welcome back, {profile.full_name || "Student User"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              You have <strong className="text-slate-800">{metrics?.savedInternshipsCount ?? 0} saved roles</strong> and{" "}
              <strong className="text-slate-800">{metrics?.upcomingDeadlinesCount ?? 0} closing deadlines</strong> this month.
              {averageResumeMatch === null
                ? "Run a resume match to see compatibility across your saved opportunities."
                : <> Your scored applications average <strong className="text-[#2563EB]">{averageResumeMatch}%</strong> alignment.</>}
            </p>
          </div>

          {/* Profile Completion Indicator */}
          <div className="glass-panel shrink-0 rounded-xl p-4 min-w-[260px] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-[#2563EB]" />
                Profile Snapshot
              </span>
              <span className="font-bold text-[#22D3EE]">{profile.skills.length} skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.slice(0, 5).map((skill) => (
                <span key={skill} className="glass-skill-chip">{skill}</span>
              ))}
              {profile.skills.length === 0 && <span className="text-xs text-slate-400">Add profile skills to personalize matching.</span>}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{profile.degree}</span>
              <Link href="/profile" className="text-[#2563EB] hover:underline font-medium">
                Complete &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Navigation Bar */}
      <div className="mt-6">
        <DashboardQuickActions onOpenAddModal={() => setIsAddModalOpen(true)} />
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mt-6">
        <MetricCard
          title="Internships"
          value={internships.length}
          subtitle="Available in your tracker"
          icon={Bookmark}
          color="blue"
          delay={0.05}
        />
        <MetricCard
          title="Applications"
          value={metrics?.applicationsSubmittedCount ?? 0}
          subtitle="Submitted applications"
          icon={Send}
          color="cyan"
          delay={0.1}
        />
        <MetricCard
          title="Interviews"
          value={metrics?.interviewsScheduledCount ?? 0}
          subtitle="Scheduled stages"
          icon={Sparkles}
          color="emerald"
          delay={0.15}
        />
        <MetricCard
          title="Shortlisted"
          value={metrics?.statusCounts?.Selected ?? 0}
          subtitle="Selected opportunities"
          icon={Award}
          color="blue"
          delay={0.2}
        />
        <MetricCard
          title="Resume Match"
          value={averageResumeMatch === null ? "—" : `${averageResumeMatch}%`}
          subtitle="From scored applications"
          icon={FileCheck}
          color="cyan"
          delay={0.25}
        />
        <MetricCard
          title="Saved"
          value={metrics?.savedInternshipsCount ?? 0}
          subtitle="Bookmarked internships"
          icon={Clock}
          color="amber"
          delay={0.3}
        />
      </div>

      {/* 3. Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Pipeline Distribution Donut */}
        <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Pipeline Distribution</h3>
              <p className="text-[11px] text-slate-500">Applications by current recruiting stage</p>
            </div>
            <Link href="/applications" className="text-xs text-[#2563EB] hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="py-2">
            <StatusDonutChart
              statusCounts={metrics?.statusCounts || { Saved: 0, Applied: 0, Assessment: 0, Interview: 0, Selected: 0, Rejected: 0 }}
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Stage velocity</span>
            <span className="text-emerald-600 font-medium">Live pipeline summary</span>
          </div>
        </div>

        {/* Application Volume Bar Chart */}
        <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Monthly Applications</h3>
              <p className="text-[11px] text-slate-500">Submitted vs technical interviews</p>
            </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Recent activity
            </span>
          </div>
          <div className="py-2">
            <ApplicationsBarChart data={barChartData} />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total submissions</span>
            <span className="font-semibold text-slate-800">{applications.length} applications</span>
          </div>
        </div>

        {/* Skill Analysis Overview Card */}
        <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-sm font-semibold text-[#0F172A]">Skill Match Analysis</h3>
            </div>
            <Link href="/skill-gap" className="text-xs text-[#2563EB] hover:underline font-medium inline-flex items-center gap-0.5">
              Gap Analysis <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 py-4">
            {profile.skills.map((skill) => <span className="glass-skill-chip" key={skill}>{skill}</span>)}
            {profile.skills.length === 0 && <p className="text-xs text-slate-400">Add skills to your profile to personalize job matching.</p>}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Profile skills</span>
            <Link href="/skill-gap" className="text-[#60A5FA] font-medium">Review skill gaps</Link>
          </div>
        </div>
      </div>

      {/* 4. Upcoming Deadlines & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <UpcomingDeadlinesWidget internships={internships} />
        <RecentActivityWidget applications={applications} />
      </div>

      {/* 5. Recommended Internships Section */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
              Recommended Opportunities
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked opportunities tailored to your technical skills & career goals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/jobs"
              className="text-xs text-[#2563EB] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Database className="h-3.5 w-3.5 mr-0.5" />
              HF Jobs Dataset (390+) &rarr;
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/internships"
              className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
            >
              All Internships &rarr;
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {internships.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all duration-150 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-[#2563EB]">
                    {item.company}
                  </span>
                  <Badge variant="default">{item.work_mode || "Remote"}</Badge>
                </div>
                <h4 className="text-sm font-bold text-[#0F172A] mt-1.5 line-clamp-1">
                  {item.role}
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description || "Exciting engineering role with modern production stack."}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(item.required_skills || []).slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-600">{item.stipend || "Competitive"}</span>
                <div className="flex items-center gap-2">
                  <Link href={`/internships/${item.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
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
                    <Button size="sm" className="h-7 text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
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

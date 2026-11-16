"use client";

import React from "react";
import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { Application } from "@/types";
import { getStatusColor } from "@/lib/utils";

interface RecentActivityWidgetProps {
  applications: Application[];
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  applications
}) => {
  const recent = applications.slice(0, 5);

  return (
    <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0] p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#2563EB]" />
          <h3 className="text-sm font-semibold text-[#0F172A]">Recent Applications</h3>
        </div>
        <Link
          href="/applications"
          className="text-xs text-[#2563EB] hover:underline inline-flex items-center gap-1 font-medium"
        >
          Open Kanban <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {recent.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No recent activity recorded
          </p>
        ) : (
          recent.map((app) => {
            const statusStyle = getStatusColor(app.status);

            return (
              <div
                key={app.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 hover:border-slate-300 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-semibold text-[#0F172A] truncate">
                    {app.company}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {app.role}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

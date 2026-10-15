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
    <div className="rounded-2xl bg-[#111827] border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#35D5F2]" />
          <h3 className="text-sm font-semibold text-white">Application Pipeline</h3>
        </div>
        <Link
          href="/applications"
          className="text-xs text-[#4F7CFF] hover:underline inline-flex items-center gap-1"
        >
          Open Kanban <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 space-y-2.5">
        {recent.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No recent activity recorded
          </p>
        ) : (
          recent.map((app) => {
            const statusStyle = getStatusColor(app.status);

            return (
              <div
                key={app.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {app.company}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {app.role}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
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

"use client";

import React from "react";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, AlertCircle } from "lucide-react";
import { Internship } from "@/types";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface UpcomingDeadlinesWidgetProps {
  internships: Internship[];
}

export const UpcomingDeadlinesWidget: React.FC<UpcomingDeadlinesWidgetProps> = ({
  internships
}) => {
  const withDeadlines = internships
    .filter((i) => i.deadline)
    .map((i) => ({
      ...i,
      timing: getDaysRemaining(i.deadline)
    }))
    .sort((a, b) => a.timing.days - b.timing.days)
    .slice(0, 5);

  return (
    <div className="rounded-2xl bg-[#111827] border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Upcoming Deadlines</h3>
        </div>
        <Link
          href="/deadlines"
          className="text-xs text-[#4F7CFF] hover:underline inline-flex items-center gap-1"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 space-y-2.5">
        {withDeadlines.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No upcoming deadlines recorded
          </p>
        ) : (
          withDeadlines.map((item) => {
            const urgencyBadge = {
              overdue: "danger",
              urgent: "warning",
              soon: "warning",
              future: "default",
              none: "default"
            }[item.timing.urgency] as any;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <Link
                    href={`/internships/${item.id}`}
                    className="text-xs font-semibold text-white hover:text-[#4F7CFF] truncate block transition-colors"
                  >
                    {item.role}
                  </Link>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.company} · {item.location}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={urgencyBadge}>{item.timing.label}</Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

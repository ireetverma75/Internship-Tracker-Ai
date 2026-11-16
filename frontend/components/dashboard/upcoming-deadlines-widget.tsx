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
    <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0] p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-[#0F172A]">Upcoming Deadlines</h3>
        </div>
        <Link
          href="/deadlines"
          className="text-xs text-[#2563EB] hover:underline inline-flex items-center gap-1 font-medium"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {withDeadlines.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
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
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 hover:border-slate-300 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <Link
                    href={`/internships/${item.id}`}
                    className="text-xs font-semibold text-[#0F172A] hover:text-[#2563EB] truncate block transition-colors"
                  >
                    {item.role}
                  </Link>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.company} &bull; {item.location || "Remote"}
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

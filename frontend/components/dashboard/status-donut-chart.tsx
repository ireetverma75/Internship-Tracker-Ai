"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { ApplicationStatus } from "@/types";

interface StatusDonutChartProps {
  statusCounts: Record<ApplicationStatus, number>;
}

const COLOR_MAP: Record<ApplicationStatus, string> = {
  Saved: "#64748B",       // Slate
  Applied: "#2563EB",     // Primary Blue
  Assessment: "#F59E0B",  // Warning Amber
  Interview: "#38BDF8",   // Secondary Blue
  Selected: "#16A34A",    // Success Green
  Rejected: "#DC2626"     // Danger Red
};

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({
  statusCounts
}) => {
  const data = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: COLOR_MAP[status as ApplicationStatus] || "#2563EB"
    }));

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        <p>No applications logged yet</p>
        <p className="text-[11px] mt-1 text-slate-500">
          Add an application to see pipeline distribution
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E2E8F0",
              borderRadius: "0.5rem",
              color: "#0F172A",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)"
            }}
            formatter={(value: any, name: any) => [`${value} applications`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", color: "#64748B" }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Statistic */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span className="text-2xl font-bold text-[#0F172A] tabular-nums">{total}</span>
        <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          Total
        </span>
      </div>
    </div>
  );
};

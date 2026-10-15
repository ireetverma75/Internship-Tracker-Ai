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
  Applied: "#4F7CFF",     // Electric Blue
  Assessment: "#F59E0B",  // Amber
  Interview: "#35D5F2",   // Cyan
  Selected: "#10B981",    // Emerald
  Rejected: "#EF4444"     // Rose Red
};

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({
  statusCounts
}) => {
  const data = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: COLOR_MAP[status as ApplicationStatus] || "#4F7CFF"
    }));

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
        <p>No applications logged yet</p>
        <p className="text-[11px] mt-1 text-slate-600">
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
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              borderColor: "#1E293B",
              borderRadius: "0.5rem",
              color: "#F8FAFC",
              fontSize: "12px"
            }}
            formatter={(value: any, name: any) => [`${value} applications`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", color: "#94A3B8" }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Statistic */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span className="text-2xl font-bold text-white tabular-nums">{total}</span>
        <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          Total
        </span>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

interface ApplicationsBarChartProps {
  data: Array<{ month: string; applications: number; interviews: number }>;
}

export const ApplicationsBarChart: React.FC<ApplicationsBarChartProps> = ({
  data
}) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#1E293B" }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#1E293B" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              borderColor: "#1E293B",
              borderRadius: "0.5rem",
              color: "#F8FAFC",
              fontSize: "12px"
            }}
          />
          <Bar dataKey="applications" name="Applications" fill="#4F7CFF" radius={[4, 4, 0, 0]} />
          <Bar dataKey="interviews" name="Interviews" fill="#35D5F2" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

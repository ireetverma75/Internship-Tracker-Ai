"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  color: "blue" | "cyan" | "emerald" | "amber";
  delay?: number;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  delay = 0,
  badge
}) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      text: "text-[#2563EB]",
      border: "border-blue-100"
    },
    cyan: {
      bg: "bg-sky-50",
      text: "text-[#0284C7]",
      border: "border-sky-100"
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-[#16A34A]",
      border: "border-emerald-100"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-[#D97706]",
      border: "border-amber-100"
    }
  };

  const scheme = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="glass-panel glass-panel--interactive p-4 rounded-2xl transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center border border-white/10",
            scheme.bg,
            scheme.text,
            scheme.border
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-white tracking-tight tabular-nums flex items-baseline gap-2">
          {value}
          {badge && (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};

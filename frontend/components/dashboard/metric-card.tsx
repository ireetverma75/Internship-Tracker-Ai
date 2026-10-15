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
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  delay = 0
}) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-500/10",
      text: "text-[#4F7CFF]",
      border: "border-blue-500/20",
      glow: "hover:border-blue-500/40"
    },
    cyan: {
      bg: "bg-[#35D5F2]/10",
      text: "text-[#35D5F2]",
      border: "border-[#35D5F2]/20",
      glow: "hover:border-[#35D5F2]/40"
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "hover:border-emerald-500/40"
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      glow: "hover:border-amber-500/40"
    }
  };

  const scheme = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -2 }}
      className={cn(
        "p-5 rounded-2xl bg-[#111827] border border-slate-800 transition-all duration-200 shadow-lg relative overflow-hidden",
        scheme.glow
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center border",
            scheme.bg,
            scheme.text,
            scheme.border
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
          {value}
        </div>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};

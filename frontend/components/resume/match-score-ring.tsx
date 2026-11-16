"use client";

import React from "react";
import { motion } from "framer-motion";

interface MatchScoreRingProps {
  score: number;
  size?: number;
}

export const MatchScoreRing: React.FC<MatchScoreRingProps> = ({
  score,
  size = 140
}) => {
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "#16A34A"; // Success green
  let scoreLabel = "Strong Match";

  if (score < 60) {
    strokeColor = "#DC2626"; // Danger red
    scoreLabel = "Skill Gap Identified";
  } else if (score < 80) {
    strokeColor = "#F59E0B"; // Warning amber
    scoreLabel = "Moderate Match";
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Score Number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-[#0F172A] tabular-nums tracking-tight">
            {score}%
          </span>
          <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">
            Match Index
          </span>
        </div>
      </div>

      <span
        className="mt-3 text-xs font-semibold px-3 py-1 rounded-full border"
        style={{
          color: strokeColor,
          borderColor: strokeColor + "40",
          backgroundColor: strokeColor + "15"
        }}
      >
        {scoreLabel}
      </span>
    </div>
  );
};

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
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "#10B981"; // Emerald
  let glowColor = "rgba(16, 185, 129, 0.25)";
  let scoreLabel = "Strong Match";

  if (score < 60) {
    strokeColor = "#EF4444"; // Rose
    glowColor = "rgba(239, 68, 68, 0.25)";
    scoreLabel = "Skill Gap Identified";
  } else if (score < 80) {
    strokeColor = "#F59E0B"; // Amber
    glowColor = "rgba(245, 158, 11, 0.25)";
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
            stroke="#1E293B"
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
            style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
          />
        </svg>

        {/* Center Score Number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
            {score}%
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Match Index
          </span>
        </div>
      </div>

      <span
        className="mt-3 text-xs font-bold px-3 py-1 rounded-full border"
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

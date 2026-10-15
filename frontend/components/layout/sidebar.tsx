"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  FileCheck,
  Kanban,
  Clock,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Discover Internships", href: "/internships", icon: Compass },
  { name: "AI Job Analyzer", href: "/analyzer", icon: Sparkles },
  { name: "Resume Match", href: "/resume-match", icon: FileCheck },
  { name: "My Applications", href: "/applications", icon: Kanban },
  { name: "Deadlines", href: "/deadlines", icon: Clock },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings }
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 z-40 bg-[#0B1020] border-r border-slate-800/80 select-none transition-colors"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden group"
        >
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#35D5F2] flex items-center justify-center shadow-lg shadow-[#4F7CFF]/20">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="font-bold text-base tracking-tight text-white group-hover:text-[#35D5F2] transition-colors">
                Internship<span className="text-[#4F7CFF]">AI</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Discovery & Match
              </span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#4F7CFF]/15 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#4F7CFF]"
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-[#35D5F2]"
                    : "text-slate-400 group-hover:text-white"
                )}
              />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Collapse Button */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium">
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Menu</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

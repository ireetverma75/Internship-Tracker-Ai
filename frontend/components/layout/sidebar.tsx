"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Compass,
  FileText,
  Sparkles,
  GitCompare,
  Kanban,
  Bookmark,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart3,
  Briefcase,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { store, NOTIFY_CHANGE_EVENT } from "@/lib/storage";
import { INITIAL_PROFILE } from "@/lib/demo-data";
import type { StudentProfile } from "@/types";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Discover Internships", href: "/internships", icon: Compass },
  { name: "HF Jobs Dataset", href: "/jobs", icon: Database },
  { name: "Resume Analyzer", href: "/analyzer", icon: FileText },
  { name: "AI Career Assistant", href: "/resume-match", icon: Sparkles },
  { name: "Skill Gap Analysis", href: "/skill-gap", icon: BarChart3 },
  { name: "Application Tracker", href: "/applications", icon: Kanban },
  { name: "Analytics", href: "/deadlines", icon: BarChart3 },
  { name: "Saved Internships", href: "/internships?saved=true", icon: Bookmark },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings }
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_PROFILE);

  useEffect(() => {
    const syncProfile = () => setProfile(store.getStudentProfile());
    syncProfile();
    window.addEventListener(NOTIFY_CHANGE_EVENT, syncProfile);
    return () => window.removeEventListener(NOTIFY_CHANGE_EVENT, syncProfile);
  }, []);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn("glass-sidebar hidden md:flex flex-col h-[calc(100vh-24px)] sticky top-3 z-40 select-none text-slate-300")}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.2),transparent_42%)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden group"
        >
          <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-sm shadow-blue-500/20">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="font-bold text-sm tracking-tight text-white group-hover:text-[#38BDF8] transition-colors">
                Internship<span className="text-[#38BDF8]">AI</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                SaaS Career Suite
              </span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/internships?saved=true"
              ? pathname === "/internships" && typeof window !== "undefined" && window.location.search.includes("saved=true")
              : pathname === item.href ||
                (item.href !== "/dashboard" && !item.href.includes("?") && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn("glass-nav-item group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200", isActive && "glass-nav-item--active")}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-slate-200"
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
      <Link href="/profile" className="glass-sidebar-profile mx-2.5 mb-2 flex items-center gap-2.5 rounded-xl p-2.5" title="Profile settings">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#60A5FA] to-[#A78BFA] text-xs font-bold text-white">
          {profile.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "SU"}
        </span>
        {!isCollapsed && <span className="min-w-0"><span className="block truncate text-xs font-semibold text-white">{profile.full_name}</span><span className="block text-[10px] text-slate-400">Profile Settings</span></span>}
      </Link>

      <div className="p-2.5 border-t border-white/10">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#111C2F] transition-colors cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

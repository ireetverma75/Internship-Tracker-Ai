"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  Compass,
  FileText,
  Sparkles,
  GitCompare,
  Kanban,
  Bookmark,
  User,
  Settings,
  Database,
  BarChart3,
  Briefcase,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />

          {/* Drawer Menu */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
            className="glass-mobile-drawer relative w-72 max-w-[80vw] text-slate-300 h-full flex flex-col z-10 shadow-2xl"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E2E4A]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center text-white">
                  <Briefcase className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-white">
                  Internship<span className="text-[#38BDF8]">AI</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182B4D] transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
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
                    onClick={onClose}
                    className={cn(
                      "glass-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors",
                      isActive
                        ? "glass-nav-item--active text-white font-semibold"
                        : "text-slate-300"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

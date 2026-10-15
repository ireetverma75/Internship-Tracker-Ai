"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  Compass,
  Sparkles,
  FileCheck,
  Kanban,
  Clock,
  User,
  Settings,
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
            className="fixed inset-0 bg-[#0B1020]/80 backdrop-blur-md"
          />

          {/* Drawer Menu */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="relative w-72 max-w-[80vw] h-full bg-[#0B1020] border-r border-slate-800 p-5 flex flex-col justify-between z-10"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#35D5F2] flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-base text-white">
                    Internship<span className="text-[#4F7CFF]">AI</span>
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <div className="mt-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#4F7CFF]/15 text-white font-semibold"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-[#35D5F2]" : "text-slate-400"
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#35D5F2] flex items-center justify-center font-bold text-xs text-white">
                AC
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-white">Alex Chen</span>
                <span className="text-slate-400 text-[10px]">CS Senior '27</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

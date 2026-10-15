"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  Plus,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { store, NOTIFY_CHANGE_EVENT } from "@/lib/storage";

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileMenu,
  onOpenAddModal
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    store.checkBackendStatus().then(setIsBackendOnline);
    const handleSync = () => {
      setIsBackendOnline(store.getIsBackendOnline());
    };
    window.addEventListener(NOTIFY_CHANGE_EVENT, handleSync);
    return () => window.removeEventListener(NOTIFY_CHANGE_EVENT, handleSync);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/internships?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Human-readable breadcrumb
  const getBreadcrumbTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/internships") return "Discover Internships";
    if (pathname.startsWith("/internships/")) return "Internship Details";
    if (pathname === "/analyzer") return "AI Job Analyzer";
    if (pathname === "/resume-match") return "Resume Match";
    if (pathname === "/applications") return "My Applications";
    if (pathname === "/deadlines") return "Deadlines & Timelines";
    if (pathname === "/profile") return "Student Profile";
    if (pathname === "/settings") return "Settings";
    return "Overview";
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#0B1020]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition-colors hidden sm:inline">
            InternshipAI
          </Link>
          <ChevronRight className="h-3.5 w-3.5 hidden sm:inline text-slate-600" />
          <span className="text-white font-semibold">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center max-w-md w-full relative"
      >
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search internships, skills (e.g. PyTorch, React), companies..."
          className="w-full h-9 pl-9 pr-4 text-xs rounded-full bg-[#111827] border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Backend / Demo Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span
            className={`h-2 w-2 rounded-full animate-pulse ${
              isBackendOnline ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span className="text-slate-300">
            {isBackendOnline ? "FastAPI Live" : "Demo Mode"}
          </span>
        </div>

        {/* Quick Add Action */}
        <Button
          size="sm"
          onClick={onOpenAddModal}
          className="hidden sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          <span>Add Opportunity</span>
        </Button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#4F7CFF]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#111827] border border-slate-800 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">Notifications</span>
                <span className="text-[10px] text-slate-400">3 recent alerts</span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <p className="font-medium text-white">NVIDIA Assessment Due</p>
                  <p className="text-[11px] text-amber-400 mt-0.5">Coding assessment deadline is in 12 days.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <p className="font-medium text-white">Microsoft Interview Upcoming</p>
                  <p className="text-[11px] text-cyan-400 mt-0.5">Technical round scheduled for next week.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <p className="font-medium text-white">Resume Match High</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">92% compatibility with Azure Cloud Intern.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="View Student Profile"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#35D5F2] flex items-center justify-center font-bold text-xs text-white shadow-md">
            AC
          </div>
          <span className="hidden xl:inline text-xs font-medium text-slate-300">
            Alex Chen
          </span>
        </Link>
      </div>
    </header>
  );
};

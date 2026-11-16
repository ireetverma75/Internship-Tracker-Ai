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
import { INITIAL_PROFILE } from "@/lib/demo-data";
import { StudentProfile } from "@/types";

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
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_PROFILE);

  useEffect(() => {
    store.checkBackendStatus().then(setIsBackendOnline);
    const handleSync = () => {
      setProfile(store.getStudentProfile());
      setIsBackendOnline(store.getIsBackendOnline());
    };
    handleSync();
    window.addEventListener(NOTIFY_CHANGE_EVENT, handleSync);
    return () => window.removeEventListener(NOTIFY_CHANGE_EVENT, handleSync);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/internships?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getBreadcrumbTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/internships") return "Discover Internships";
    if (pathname.startsWith("/internships/")) return "Internship Details";
    if (pathname === "/jobs") return "Hugging Face Jobs Dataset";
    if (pathname.startsWith("/jobs/")) return "Job Details & AI Match";
    if (pathname === "/analyzer") return "Resume & Job Analyzer";
    if (pathname === "/resume-match") return "AI Job Matching";
    if (pathname === "/skill-gap") return "Skill Gap Analysis";
    if (pathname === "/applications") return "My Applications";
    if (pathname === "/notifications") return "Notifications";
    if (pathname === "/deadlines") return "Deadlines & Timelines";
    if (pathname === "/profile") return "Student Profile";
    if (pathname === "/settings") return "Settings";
    return "Overview";
  };

  return (
    <header className="glass-navbar sticky top-3 z-30 h-16 w-full px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition-colors hidden sm:inline">
            InternshipAI
          </Link>
          <ChevronRight className="h-3.5 w-3.5 hidden sm:inline text-slate-500" />
          <span className="text-white font-semibold">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center max-w-md w-full relative"
      >
        <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search internships, skills (e.g. PyTorch, React), companies..."
          className="glass-input w-full h-10 pl-10 pr-4 text-xs rounded-xl"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Backend / Demo Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0F172A] border border-[#1E293B] text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <span
            className={`h-2 w-2 rounded-full ${
              isBackendOnline ? "bg-[#22C55E] animate-pulse" : "bg-[#F59E0B]"
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
          className="hidden sm:inline-flex text-xs h-8 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] border-0 shadow-[0_12px_30px_rgba(99,102,241,0.28)] hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span>Add Opportunity</span>
        </Button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#111C2F] transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2563EB]" />
          </button>

          {showNotifications && (
            <div className="glass-panel absolute right-0 mt-2 w-80 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Bell className="h-4 w-4 text-[#22D3EE]" />
                <span className="text-xs font-semibold text-white">Notifications</span>
              </div>
              <p className="py-4 text-xs leading-relaxed text-slate-400">Updates are generated from your tracked applications and upcoming internship deadlines.</p>
              <Link href="/notifications" onClick={() => setShowNotifications(false)} className="text-xs font-semibold text-[#7DD3FC] hover:text-white">Open activity feed <ChevronRight className="inline h-3.5 w-3.5" /></Link>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <Link
          href="/profile"
          className="glass-profile-link flex items-center gap-2 p-1.5 rounded-xl transition-colors"
          title="View Student Profile"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#A78BFA] flex items-center justify-center font-bold text-xs text-white shadow-xs">
            {profile.full_name ? profile.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() : "SU"}
          </div>
          <span className="hidden xl:inline text-xs font-medium text-slate-700">
            {profile.full_name || "Student User"}
          </span>
        </Link>
      </div>
    </header>
  );
};

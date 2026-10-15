"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  Download,
  RotateCcw,
  Shield,
  Server,
  LogOut,
  Palette,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { store, NOTIFY_CHANGE_EVENT } from "@/lib/storage";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    store.checkBackendStatus().then(setIsBackendOnline);
    const handleSync = () => {
      setIsBackendOnline(store.getIsBackendOnline());
    };
    window.addEventListener(NOTIFY_CHANGE_EVENT, handleSync);
    return () => window.removeEventListener(NOTIFY_CHANGE_EVENT, handleSync);
  }, []);

  const handleExportData = async () => {
    try {
      const jsonStr = await store.exportDataJson();
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `internship_tracker_backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported application and opportunity dataset as JSON!");
    } catch {
      toast.error("Failed to export data");
    }
  };

  const handleResetDemoData = () => {
    store.resetDemoData();
    setIsResetModalOpen(false);
    toast.success("Restored seed data (Microsoft, NVIDIA, Stripe, etc.)");
  };

  const handleSignOut = () => {
    toast.info("Signed out of demo reviewer session");
    router.push("/");
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="h-7 w-7 text-[#4F7CFF]" />
          <span>System Settings & Architecture</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review system runtime telemetry, database configuration, privacy safeguards, and demo data controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Environment & Backend Runtime Status */}
        <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-[#35D5F2]" />
              <span>Backend & Database Infrastructure</span>
            </h3>
            <Badge variant={isBackendOnline ? "success" : "warning"}>
              {isBackendOnline ? "FastAPI Connected" : "Local Demo Mode"}
            </Badge>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-semibold text-white">
                Supabase PostgreSQL / SQLite Fallback
              </span>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">PDF Text Extractor:</span>
              <span className="font-semibold text-white">
                PyMuPDF (fitz) v1.24+
              </span>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">AI Scoring Engine:</span>
              <span className="font-semibold text-white">
                Gemini/OpenAI Adapter + Deterministic Fallback
              </span>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Security Architecture:</span>
              <span className="font-semibold text-emerald-400">
                Row Level Security (RLS) & SSRF Protection
              </span>
            </div>
          </div>
        </div>

        {/* Visual Identity & Theme */}
        <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#4F7CFF]" />
              <span>Visual Identity & Theme</span>
            </h3>
            <Badge variant="primary">Midnight Navy Active</Badge>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The user interface is crafted using deep midnight navy (<code className="text-slate-300">#0B1020</code>), dark slate surfaces (<code className="text-slate-300">#111827</code>), electric blue (<code className="text-slate-300">#4F7CFF</code>), and cyan highlights (<code className="text-slate-300">#35D5F2</code>).
          </p>

          <div className="flex items-center gap-2 pt-2">
            <div className="h-8 w-8 rounded-lg bg-[#0B1020] border border-slate-700" title="#0B1020 Midnight Navy" />
            <div className="h-8 w-8 rounded-lg bg-[#111827] border border-slate-700" title="#111827 Dark Slate" />
            <div className="h-8 w-8 rounded-lg bg-[#4F7CFF]" title="#4F7CFF Electric Blue" />
            <div className="h-8 w-8 rounded-lg bg-[#35D5F2]" title="#35D5F2 Cyan Highlight" />
            <div className="h-8 w-8 rounded-lg bg-[#10B981]" title="#10B981 Emerald Green" />
            <div className="h-8 w-8 rounded-lg bg-[#F59E0B]" title="#F59E0B Amber Warning" />
          </div>
        </div>

        {/* Data Persistence & Export Controls */}
        <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            Data Backup & Demonstration Management
          </h3>

          <p className="text-xs text-slate-400">
            Export all tracked applications, saved opportunities, and profile settings to an offline JSON file, or restore default seed data.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-1.5" />
              <span>Export JSON Backup</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 border-amber-500/30"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              <span>Reset Demo Seed Records</span>
            </Button>
          </div>
        </div>

        {/* Data Privacy & Compliance Notice */}
        <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Candidate Data Privacy & Ethics</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>In-Memory PDF Parsing:</strong> Resumes are processed strictly in memory via PyMuPDF; no raw document files are retained on disk without explicit consent.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>No Logged Resume Content:</strong> Logging pipelines filter out full resume text to prevent PII leakage.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>No Data Resale:</strong> Student data is never packaged or sold to third-party brokers.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Internship Tracker AI v1.0.0 · Academic Capstone Edition
        </span>

        <Button variant="outline" size="sm" onClick={handleSignOut} className="text-rose-400 hover:bg-rose-500/10">
          <LogOut className="h-4 w-4 mr-1.5" />
          <span>Exit Session</span>
        </Button>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Demo Data"
        description="This will restore the original seed opportunities (Microsoft, NVIDIA, Stripe, Atlassian, Figma, DeepMind) and default application records. Continue?"
        maxWidth="sm"
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setIsResetModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleResetDemoData}>
            Confirm Reset
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

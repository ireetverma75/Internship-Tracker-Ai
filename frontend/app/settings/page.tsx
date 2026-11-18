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
  const [isCheckingBackend, setIsCheckingBackend] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    store.checkBackendStatus().then(setIsBackendOnline);
    const handleSync = () => {
      setIsBackendOnline(store.getIsBackendOnline());
    };
    window.addEventListener(NOTIFY_CHANGE_EVENT, handleSync);
    return () => window.removeEventListener(NOTIFY_CHANGE_EVENT, handleSync);
  }, []);

  const handleTestBackendConnection = async () => {
    setIsCheckingBackend(true);
    try {
      const online = await store.checkBackendStatus();
      setIsBackendOnline(online);
      if (online) {
        toast.success("FastAPI backend is healthy and responding!");
      } else {
        toast.warning("Backend is unreachable. Using offline client-side fallback.");
      }
    } catch {
      toast.error("Error pinging backend");
    } finally {
      setIsCheckingBackend(false);
    }
  };

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
      <div className="pb-6 border-b border-[#E2E8F0]">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="h-7 w-7 text-[#2563EB]" />
          <span>System Settings & Architecture</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Review system runtime telemetry, database configuration, privacy safeguards, and demo data controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Environment & Backend Runtime Status */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <Server className="h-4 w-4 text-[#2563EB]" />
              <span>Backend & Database Infrastructure</span>
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTestBackendConnection}
                disabled={isCheckingBackend}
                className="h-7 text-xs px-2 text-[#2563EB]"
              >
                {isCheckingBackend ? "Testing..." : "Test Connection"}
              </Button>
              <Badge variant={isBackendOnline ? "success" : "warning"}>
                {isBackendOnline ? "FastAPI Connected" : "Local Demo Mode"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#0F172A]">
            <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B]">Database Engine:</span>
              <span className="font-semibold text-[#0F172A]">
                PostgreSQL (Supabase) / SQLite Fallback
              </span>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B]">PDF Text Extractor:</span>
              <span className="font-semibold text-[#0F172A]">
                PyMuPDF (fitz) v1.24+
              </span>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B]">AI Scoring Engine:</span>
              <span className="font-semibold text-[#0F172A]">
                TF-IDF Cosine Similarity + NLP Skill Overlap
              </span>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B]">Dataset Integration:</span>
              <span className="font-semibold text-[#2563EB]">
                priyaagarwal19/Jobs-tabular-dataset (1,991 records)
              </span>
            </div>
          </div>
        </div>

        {/* Visual Identity & Theme */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#2563EB]" />
              <span>Design System & Color Palette</span>
            </h3>
            <Badge variant="primary">Linear SaaS Theme</Badge>
          </div>

          <p className="text-xs text-[#64748B] leading-relaxed">
            Crafted with clean SaaS principles: Crisp white surfaces (<code className="text-[#0F172A] font-semibold">#FFFFFF</code>), dark navy sidebar (<code className="text-[#0F172A] font-semibold">#101D35</code>), primary royal blue (<code className="text-[#0F172A] font-semibold">#2563EB</code>), and sky cyan (<code className="text-[#0F172A] font-semibold">#38BDF8</code>).
          </p>

          <div className="flex items-center gap-2 pt-2">
            <div className="h-7 w-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]" title="#F8FAFC Primary Background" />
            <div className="h-7 w-7 rounded-lg bg-[#101D35]" title="#101D35 Sidebar Navy" />
            <div className="h-7 w-7 rounded-lg bg-[#2563EB]" title="#2563EB Primary Blue" />
            <div className="h-7 w-7 rounded-lg bg-[#38BDF8]" title="#38BDF8 Secondary Blue" />
            <div className="h-7 w-7 rounded-lg bg-[#16A34A]" title="#16A34A Success Green" />
            <div className="h-7 w-7 rounded-lg bg-[#F59E0B]" title="#F59E0B Warning Amber" />
            <div className="h-7 w-7 rounded-lg bg-[#DC2626]" title="#DC2626 Danger Red" />
          </div>
        </div>

        {/* Data Persistence & Export Controls */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
            Data Backup & Demonstration Management
          </h3>

          <p className="text-xs text-[#64748B]">
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
              className="text-[#DC2626] hover:bg-rose-50"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              <span>Reset Demo Seed Records</span>
            </Button>
          </div>
        </div>

        {/* Data Privacy & Compliance Notice */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#16A34A]" />
            <span>Candidate Data Privacy & Ethics</span>
          </h3>

          <div className="space-y-2.5 text-xs text-[#0F172A] leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>
                <strong>In-Memory PDF Parsing:</strong> Resumes are processed strictly in memory via PyMuPDF; no raw document files are stored permanently without user consent.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>
                <strong>Zero PII Leakage:</strong> Server logs redact raw resume contents and credentials.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>
                <strong>No Data Reselling:</strong> Student details are private and never distributed to third parties.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex items-center justify-between">
        <span className="text-xs text-[#64748B]">
          Internship Tracker AI v2.0 · Linear SaaS Edition
        </span>

        <Button variant="outline" size="sm" onClick={handleSignOut} className="text-[#DC2626] hover:bg-rose-50">
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

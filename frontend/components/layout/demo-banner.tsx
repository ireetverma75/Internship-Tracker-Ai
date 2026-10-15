"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Info, X, RefreshCw, Server } from "lucide-react";
import { store, NOTIFY_CHANGE_EVENT } from "@/lib/storage";

export const DemoBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    store.checkBackendStatus().then(setIsBackendOnline);
    const handleSync = () => {
      setIsBackendOnline(store.getIsBackendOnline());
    };
    window.addEventListener(NOTIFY_CHANGE_EVENT, handleSync);
    return () => window.removeEventListener(NOTIFY_CHANGE_EVENT, handleSync);
  }, []);

  if (isDismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#0B1020] via-[#111827] to-[#0B1020] border-b border-blue-500/20 px-4 py-2 text-xs flex items-center justify-between text-slate-300">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-[#4F7CFF] animate-ping" />
        <span className="font-semibold text-white uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-[#4F7CFF] border border-blue-500/30">
          Academic Demo
        </span>
        <span className="truncate">
          {isBackendOnline ? (
            <span className="text-emerald-400 font-medium">
              Connected to live FastAPI backend at localhost:8000 (PyMuPDF & AI Engine active)
            </span>
          ) : (
            <span>
              Running in standalone browser evaluation mode with realistic seed data & deterministic AI fallback.
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            store.resetDemoData();
            window.location.reload();
          }}
          className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white underline transition-colors"
          title="Restore sample internships and applications"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reset Demo Data</span>
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

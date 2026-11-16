"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Info, X, RefreshCw, CheckCircle2 } from "lucide-react";
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
    <div className="glass-demo-banner w-full text-white px-4 py-1.5 text-xs flex items-center justify-between">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-[#38BDF8] border border-blue-400/30">
          Demo Mode
        </span>
        <span className="truncate text-slate-300 text-xs">
          {isBackendOnline ? (
            <span className="text-emerald-400 font-medium">
              Live FastAPI backend connected (:8000) &bull; PyMuPDF, Scikit-learn TF-IDF & Hugging Face Dataset active
            </span>
          ) : (
            <span>
              Standalone browser mode &bull; Realistic demo dataset & deterministic AI matcher active.
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
          className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Restore sample internships and applications"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reset Sample Data</span>
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

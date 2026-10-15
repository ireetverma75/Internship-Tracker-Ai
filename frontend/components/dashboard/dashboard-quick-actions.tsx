"use client";

import React from "react";
import Link from "next/link";
import { Plus, Sparkles, FileCheck, Kanban, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardQuickActionsProps {
  onOpenAddModal: () => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  onOpenAddModal
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button size="sm" onClick={onOpenAddModal} className="glow-blue">
        <Plus className="h-4 w-4 mr-1.5" />
        <span>Add Internship</span>
      </Button>

      <Link href="/analyzer">
        <Button variant="secondary" size="sm">
          <Sparkles className="h-4 w-4 mr-1.5 text-[#35D5F2]" />
          <span>Analyze Job Posting</span>
        </Button>
      </Link>

      <Link href="/resume-match">
        <Button variant="secondary" size="sm">
          <FileCheck className="h-4 w-4 mr-1.5 text-emerald-400" />
          <span>Match Resume</span>
        </Button>
      </Link>

      <Link href="/applications">
        <Button variant="outline" size="sm">
          <Kanban className="h-4 w-4 mr-1.5 text-slate-400" />
          <span>View Pipeline</span>
        </Button>
      </Link>
    </div>
  );
};

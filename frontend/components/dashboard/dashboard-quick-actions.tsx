"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  FileUp,
  Kanban,
  BarChart3,
  Plus,
  Sparkles,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardQuickActionsProps {
  onOpenAddModal: () => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  onOpenAddModal
}) => {
  return (
    <div className="glass-panel flex flex-wrap items-center gap-2.5 p-3.5 rounded-2xl">
      <Link href="/applications">
        <Button size="sm" variant="outline" className="text-xs h-8">
          <Kanban className="h-3.5 w-3.5 mr-1.5 text-[#2563EB]" />
          <span>View All Applications</span>
        </Button>
      </Link>

      <Link href="/internships">
        <Button size="sm" variant="outline" className="text-xs h-8">
          <Compass className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
          <span>Explore Internships</span>
        </Button>
      </Link>

      <Link href="/analyzer">
        <Button size="sm" variant="outline" className="text-xs h-8">
          <FileUp className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
          <span>Upload Resume</span>
        </Button>
      </Link>

      <Link href="/deadlines">
        <Button size="sm" variant="outline" className="text-xs h-8">
          <BarChart3 className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
          <span>View Analytics</span>
        </Button>
      </Link>

      <Link href="/jobs">
        <Button size="sm" variant="outline" className="text-xs h-8">
          <Database className="h-3.5 w-3.5 mr-1.5 text-[#2563EB]" />
          <span>HF Jobs Dataset</span>
        </Button>
      </Link>

      <Button size="sm" onClick={onOpenAddModal} className="text-xs h-8 shadow-xs ml-auto">
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        <span>Add Internship</span>
      </Button>
    </div>
  );
};

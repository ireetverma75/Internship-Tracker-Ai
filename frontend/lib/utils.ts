import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "No deadline";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getDaysRemaining(dateString?: string | null): {
  days: number;
  label: string;
  urgency: "overdue" | "urgent" | "soon" | "future" | "none";
} {
  if (!dateString) {
    return { days: 999, label: "No deadline", urgency: "none" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: diffDays,
      label: `${Math.abs(diffDays)}d overdue`,
      urgency: "overdue"
    };
  } else if (diffDays === 0) {
    return { days: 0, label: "Due today", urgency: "urgent" };
  } else if (diffDays <= 3) {
    return { days: diffDays, label: `${diffDays}d left`, urgency: "urgent" };
  } else if (diffDays <= 7) {
    return { days: diffDays, label: `${diffDays}d left`, urgency: "soon" };
  } else {
    return { days: diffDays, label: `${diffDays}d left`, urgency: "future" };
  }
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "Saved":
      return { bg: "bg-slate-800/80", text: "text-slate-300", border: "border-slate-700" };
    case "Applied":
      return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" };
    case "Assessment":
      return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" };
    case "Interview":
      return { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" };
    case "Selected":
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" };
    case "Rejected":
      return { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" };
    default:
      return { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700" };
  }
}

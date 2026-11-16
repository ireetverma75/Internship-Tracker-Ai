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
      return { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" };
    case "Applied":
      return { bg: "bg-blue-50", text: "text-[#2563EB]", border: "border-blue-200" };
    case "Assessment":
      return { bg: "bg-amber-50", text: "text-[#D97706]", border: "border-amber-200" };
    case "Interview":
      return { bg: "bg-sky-50", text: "text-[#0284C7]", border: "border-sky-200" };
    case "Selected":
      return { bg: "bg-emerald-50", text: "text-[#16A34A]", border: "border-emerald-200" };
    case "Rejected":
      return { bg: "bg-red-50", text: "text-[#DC2626]", border: "border-red-200" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };
  }
}

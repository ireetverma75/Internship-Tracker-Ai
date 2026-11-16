import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "accent"
    | "success"
    | "warning"
    | "danger"
    | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-blue-50 text-[#2563EB] border-blue-200/80 font-semibold",
    accent: "bg-sky-50 text-[#0284C7] border-sky-200 font-semibold",
    success: "bg-emerald-50 text-[#16A34A] border-emerald-200 font-semibold",
    warning: "bg-amber-50 text-[#D97706] border-amber-200 font-semibold",
    danger: "bg-red-50 text-[#DC2626] border-red-200 font-semibold",
    outline: "bg-white text-slate-700 border-slate-200 shadow-2xs"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

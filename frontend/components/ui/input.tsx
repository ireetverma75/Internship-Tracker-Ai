import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-[#0F172A] placeholder:text-slate-400 shadow-2xs",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75",
            icon && "pl-9",
            error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

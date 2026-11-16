import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[90px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-slate-400 shadow-2xs",
            "transition-all duration-150 resize-y",
            "focus-visible:outline-none focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75",
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

Textarea.displayName = "Textarea";

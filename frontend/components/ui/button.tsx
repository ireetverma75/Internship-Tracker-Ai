import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer";

    const variants = {
      primary:
        "bg-gradient-to-r from-[#60A5FA] to-[#22D3EE] hover:brightness-110 text-[#061225] shadow-[0_8px_24px_rgba(34,211,238,0.18)] border border-white/20 font-semibold",
      secondary:
        "bg-white/10 hover:bg-white/15 text-slate-100 border border-white/15 backdrop-blur-xl",
      outline:
        "border border-white/15 hover:border-white/30 bg-white/5 text-slate-100 hover:bg-white/10 shadow-2xs backdrop-blur-xl",
      ghost: "hover:bg-white/10 text-slate-300 hover:text-white",
      destructive:
        "bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xs font-semibold",
      accent:
        "bg-gradient-to-r from-[#22D3EE] to-[#60A5FA] hover:brightness-110 text-[#061225] shadow-xs font-semibold"
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-9 px-4 text-sm rounded-lg gap-2",
      lg: "h-11 px-5 text-base rounded-xl gap-2.5",
      icon: "h-9 w-9 rounded-lg"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

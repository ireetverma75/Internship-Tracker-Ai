import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "quiet";
}

export const GlassButton = ({ children, className, tone = "quiet", ...props }: GlassButtonProps) => (
  <button className={cn("glass-button", `glass-button--${tone}`, className)} {...props}>
    {children}
  </button>
);
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export const GlassCard = ({ children, className, interactive = false, ...props }: GlassCardProps) => (
  <div className={cn("glass-panel", interactive && "glass-panel--interactive", className)} {...props}>
    {children}
  </div>
);
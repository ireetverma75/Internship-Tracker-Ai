import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const GlassDropdown = ({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn("glass-input glass-dropdown", className)} {...props}>
    {children}
  </select>
);
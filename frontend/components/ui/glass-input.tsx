import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const GlassInput = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn("glass-input", className)} {...props} />
);
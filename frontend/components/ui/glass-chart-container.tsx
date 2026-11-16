import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassChartContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
}

export const GlassChartContainer = ({ children, className, title, ...props }: GlassChartContainerProps) => (
  <section className={cn("glass-panel glass-chart-container", className)} {...props}>
    {title && <h2 className="glass-chart-container__title">{title}</h2>}
    {children}
  </section>
);
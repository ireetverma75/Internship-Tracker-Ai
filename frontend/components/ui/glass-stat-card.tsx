import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface GlassStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  delay?: number;
}

export const GlassStatCard = ({ label, value, icon: Icon, hint, delay = 0 }: GlassStatCardProps) => (
  <motion.article
    className="glass-panel glass-stat-card"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    <span className="glass-stat-card__icon"><Icon aria-hidden="true" /></span>
    <span className="glass-stat-card__label">{label}</span>
    <strong className="glass-stat-card__value tabular-nums">{value}</strong>
    {hint && <span className="glass-stat-card__hint">{hint}</span>}
  </motion.article>
);
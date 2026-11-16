import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface GlassModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export const GlassModal = ({ open, title, onClose, children }: GlassModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="glass-modal-backdrop"
        role="presentation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.section
          className="glass-panel glass-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
        >
          <header className="glass-modal__header">
            <h2>{title}</h2>
            <button type="button" className="glass-icon-button" onClick={onClose} aria-label="Close dialog">
              <X aria-hidden="true" />
            </button>
          </header>
          {children}
        </motion.section>
      </motion.div>
    )}
  </AnimatePresence>
);
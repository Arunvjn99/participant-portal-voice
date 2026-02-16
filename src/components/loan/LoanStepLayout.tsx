import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface LoanStepLayoutProps {
  children: ReactNode;
  /** Optional sidebar (e.g. summary) - shown on desktop */
  sidebar?: ReactNode;
  /** Main content area */
  className?: string;
}

/**
 * Two-column layout on desktop, single column on mobile.
 * Sticky summary sidebar on desktop. 8px spacing system, rounded-xl cards.
 */
export function LoanStepLayout({ children, sidebar, className = "" }: LoanStepLayoutProps) {
  const reduced = useReducedMotion();

  return (
    <div className={`grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:gap-8 ${className}`}>
      <motion.main
        className="min-w-0"
        initial={reduced ? false : { opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.main>
      {sidebar && (
        <aside className="lg:sticky lg:top-8 lg:self-start">
          {sidebar}
        </aside>
      )}
    </div>
  );
}

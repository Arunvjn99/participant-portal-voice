import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface LoanReviewSectionProps {
  title: string;
  children: ReactNode;
  onEdit?: () => void;
  /** Step index to navigate back to */
  editStepIndex?: number;
  className?: string;
}

/**
 * Review screen section with Edit button that navigates back to step.
 */
export function LoanReviewSection({
  title,
  children,
  onEdit,
  className = "",
}: LoanReviewSectionProps) {
  const reduced = useReducedMotion();

  return (
    <motion.section
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-labelledby={`review-section-${title.replace(/\s/g, "-")}`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 id={`review-section-${title.replace(/\s/g, "-")}`} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            aria-label={`Edit ${title}`}
          >
            Edit
          </button>
        )}
      </div>
      <div className="text-sm text-slate-700 dark:text-slate-300">{children}</div>
    </motion.section>
  );
}

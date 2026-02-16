import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

export interface LoanSummaryRow {
  label: string;
  value: string;
}

interface LoanSummaryCardProps {
  title?: string;
  rows: LoanSummaryRow[];
  className?: string;
}

/**
 * Rounded-xl card, shadow-sm, soft gray background. Summary key-value list.
 */
export function LoanSummaryCard({ title = "Summary", rows, className = "" }: LoanSummaryCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      className={`rounded-xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 ${className}`}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <dl className="space-y-3">
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="flex justify-between gap-4 text-sm"
          >
            <dt className="text-slate-600 dark:text-slate-400">{row.label}</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{row.value}</dd>
          </motion.div>
        ))}
      </dl>
    </motion.article>
  );
}

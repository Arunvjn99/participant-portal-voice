import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface LoanIneligibleStateProps {
  reasons: string[];
  onBack?: () => void;
}

/**
 * Rendered when eligibility pre-check fails. No step 1.
 */
export function LoanIneligibleState({ reasons, onBack }: LoanIneligibleStateProps) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/transactions");
  };

  return (
    <motion.div
      className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      role="alert"
      aria-live="polite"
    >
      <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
        You're not eligible for a loan at this time
      </h2>
      <p className="mb-4 text-slate-600 dark:text-slate-400">
        Based on your account and plan rules, we couldn't approve a loan request. Reasons:
      </p>
      <ul className="mb-6 list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
        {reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleBack}
        className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
        aria-label="Back to transactions"
      >
        Back to Transactions
      </button>
    </motion.div>
  );
}

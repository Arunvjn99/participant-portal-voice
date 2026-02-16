import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

export const LOAN_STEP_LABELS = [
  "Loan basics",
  "Payment setup",
  "Investment breakdown",
  "Documents & compliance",
  "Review",
  "Confirmation",
] as const;

interface LoanProgressStepperProps {
  currentStep: number;
  totalSteps?: number;
  stepLabels?: readonly string[];
}

/**
 * Stepper for loan flow. Accessible, keyboard navigable.
 */
export function LoanProgressStepper({
  currentStep,
  totalSteps = 6,
  stepLabels = LOAN_STEP_LABELS,
}: LoanProgressStepperProps) {
  const reduced = useReducedMotion();
  const labels = stepLabels.slice(0, totalSteps);
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="space-y-4" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps} aria-label="Loan application progress">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <motion.div
            className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
            initial={reduced ? false : { width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {labels.map((label, index) => {
          const status = index < currentStep ? "completed" : index === currentStep ? "active" : "upcoming";
          return (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                status === "active"
                  ? "bg-blue-100 font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                  : status === "completed"
                    ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-500"
              }`}
            >
              <span aria-hidden="true">
                {status === "completed" ? "✓" : index + 1}
              </span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

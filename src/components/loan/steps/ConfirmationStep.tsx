import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { LoanFlowData, LoanPlanConfig } from "../../../types/loan";
import { calculateLoan } from "../../../utils/loanCalculator";
import { DEFAULT_LOAN_PLAN_CONFIG } from "../../../config/loanPlanConfig";

interface ConfirmationStepProps {
  data: LoanFlowData;
  planConfig: LoanPlanConfig;
  onDownloadPDF?: () => void;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export function ConfirmationStep({ data, planConfig, onDownloadPDF }: ConfirmationStepProps) {
  const reduced = useReducedMotion();
  const config = planConfig ?? DEFAULT_LOAN_PLAN_CONFIG;
  const basics = data.basics!;
  const calc = calculateLoan({
    loanAmount: basics.loanAmount,
    annualInterestRate: config.defaultAnnualRate,
    tenureYears: basics.tenureYears,
    payrollFrequency: basics.payrollFrequency,
    originationFee: config.originationFeePct,
  });

  return (
    <motion.div
      className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      initial={reduced ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40"
        initial={reduced ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        aria-hidden
      >
        <motion.svg
          className="h-8 w-8 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>

      <h2 className="mb-2 text-center text-xl font-semibold text-slate-900 dark:text-slate-100">
        Loan request submitted
      </h2>
      <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
        You will receive a confirmation email with next steps.
      </p>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">Loan amount</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(basics.loanAmount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">Net disbursement</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(calc.netDisbursement)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">First payment date</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">{basics.firstPaymentDate}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">Payment frequency</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">{basics.payrollFrequency}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">Term</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">{basics.tenureYears} years</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">Payoff date</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">{calc.payoffDate}</dd>
        </div>
      </dl>

      {onDownloadPDF && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onDownloadPDF}
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            aria-label="Download PDF confirmation"
          >
            Download PDF
          </button>
        </div>
      )}
    </motion.div>
  );
}

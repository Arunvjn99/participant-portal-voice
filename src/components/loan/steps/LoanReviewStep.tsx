import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { LoanFlowData, LoanPlanConfig } from "../../../types/loan";
import { calculateLoan } from "../../../utils/loanCalculator";
import {
  LoanStepLayout,
  LoanSummaryCard,
  LoanReviewSection,
  AmortizationTable,
  InvestmentBreakdownTable,
} from "../index";
import { DEFAULT_LOAN_PLAN_CONFIG } from "../../../config/loanPlanConfig";

interface LoanReviewStepProps {
  data: LoanFlowData;
  onDataChange: (patch: Partial<LoanFlowData>) => void;
  planConfig: LoanPlanConfig;
  onNavigateToStep: (stepIndex: number) => void;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export function LoanReviewStep({
  data,
  planConfig,
  onNavigateToStep,
}: LoanReviewStepProps) {
  const reduced = useReducedMotion();
  const config = planConfig ?? DEFAULT_LOAN_PLAN_CONFIG;
  const basics = data.basics!;
  const payment = data.payment!;
  const investment = data.investment!;
  const documents = data.documents!;

  const calc = useMemo(
    () =>
      basics
        ? calculateLoan({
            loanAmount: basics.loanAmount,
            annualInterestRate: config.defaultAnnualRate,
            tenureYears: basics.tenureYears,
            payrollFrequency: basics.payrollFrequency,
            originationFee: config.originationFeePct,
          })
        : null,
    [basics, config]
  );

  const [amortOpen, setAmortOpen] = useState(false);

  const summaryRows = useMemo(() => {
    if (!calc || !basics) return [];
    return [
      { label: "Loan amount", value: formatCurrency(basics.loanAmount) },
      { label: "Net disbursement", value: formatCurrency(calc.netDisbursement) },
      { label: "First payment", value: basics.firstPaymentDate },
      { label: "Payoff date", value: calc.payoffDate },
    ];
  }, [calc, basics]);

  return (
    <LoanStepLayout sidebar={summaryRows.length > 0 ? <LoanSummaryCard title="Summary" rows={summaryRows} /> : undefined}>
      <div className="space-y-6">
        <LoanReviewSection title="Loan details" onEdit={() => onNavigateToStep(0)}>
          <ul className="list-inside space-y-1">
            <li>Amount: {formatCurrency(basics.loanAmount)}</li>
            <li>Term: {basics.tenureYears} years</li>
            <li>First payment date: {basics.firstPaymentDate}</li>
            <li>Payment frequency: {basics.payrollFrequency}</li>
            {basics.loanPurpose && <li>Purpose: {basics.loanPurpose}</li>}
          </ul>
        </LoanReviewSection>

        <LoanReviewSection title="Payment setup" onEdit={() => onNavigateToStep(1)}>
          <p>ACH • •••• {payment.accountNumber.slice(-4)}</p>
        </LoanReviewSection>

        {calc && (
          <LoanReviewSection title="Fees">
            <p>Origination fee (1%): {formatCurrency(basics.loanAmount * config.originationFeePct)}</p>
          </LoanReviewSection>
        )}

        {calc && (
          <motion.section
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={() => setAmortOpen(!amortOpen)}
              className="flex w-full items-center justify-between text-left text-lg font-semibold text-slate-900 dark:text-slate-100"
              aria-expanded={amortOpen}
            >
              Amortization schedule
              <span aria-hidden>{amortOpen ? "▼" : "▶"}</span>
            </button>
            {amortOpen && calc.amortizationSchedule.length > 0 && (
              <div className="mt-4">
                <AmortizationTable rows={calc.amortizationSchedule} initialVisible={12} />
              </div>
            )}
          </motion.section>
        )}

        <LoanReviewSection title="Investment breakdown" onEdit={() => onNavigateToStep(2)}>
          <InvestmentBreakdownTable
            allocations={investment.allocations}
            totalAmount={investment.totalAllocated}
          />
        </LoanReviewSection>

        <LoanReviewSection title="Documents" onEdit={() => onNavigateToStep(3)}>
          <ul className="list-inside space-y-1">
            {documents.documents.map((d) => (
              <li key={d.id}>{d.name}</li>
            ))}
          </ul>
        </LoanReviewSection>

        <LoanReviewSection title="Compliance acknowledgments">
          <p>Terms and disclosure acknowledged.</p>
        </LoanReviewSection>
      </div>
    </LoanStepLayout>
  );
}

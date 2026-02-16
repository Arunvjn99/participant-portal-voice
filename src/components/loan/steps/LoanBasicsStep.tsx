import { useMemo } from "react";
import type { LoanFlowData, LoanPlanConfig, LoanUserContext, LoanPurposeReason, PayrollFrequency } from "../../../types/loan";
import { calculateLoan } from "../../../utils/loanCalculator";
import { LoanStepLayout, LoanSummaryCard, LoanAmountSlider } from "../index";
import { DEFAULT_LOAN_PLAN_CONFIG } from "../../../config/loanPlanConfig";

interface LoanBasicsStepProps {
  data: LoanFlowData;
  onDataChange: (patch: Partial<LoanFlowData>) => void;
  planConfig: LoanPlanConfig;
  userContext: LoanUserContext;
}

const PAYROLL_OPTIONS: { value: PayrollFrequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "semimonthly", label: "Semimonthly" },
];

const PURPOSE_OPTIONS: LoanPurposeReason[] = ["General", "Residential", "Hardship", "Other"];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function LoanBasicsStep({ data, onDataChange, planConfig, userContext }: LoanBasicsStepProps) {
  const config = planConfig ?? DEFAULT_LOAN_PLAN_CONFIG;
  const maxLoan = useMemo(
    () => Math.min(userContext.vestedBalance * config.maxLoanPctOfVested, config.maxLoanAbsolute),
    [userContext.vestedBalance, config]
  );
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  const defaultFirstPayment = nextMonth.toISOString().split("T")[0];

  const basics = data.basics ?? {
    loanAmount: config.minLoanAmount,
    tenureYears: config.termYearsMax,
    firstPaymentDate: defaultFirstPayment,
    payrollFrequency: "monthly" as PayrollFrequency,
  };

  const calc = useMemo(
    () =>
      basics.loanAmount > 0 && basics.tenureYears >= config.termYearsMin
        ? calculateLoan({
            loanAmount: basics.loanAmount,
            annualInterestRate: config.defaultAnnualRate,
            tenureYears: basics.tenureYears,
            payrollFrequency: basics.payrollFrequency,
            originationFee: config.originationFeePct,
          })
        : null,
    [basics.loanAmount, basics.tenureYears, basics.payrollFrequency, config]
  );

  const summaryRows = useMemo(() => {
    if (!calc) return [];
    return [
      { label: "Loan amount", value: formatCurrency(basics.loanAmount) },
      { label: "Payment per period", value: formatCurrency(calc.paymentPerPeriod) },
      { label: "Total repayment", value: formatCurrency(calc.totalRepayment) },
      { label: "Net disbursement", value: formatCurrency(calc.netDisbursement) },
    ];
  }, [calc, basics.loanAmount]);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <LoanStepLayout
      sidebar={
        summaryRows.length > 0 ? (
          <LoanSummaryCard title="Summary" rows={summaryRows} />
        ) : undefined
      }
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Loan amount</h2>
          <LoanAmountSlider
            value={basics.loanAmount}
            min={config.minLoanAmount}
            max={Math.floor(maxLoan)}
            step={500}
            onChange={(v) =>
              onDataChange({
                basics: { ...basics, loanAmount: v },
              })
            }
            label="Loan amount"
            formatValue={formatCurrency}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Repayment term</h2>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => onDataChange({ basics: { ...basics, tenureYears: y } })}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  basics.tenureYears === y
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
                aria-pressed={basics.tenureYears === y}
                aria-label={`${y} year${y === 1 ? "" : "s"}`}
              >
                {y} {y === 1 ? "year" : "years"}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <label htmlFor="loan-first-payment" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            First payment date
          </label>
          <input
            id="loan-first-payment"
            type="date"
            value={basics.firstPaymentDate}
            min={minDateStr}
            onChange={(e) => onDataChange({ basics: { ...basics, firstPaymentDate: e.target.value } })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            aria-label="First payment date"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Payment frequency</h2>
          <div className="flex flex-wrap gap-2">
            {PAYROLL_OPTIONS.filter((o) => config.allowedPayrollFrequencies.includes(o.value)).map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => onDataChange({ basics: { ...basics, payrollFrequency: o.value } })}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  basics.payrollFrequency === o.value
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
                aria-pressed={basics.payrollFrequency === o.value}
                aria-label={o.label}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Loan purpose (optional)</h2>
          <div className="flex flex-wrap gap-2">
            {PURPOSE_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onDataChange({ basics: { ...basics, loanPurpose: p } })}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  basics.loanPurpose === p
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
                aria-pressed={basics.loanPurpose === p}
                aria-label={p}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </LoanStepLayout>
  );
}

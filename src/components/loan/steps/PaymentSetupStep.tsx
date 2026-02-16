import type { LoanFlowData, LoanPlanConfig } from "../../../types/loan";
import { LoanStepLayout, LoanSummaryCard, BankDetailsForm } from "../index";
import { DEFAULT_LOAN_PLAN_CONFIG } from "../../../config/loanPlanConfig";

interface PaymentSetupStepProps {
  data: LoanFlowData;
  onDataChange: (patch: Partial<LoanFlowData>) => void;
  planConfig: LoanPlanConfig;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

export function PaymentSetupStep({ data, onDataChange, planConfig }: PaymentSetupStepProps) {
  const config = planConfig ?? DEFAULT_LOAN_PLAN_CONFIG;
  const basics = data.basics;
  const payment = data.payment ?? {
    paymentMethod: "ach" as const,
    routingNumber: "",
    accountNumber: "",
    accountType: "checking" as const,
  };

  const summaryRows = basics
    ? [
        { label: "Loan amount", value: formatCurrency(basics.loanAmount) },
        { label: "Payment frequency", value: basics.payrollFrequency },
      ]
    : [];

  const handleChange = (patch: Partial<typeof payment>) => {
    onDataChange({ payment: { ...payment, ...patch } });
  };

  return (
    <LoanStepLayout sidebar={summaryRows.length > 0 ? <LoanSummaryCard title="Loan summary" rows={summaryRows} /> : undefined}>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Payment setup (ACH)</h2>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Loan payments will be deducted from your bank account via ACH.
        </p>
        <BankDetailsForm value={payment} onChange={handleChange} />
      </div>
    </LoanStepLayout>
  );
}

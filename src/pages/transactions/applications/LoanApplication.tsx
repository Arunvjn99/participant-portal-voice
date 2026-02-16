import { TransactionApplication } from "../../../components/transactions/TransactionApplication";
import type { TransactionStepDefinition } from "../../../components/transactions/TransactionApplication";
import { EligibilityStep } from "./loan/steps/EligibilityStep";
import { LoanAmountStep } from "./loan/steps/LoanAmountStep";
import { RepaymentTermsStep } from "./loan/steps/RepaymentTermsStep";
import { ReviewStep } from "./loan/steps/ReviewStep";
import type { Transaction } from "../../../types/transactions";

/**
 * Loan-specific step definitions
 */
const loanSteps: TransactionStepDefinition[] = [
  {
    stepId: "eligibility",
    label: "Eligibility",
    component: EligibilityStep,
  },
  {
    stepId: "loan-amount",
    label: "Loan Amount",
    component: LoanAmountStep,
  },
  {
    stepId: "repayment-terms",
    label: "Repayment Terms",
    component: RepaymentTermsStep,
  },
  {
    stepId: "review-submit",
    label: "Review & Submit",
    component: ReviewStep,
  },
];

/**
 * Loan Application using the generic TransactionApplication architecture
 */
export const LoanApplication = () => {
  const handleSubmit = async (_transaction: Transaction, _data: Record<string, unknown>) => {
    // TODO: Implement actual submission logic (API call)
  };

  return (
    <TransactionApplication
      transactionType="loan"
      steps={loanSteps}
      onSubmit={handleSubmit}
    />
  );
};

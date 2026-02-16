/**
 * Loan flow types for 401(k) participant loan application
 * Production-grade fintech: fully typed, no any
 */

export type PayrollFrequency = "monthly" | "biweekly" | "semimonthly";

export type LoanPurposeReason = "General" | "Residential" | "Hardship" | "Other";

/** Plan-level loan configuration (config-driven, not hardcoded) */
export interface LoanPlanConfig {
  maxLoanAbsolute: number;
  maxLoanPctOfVested: number;
  minLoanAmount: number;
  termYearsMin: number;
  termYearsMax: number;
  defaultAnnualRate: number;
  originationFeePct: number;
  allowedPayrollFrequencies: PayrollFrequency[];
  requiresSpousalConsent: boolean;
}

/** User context for eligibility */
export interface LoanUserContext {
  vestedBalance: number;
  outstandingLoanBalance: number;
  isEnrolled: boolean;
  married?: boolean;
}

/** Account/plan context for eligibility */
export interface LoanAccountContext {
  planId: string;
  planName: string;
  config: LoanPlanConfig;
}

/** Eligibility result from pre-check */
export interface LoanEligibilityResult {
  eligible: boolean;
  reasons: string[];
  maxLoanAmount: number;
  minLoanAmount: number;
}

/** Loan basics (step 1) */
export interface LoanBasicsData {
  loanAmount: number;
  tenureYears: number;
  firstPaymentDate: string;
  payrollFrequency: PayrollFrequency;
  loanPurpose?: LoanPurposeReason;
}

/** Payment setup (step 2) - ACH */
export interface PaymentSetupData {
  paymentMethod: "ach";
  routingNumber: string;
  accountNumber: string;
  accountType: "checking" | "savings";
}

/** Single fund allocation for loan source */
export interface LoanFundAllocation {
  fundId: string;
  fundName: string;
  amount: number;
  percentage: number;
}

/** Investment breakdown (step 3) */
export interface InvestmentBreakdownData {
  allocationMode: "proRata" | "custom";
  allocations: LoanFundAllocation[];
  totalAllocated: number;
}

/** Document upload metadata (no file content stored) */
export interface LoanDocumentMeta {
  id: string;
  type: string;
  name: string;
  size: number;
  uploadedAt: string;
}

/** Documents & compliance (step 4) */
export interface DocumentsComplianceData {
  documents: LoanDocumentMeta[];
  acknowledgments: Record<string, boolean>;
}

/** Aggregated loan application state */
export interface LoanFlowData {
  basics: LoanBasicsData | null;
  payment: PaymentSetupData | null;
  investment: InvestmentBreakdownData | null;
  documents: DocumentsComplianceData | null;
}

/** Step index for LoanFlow */
export type LoanStepIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const LOAN_STEP_IDS = [
  "basics",
  "payment",
  "investment",
  "documents",
  "review",
  "confirmation",
] as const;

export type LoanStepId = (typeof LOAN_STEP_IDS)[number];

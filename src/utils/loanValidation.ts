/**
 * Per-step validation for loan flow.
 * Prevent navigation to next step if invalid.
 */

import type {
  LoanBasicsData,
  LoanPlanConfig,
  PaymentSetupData,
  InvestmentBreakdownData,
  LoanFlowData,
  DocumentsComplianceData,
} from "../types/loan";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** US routing number: 9 digits */
const ROUTING_REGEX = /^\d{9}$/;
/** Account number: typically 4–17 digits */
const ACCOUNT_REGEX = /^\d{4,17}$/;

export function validateLoanBasics(
  data: LoanBasicsData | null,
  config: LoanPlanConfig
): ValidationResult {
  const errors: string[] = [];
  if (!data) {
    return { valid: false, errors: ["Loan basics are required."] };
  }

  if (data.loanAmount < config.minLoanAmount || data.loanAmount > config.maxLoanAbsolute) {
    errors.push(
      `Loan amount must be between $${config.minLoanAmount.toLocaleString()} and $${config.maxLoanAbsolute.toLocaleString()}.`
    );
  }

  if (
    data.tenureYears < config.termYearsMin ||
    data.tenureYears > config.termYearsMax
  ) {
    errors.push(
      `Term must be between ${config.termYearsMin} and ${config.termYearsMax} years.`
    );
  }

  const firstPayment = data.firstPaymentDate ? new Date(data.firstPaymentDate) : null;
  if (!firstPayment || isNaN(firstPayment.getTime())) {
    errors.push("A valid first payment date is required.");
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (firstPayment < today) {
      errors.push("First payment date must be today or in the future.");
    }
  }

  if (!config.allowedPayrollFrequencies.includes(data.payrollFrequency)) {
    errors.push("Selected payment frequency is not allowed by your plan.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validatePaymentSetup(data: PaymentSetupData | null): ValidationResult {
  const errors: string[] = [];
  if (!data) {
    return { valid: false, errors: ["Payment setup is required."] };
  }

  if (data.paymentMethod !== "ach") {
    errors.push("Payment method must be ACH.");
  }

  const routing = (data.routingNumber || "").replace(/\s/g, "");
  if (!ROUTING_REGEX.test(routing)) {
    errors.push("Routing number must be 9 digits.");
  }

  const account = (data.accountNumber || "").replace(/\s/g, "");
  if (!ACCOUNT_REGEX.test(account)) {
    errors.push("Account number must be 4–17 digits.");
  }

  if (!data.accountType || !["checking", "savings"].includes(data.accountType)) {
    errors.push("Please select account type (checking or savings).");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateInvestmentBreakdown(
  data: InvestmentBreakdownData | null,
  loanAmount: number
): ValidationResult {
  const errors: string[] = [];
  if (!data) {
    return { valid: false, errors: ["Investment breakdown is required."] };
  }

  const total = round2(data.totalAllocated ?? 0);
  const target = round2(loanAmount);
  if (Math.abs(total - target) > 0.01) {
    errors.push(`Total allocation ($${total.toLocaleString()}) must equal loan amount ($${target.toLocaleString()}).`);
  }

  const hasNegative = data.allocations.some((a) => a.amount < 0);
  if (hasNegative) {
    errors.push("Allocations cannot be negative.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateDocuments(
  data: DocumentsComplianceData | null,
  options: {
    loanPurpose?: string;
    reason?: string;
    requiresSpousalConsent?: boolean;
    userMarried?: boolean;
  }
): ValidationResult {
  const errors: string[] = [];
  if (!data) {
    return { valid: false, errors: ["Documents and compliance are required."] };
  }

  const requiredTypes: string[] = ["LoanAgreement"];
  if (options.loanPurpose === "Residential") {
    requiredTypes.push("PurchaseAgreement");
  }
  if (options.reason === "Hardship") {
    requiredTypes.push("HardshipDocument");
  }
  if (options.requiresSpousalConsent && options.userMarried) {
    requiredTypes.push("SpousalConsent");
  }

  const uploadedTypes = data.documents.map((d) => d.type);
  for (const type of requiredTypes) {
    if (!uploadedTypes.includes(type)) {
      errors.push(`Required document not uploaded: ${type}.`);
    }
  }

  const acks = data.acknowledgments;
  if (!acks.terms) {
    errors.push("You must accept the loan terms and conditions.");
  }
  if (!acks.disclosure) {
    errors.push("You must acknowledge the disclosure.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateLoanReview(data: LoanFlowData): ValidationResult {
  const errors: string[] = [];
  if (!data.basics) errors.push("Loan basics are missing.");
  if (!data.payment) errors.push("Payment setup is missing.");
  if (!data.investment) errors.push("Investment breakdown is missing.");
  if (!data.documents) errors.push("Documents and compliance are missing.");
  return {
    valid: errors.length === 0,
    errors,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

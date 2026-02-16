import type { LoanPlanConfig } from "../types/loan";

/**
 * Default plan-driven loan config (IRS + plan limits).
 * In production, load from plan API.
 */
export const DEFAULT_LOAN_PLAN_CONFIG: LoanPlanConfig = {
  maxLoanAbsolute: 50_000,
  maxLoanPctOfVested: 0.5,
  minLoanAmount: 1_000,
  termYearsMin: 1,
  termYearsMax: 5,
  defaultAnnualRate: 0.085,
  originationFeePct: 0.01,
  allowedPayrollFrequencies: ["monthly", "biweekly", "semimonthly"],
  requiresSpousalConsent: true,
};

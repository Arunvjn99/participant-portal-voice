/**
 * Loan eligibility pre-check before rendering step 1
 * Returns eligible flag, reasons, and plan-driven min/max amounts.
 */

import type {
  LoanEligibilityResult,
  LoanUserContext,
  LoanAccountContext,
} from "../types/loan";

export function checkLoanEligibility(
  user: LoanUserContext,
  plan: LoanAccountContext
): LoanEligibilityResult {
  const reasons: string[] = [];
  const { config } = plan;

  if (!user.isEnrolled) {
    reasons.push("You must be enrolled in the 401(k) plan to request a loan.");
  }

  if (user.vestedBalance <= 0) {
    reasons.push("You need a vested balance to request a loan.");
  }

  const maxFromVested = user.vestedBalance * config.maxLoanPctOfVested;
  const maxLoanAmount = Math.min(maxFromVested, config.maxLoanAbsolute);
  const minLoanAmount = config.minLoanAmount;

  if (maxLoanAmount < minLoanAmount) {
    reasons.push(
      `Your vested balance is too low to meet the minimum loan amount ($${minLoanAmount.toLocaleString()}).`
    );
  }

  const eligible =
    reasons.length === 0 &&
    user.isEnrolled &&
    user.vestedBalance > 0 &&
    maxLoanAmount >= minLoanAmount;

  return {
    eligible,
    reasons,
    maxLoanAmount: round2(maxLoanAmount),
    minLoanAmount,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Loan calculator engine for 401(k) participant loans
 * Handles payroll frequency, origination fee, amortization, payoff date, net disbursement.
 * No floating-point precision issues: round to cents at each step.
 */

import type { PayrollFrequency } from "../types/loan";

/** Payments per year by payroll frequency */
export const PAYMENTS_PER_YEAR: Record<PayrollFrequency, number> = {
  monthly: 12,
  biweekly: 26,
  semimonthly: 24,
};

export interface CalculateLoanInput {
  loanAmount: number;
  annualInterestRate: number;
  tenureYears: number;
  payrollFrequency: PayrollFrequency;
  originationFee: number; // decimal e.g. 0.01 = 1%
}

export interface AmortizationRow {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface CalculateLoanResult {
  paymentPerPeriod: number;
  totalRepayment: number;
  totalInterest: number;
  amortizationSchedule: AmortizationRow[];
  payoffDate: string;
  netDisbursement: number;
  numberOfPayments: number;
}

/** Round to 2 decimal places (cents) to avoid float issues */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate loan: payment per period, total repayment, interest, schedule, payoff date, net disbursement.
 */
export function calculateLoan(input: CalculateLoanInput): CalculateLoanResult {
  const {
    loanAmount,
    annualInterestRate,
    tenureYears,
    payrollFrequency,
    originationFee,
  } = input;

  const paymentsPerYear = PAYMENTS_PER_YEAR[payrollFrequency];
  const numberOfPayments = tenureYears * paymentsPerYear;
  const ratePerPeriod = annualInterestRate / paymentsPerYear;

  if (loanAmount <= 0) {
    return {
      paymentPerPeriod: 0,
      totalRepayment: 0,
      totalInterest: 0,
      amortizationSchedule: [],
      payoffDate: formatPayoffDate(new Date(), 0),
      netDisbursement: 0,
      numberOfPayments: 0,
    };
  }

  let paymentPerPeriod: number;
  if (ratePerPeriod === 0) {
    paymentPerPeriod = round2(loanAmount / numberOfPayments);
  } else {
    const factor = Math.pow(1 + ratePerPeriod, numberOfPayments);
    paymentPerPeriod = round2((loanAmount * ratePerPeriod * factor) / (factor - 1));
  }

  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;
  const startDate = new Date();

  for (let i = 1; i <= numberOfPayments; i++) {
    const interest = round2(balance * ratePerPeriod);
    const principal = round2(Math.min(paymentPerPeriod - interest, balance));
    balance = round2(Math.max(0, balance - principal));

    schedule.push({
      paymentNumber: i,
      payment: paymentPerPeriod,
      principal,
      interest,
      balance,
    });
  }

  const totalRepayment = round2(paymentPerPeriod * numberOfPayments);
  const totalInterest = round2(totalRepayment - loanAmount);
  const feeAmount = round2(loanAmount * originationFee);
  const netDisbursement = round2(loanAmount - feeAmount);

  const lastPaymentIndex = schedule.length - 1;
  const monthsToPayoff = Math.ceil((lastPaymentIndex + 1) / (paymentsPerYear / 12));
  const payoffDate = formatPayoffDate(startDate, monthsToPayoff);

  return {
    paymentPerPeriod,
    totalRepayment,
    totalInterest,
    amortizationSchedule: schedule,
    payoffDate,
    netDisbursement,
    numberOfPayments,
  };
}

function formatPayoffDate(start: Date, monthsToAdd: number): string {
  const d = new Date(start);
  d.setMonth(d.getMonth() + monthsToAdd);
  return d.toISOString().split("T")[0];
}

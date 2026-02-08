/**
 * Single source of truth for Post-Enrollment Dashboard
 * All widgets read from this object. Do NOT recompute values inside components.
 */

import { SHARED_LEARNING_RESOURCES } from "../assets/learning";

export interface PlanDetails {
  planId: string;
  planName: string;
  planType: string;
  enrolledAt: string;
  totalBalance: number;
  ytdReturn: number;
  employerMatchPct: number;
  planFitPct?: number;
  contributionRate: number;
}

export interface ContributionRates {
  preTax: number;
  roth: number;
  afterTax: number;
  total: number;
}

export interface InvestmentAllocation {
  fundId: string;
  fundName: string;
  ticker: string;
  balance: number;
  allocationPct: number;
  returnPct: number;
}

export interface GoalProgress {
  percentOnTrack: number;
  retirementAge: number;
  monthlyContribution: number;
  projectedBalance: number;
  currentAge: number;
  salary?: number;
}

export interface Transaction {
  id: string;
  type: "contribution" | "employer-match" | "fee" | "dividend" | "loan-repayment";
  description: string;
  date: string;
  amount: number;
  account?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  badge: string;
  /** Thumbnail path from pre-enrollment assets */
  imageSrc: string;
  subtitle?: string;
}

export interface Balances {
  rolloverEligible: number;
  availableCash: number;
  restricted: number;
}

export interface EnrollmentSummary {
  planDetails: PlanDetails | null;
  balances: Balances | null;
  contributionRates: ContributionRates | null;
  investmentAllocations: InvestmentAllocation[];
  goalProgress: GoalProgress | null;
  topBanner: {
    percentOnTrack: number;
    subText: string;
    actionRoute: string;
  } | null;
  transactions: Transaction[];
  rateOfReturn: {
    confidencePct: number;
    message: string;
    timeRange: "5Y" | "1Y" | "3M";
  } | null;
  onboardingProgress: {
    percentComplete: number;
    badgesCompleted: number;
    badgesTotal: number;
    message: string;
  } | null;
  learningResources: LearningResource[];
  isWithdrawalRestricted: boolean;
  allocationDescription: string | null;
}

export const MOCK_ENROLLMENT_SUMMARY: EnrollmentSummary = {
  planDetails: {
    planId: "plan-1",
    planName: "TechVantage 401(k) Retirement Plan",
    planType: "401(k)",
    enrolledAt: "2035-05-15",
    totalBalance: 234992,
    ytdReturn: 12.4,
    employerMatchPct: 92,
    planFitPct: 90,
    contributionRate: 12,
  },
  balances: {
    rolloverEligible: 207992,
    availableCash: -187192.8,
    restricted: 27000,
  },
  contributionRates: {
    preTax: 100,
    roth: 0,
    afterTax: 0,
    total: 12,
  },
  investmentAllocations: [
    { fundId: "fund-1", fundName: "Vanguard 500 Index Fund", ticker: "VINIX", balance: 98500, allocationPct: 42, returnPct: 14.2 },
    { fundId: "fund-2", fundName: "Fidelity Total Market Index", ticker: "FSMKX", balance: 62000, allocationPct: 26, returnPct: 13.8 },
    { fundId: "fund-5", fundName: "International Growth Fund", ticker: "RERGX", balance: 38000, allocationPct: 16, returnPct: -2.1 },
    { fundId: "fund-7", fundName: "Bond Market Index Fund", ticker: "VBTLX", balance: 36492, allocationPct: 16, returnPct: 3.2 },
  ],
  goalProgress: {
    percentOnTrack: 90,
    retirementAge: 65,
    monthlyContribution: 1200,
    projectedBalance: 2256000,
    currentAge: 31,
    salary: 85000,
  },
  topBanner: {
    percentOnTrack: 72,
    subText: "Increase your contribution by 2% to reach 100% confidence.",
    actionRoute: "/enrollment/contribution",
  },
  transactions: [
    { id: "t1", type: "loan-repayment", description: "Loan Repayment", date: "2025-01-15", amount: -500, account: "Traditional 401K" },
    { id: "t2", type: "dividend", description: "Dividend Credit", date: "2025-01-10", amount: 127.5, account: "Traditional 401K" },
    { id: "t3", type: "employer-match", description: "Employer Match", date: "2025-01-10", amount: 450, account: "Traditional 401K" },
    { id: "t4", type: "fee", description: "Fee", date: "2025-01-08", amount: -15, account: "Account Management" },
    { id: "t5", type: "contribution", description: "Contribution", date: "2025-01-05", amount: 900, account: "Traditional 401K" },
  ],
  rateOfReturn: {
    confidencePct: 85,
    message: "Your portfolio is performing well.",
    timeRange: "5Y",
  },
  onboardingProgress: {
    percentComplete: 85,
    badgesCompleted: 3,
    badgesTotal: 5,
    message: "Complete profile to start earning achievement badges and unlock resources.",
  },
  learningResources: SHARED_LEARNING_RESOURCES.map((r) => ({
    id: r.id,
    title: r.title,
    badge: r.badge,
    imageSrc: r.imageSrc,
    subtitle: r.subtitle,
  })),
  isWithdrawalRestricted: true,
  allocationDescription: "Based on your age (31) and risk profile, this growth-focused mix aims to maximize returns while managing volatility.",
};

/**
 * Investment type definitions
 */

export type InvestmentStrategy = "planDefault" | "manual" | "advisor";

export interface Fund {
  id: string;
  name: string;
  ticker: string;
  assetClass: AssetClass;
  expenseRatio: number; // e.g., 0.05 = 0.05%
  riskLevel: RiskLevel;
  expectedReturn: number; // e.g., 7.5 = 7.5% annual return
  description?: string;
}

export type AssetClass =
  | "US Large Cap"
  | "US Mid Cap"
  | "US Small Cap"
  | "International"
  | "Bonds"
  | "Real Estate"
  | "Cash";

export type RiskLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Allocation {
  fundId: string;
  percentage: number; // 0-100
}

/** Canonical fund allocation per source (Investment Elections) */
export interface FundAllocation {
  fundId: string;
  fundName: string;
  assetClass: string;
  expenseRatio: number;
  riskScore: number;
  allocationPercent: number;
}

/** Per-source allocation - only keys with value > 0 appear */
export type InvestmentAllocation = {
  preTax?: { funds: FundAllocation[] };
  roth?: { funds: FundAllocation[] };
  afterTax?: { funds: FundAllocation[] };
};

/** Contribution sources - only keys with value > 0 are active */
export type ContributionSources = {
  preTax?: number;
  roth?: number;
  afterTax?: number;
};

export interface AllocationState {
  allocations: Allocation[];
  isValid: boolean;
  total: number;
  expectedReturn: number;
  totalFees: number;
  riskLevel: number;
}

export interface PlanDefaultPortfolio {
  name: string;
  description: string;
  allocations: Allocation[];
  expectedReturn: number;
  totalFees: number;
  riskLevel: number;
}

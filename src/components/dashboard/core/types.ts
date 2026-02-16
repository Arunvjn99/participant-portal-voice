import type { EnrollmentSummary } from "../../../data/enrollmentSummary";

/* ═══════════════════════════════════════════════════════
   Dashboard Engine Types — Single Source of Truth
   ═══════════════════════════════════════════════════════ */

export type LifeStage = "early-career" | "growth" | "peak-earnings" | "pre-retirement";

export interface RecommendedAction {
  id: string;
  type: "match" | "roth" | "rebalance" | "increase" | "loan-warning";
  title: string;
  description: string;
  impact: string;
  priority: number;
}

export interface DashboardEngine {
  /* Scores (0-100) */
  readinessScore: number;
  confidenceLevel: number;
  optimizationScore: number;
  diversificationScore: number;
  riskAlignment: number;

  /* Status */
  liquidityStatus: "healthy" | "warning" | "critical";

  /* Match */
  missingMatch: number;
  matchGap: number;

  /* Actions */
  recommendedActions: RecommendedAction[];

  /* Life stage */
  lifeStage: LifeStage;
  lifeStageLabel: string;

  /* Derived */
  heroMessage: string;
  yearsToRetirement: number;
  projectedBalance: number;
  currentBalance: number;
  contributionRate: number;
  employerMatch: { pct: number; cap: number };
  ytdReturn: number;
  monthlyContribution: number;
  salary: number;
  currentAge: number;
  retirementAge: number;

  /* Loan */
  loanEligible: boolean;
  maxLoanAmount: number;
}

export interface ModuleProps {
  engine: DashboardEngine;
  data: EnrollmentSummary;
}

export interface DashboardModuleEntry {
  id: string;
  component: React.ComponentType<ModuleProps>;
  condition: (engine: DashboardEngine) => boolean;
  priority: number;
  span: "full" | "primary" | "secondary";
}

/* Shared card style constant */
export const CARD_STYLE: React.CSSProperties = {
  background: "var(--color-bg-surface, var(--enroll-card-bg))",
  border: "1px solid var(--enroll-card-border)",
  borderRadius: "var(--radius-large, var(--enroll-card-radius))",
  boxShadow: "var(--shadow-medium, var(--enroll-elevation-2))",
};

export const CARD_STYLE_SOFT: React.CSSProperties = {
  background: "var(--color-bg-soft, var(--enroll-soft-bg))",
  border: "1px solid var(--enroll-card-border)",
  borderRadius: "var(--radius-large, var(--enroll-card-radius))",
};

export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) && n >= 0 ? n : 0);

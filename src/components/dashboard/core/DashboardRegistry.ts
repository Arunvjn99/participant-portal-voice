import { lazy } from "react";
import type { DashboardModuleEntry } from "./types";

/* ═══════════════════════════════════════════════════════
   Dashboard Module Registry
   Each entry defines a module, its visibility condition,
   rendering priority, and layout span.
   Modules are lazy-loaded for optimal performance.
   ═══════════════════════════════════════════════════════ */

const RetirementHero = lazy(() =>
  import("../modules/hero/RetirementHero").then((m) => ({ default: m.RetirementHero }))
);
const WealthSnapshot = lazy(() =>
  import("../modules/snapshot/WealthSnapshot").then((m) => ({ default: m.WealthSnapshot }))
);
const ContributionOptimizer = lazy(() =>
  import("../modules/contributions/ContributionOptimizer").then((m) => ({ default: m.ContributionOptimizer }))
);
const LoanLiquidityPanel = lazy(() =>
  import("../modules/loans/LoanLiquidityPanel").then((m) => ({ default: m.LoanLiquidityPanel }))
);
const InvestmentHealth = lazy(() =>
  import("../modules/investments/InvestmentHealth").then((m) => ({ default: m.InvestmentHealth }))
);
const AIInsightsPanel = lazy(() =>
  import("../modules/insights/AIInsightsPanel").then((m) => ({ default: m.AIInsightsPanel }))
);
const ActivityFeed = lazy(() =>
  import("../modules/activity/ActivityFeed").then((m) => ({ default: m.ActivityFeed }))
);
const AccountIntegrityPanel = lazy(() =>
  import("../modules/admin/AccountIntegrityPanel").then((m) => ({ default: m.AccountIntegrityPanel }))
);

export const DashboardRegistry: DashboardModuleEntry[] = [
  {
    id: "hero",
    component: RetirementHero,
    condition: () => true,
    priority: 1,
    span: "full",
  },
  {
    id: "snapshot",
    component: WealthSnapshot,
    condition: () => true,
    priority: 2,
    span: "primary",
  },
  {
    id: "contribution",
    component: ContributionOptimizer,
    condition: (engine) => engine.contributionRate < 20,
    priority: 3,
    span: "primary",
  },
  {
    id: "activity",
    component: ActivityFeed,
    condition: () => true,
    priority: 4,
    span: "primary",
  },
  {
    id: "investments",
    component: InvestmentHealth,
    condition: () => true,
    priority: 5,
    span: "secondary",
  },
  {
    id: "insights",
    component: AIInsightsPanel,
    condition: (engine) => engine.recommendedActions.length > 0,
    priority: 6,
    span: "secondary",
  },
  {
    id: "loan",
    component: LoanLiquidityPanel,
    condition: (engine) => engine.loanEligible,
    priority: 7,
    span: "secondary",
  },
  {
    id: "admin",
    component: AccountIntegrityPanel,
    condition: () => true,
    priority: 8,
    span: "secondary",
  },
];

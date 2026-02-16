import { useMemo } from "react";
import type { EnrollmentSummary } from "../../../data/enrollmentSummary";
import type { DashboardEngine, LifeStage, RecommendedAction } from "./types";

/* ═══════════════════════════════════════════════════════
   Personalization Logic Engine
   Computes derived scores, life stage, recommendations,
   and dynamic messaging from raw enrollment data.
   ═══════════════════════════════════════════════════════ */

function deriveLifeStage(age: number): { stage: LifeStage; label: string } {
  if (age < 30) return { stage: "early-career", label: "Early Career" };
  if (age < 45) return { stage: "growth", label: "Growth Phase" };
  if (age < 60) return { stage: "peak-earnings", label: "Peak Earnings" };
  return { stage: "pre-retirement", label: "Pre-Retirement" };
}

function computeRecommendations(
  data: EnrollmentSummary,
  matchGap: number,
  missingMatch: number,
  lifeStage: LifeStage,
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  if (matchGap > 0) {
    actions.push({
      id: "match-gap",
      type: "match",
      title: `You're missing ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(missingMatch)}/year in employer match`,
      description: `Increase your contribution by ${matchGap}% to capture the full employer match.`,
      impact: `+${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(missingMatch)}/year free`,
      priority: 1,
    });
  }

  if ((data.contributionRates?.roth ?? 0) === 0 && lifeStage !== "pre-retirement") {
    actions.push({
      id: "roth-diversify",
      type: "roth",
      title: "Switching to Roth increases tax diversification",
      description: "Adding a Roth component provides tax-free growth and withdrawal flexibility in retirement.",
      impact: "Tax diversification",
      priority: 2,
    });
  }

  const allocations = data.investmentAllocations;
  if (allocations.length > 0) {
    const maxAlloc = Math.max(...allocations.map((a) => a.allocationPct));
    if (maxAlloc > 60) {
      actions.push({
        id: "rebalance",
        type: "rebalance",
        title: "Rebalancing reduces portfolio volatility",
        description: `Your top fund holds ${maxAlloc}% of your portfolio. Diversifying may reduce risk.`,
        impact: "Lower risk",
        priority: 3,
      });
    }
  }

  if (lifeStage === "early-career" || lifeStage === "growth") {
    const rate = data.planDetails?.contributionRate ?? 0;
    if (rate < 15) {
      actions.push({
        id: "increase-savings",
        type: "increase",
        title: "Boost your savings rate to accelerate growth",
        description: `At ${rate}%, you have room to increase. Even 1% more compounds significantly over ${lifeStage === "early-career" ? "35+" : "20+"} years.`,
        impact: "+1% = significant long-term growth",
        priority: 4,
      });
    }
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

function computeHeroMessage(
  readinessScore: number,
  matchGap: number,
  lifeStage: LifeStage,
): string {
  if (readinessScore >= 90) return "You're in excellent shape. Keep building momentum.";
  if (readinessScore >= 70) {
    if (matchGap > 0) {
      return `You are ${readinessScore}% on track. Increasing by ${matchGap}% puts you in the green zone.`;
    }
    return `You are ${readinessScore}% on track. Small adjustments today create powerful results.`;
  }
  if (readinessScore >= 50) {
    switch (lifeStage) {
      case "early-career":
        return "Time is on your side. Start strong and let compounding do the work.";
      case "growth":
        return "You're in your growth phase. This is the decade to maximize contributions.";
      default:
        return "Every step forward matters. Let's find ways to close the gap.";
    }
  }
  return "Let's build your foundation. Small consistent steps lead to big results.";
}

export function useDashboardEngine(data: EnrollmentSummary): DashboardEngine {
  return useMemo(() => {
    const plan = data.planDetails;
    const goal = data.goalProgress;
    const balances = data.balances;
    const ror = data.rateOfReturn;

    const currentAge = goal?.currentAge ?? 40;
    const retirementAge = goal?.retirementAge ?? 65;
    const yearsToRetirement = retirementAge - currentAge;
    const salary = goal?.salary ?? 85000;
    const contributionRate = plan?.contributionRate ?? 0;
    const matchCap = plan?.employerMatchCap ?? 6;
    const matchPct = plan?.employerMatchPct ?? 100;
    const currentBalance = plan?.totalBalance ?? 0;
    const projectedBalance = goal?.projectedBalance ?? 0;
    const vestedBalance = balances?.vestedBalance ?? 0;

    /* Life stage */
    const { stage: lifeStage, label: lifeStageLabel } = deriveLifeStage(currentAge);

    /* Match calculation */
    const effectiveContribution = Math.min(contributionRate, matchCap);
    const matchGap = Math.max(0, matchCap - effectiveContribution);
    const missingMatch = matchGap > 0 ? (matchGap / 100) * salary * (matchPct / 100) : 0;

    /* Scores */
    const readinessScore = data.topBanner?.percentOnTrack ?? goal?.percentOnTrack ?? 0;
    const confidenceLevel = ror?.confidencePct ?? 75;

    const optimizationScore = (() => {
      let score = 50;
      if (matchGap === 0) score += 25;
      if (contributionRate >= 10) score += 15;
      if (contributionRate >= 15) score += 10;
      return Math.min(100, score);
    })();

    const allocations = data.investmentAllocations;
    const diversificationScore = (() => {
      if (allocations.length === 0) return 0;
      const maxAlloc = Math.max(...allocations.map((a) => a.allocationPct));
      if (allocations.length >= 4 && maxAlloc <= 50) return 90;
      if (allocations.length >= 3 && maxAlloc <= 60) return 70;
      if (allocations.length >= 2) return 50;
      return 30;
    })();

    const riskAlignment = Math.min(100, diversificationScore + (confidenceLevel > 70 ? 10 : 0));

    /* Liquidity */
    const liquidityStatus: DashboardEngine["liquidityStatus"] =
      vestedBalance > 50000 ? "healthy" : vestedBalance > 20000 ? "warning" : "critical";

    /* Loan */
    const loanEligible = vestedBalance > 1000;
    const maxLoanAmount = Math.min(50000, vestedBalance * 0.5);

    /* Recommendations */
    const recommendedActions = computeRecommendations(data, matchGap, missingMatch, lifeStage);

    /* Hero message */
    const heroMessage = computeHeroMessage(readinessScore, matchGap, lifeStage);

    return {
      readinessScore,
      confidenceLevel,
      optimizationScore,
      diversificationScore,
      riskAlignment,
      liquidityStatus,
      missingMatch,
      matchGap,
      recommendedActions,
      lifeStage,
      lifeStageLabel,
      heroMessage,
      yearsToRetirement,
      projectedBalance,
      currentBalance,
      contributionRate,
      employerMatch: { pct: matchPct, cap: matchCap },
      ytdReturn: plan?.ytdReturn ?? 0,
      monthlyContribution: goal?.monthlyContribution ?? 0,
      salary,
      currentAge,
      retirementAge,
      loanEligible,
      maxLoanAmount,
    };
  }, [data]);
}

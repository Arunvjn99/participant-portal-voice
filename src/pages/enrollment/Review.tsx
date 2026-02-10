import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { DashboardCard } from "../../components/dashboard/DashboardCard";
import { EnrollmentStepper } from "../../components/enrollment/EnrollmentStepper";
import { AllocationChart } from "../../components/investments/AllocationChart";
import { useEnrollment } from "../../enrollment/context/EnrollmentContext";
import { useInvestment } from "../../context/InvestmentContext";
import { getFundById } from "../../data/mockFunds";
import Button from "../../components/ui/Button";
import { EnrollmentFooter } from "../../components/enrollment/EnrollmentFooter";
import { AIAdvisorModal } from "../../components/enrollment/AIAdvisorModal";
import { SuccessEnrollmentModal } from "../../components/enrollment/SuccessEnrollmentModal";
import type { SelectedPlanId } from "../../enrollment/context/EnrollmentContext";
import type { ContributionSource, IncrementCycle } from "../../enrollment/logic/types";

const PLAN_NAMES: Record<SelectedPlanId, string> = {
  traditional_401k: "Traditional 401(k)",
  roth_401k: "Roth 401(k)",
  roth_ira: "Roth IRA",
  null: "",
};

const PLAN_TYPE_LABELS: Record<SelectedPlanId, string> = {
  traditional_401k: "401(k) Plan",
  roth_401k: "401(k) Plan",
  roth_ira: "Roth IRA",
  null: "",
};

const SOURCE_NAMES: Record<ContributionSource, string> = {
  preTax: "Pre-tax",
  roth: "Roth",
  afterTax: "After-tax",
};

const INCREMENT_CYCLE_LABELS: Record<IncrementCycle, string> = {
  calendar_year: "Calendar Year",
  plan_enroll_date: "Plan Enroll Date",
  plan_year: "Plan Year",
};

function getAssetClassLabel(ac: string): string {
  if (ac.includes("Large Cap")) return "Large Cap Blend";
  if (ac.includes("Mid Cap")) return "Mid Cap";
  if (ac.includes("Small Cap")) return "Small Cap";
  if (ac.includes("International")) return "International";
  if (ac.includes("Bond")) return "Intermediate Bond";
  if (ac.includes("Real Estate")) return "Real Estate";
  if (ac.includes("Cash")) return "Cash";
  if (ac.includes("Target")) return "Target Date";
  return ac;
}

/**
 * Review - Final enrollment review page per Figma (node 505-3789)
 */
export const Review = () => {
  const navigate = useNavigate();
  const enrollment = useEnrollment();
  const investment = useInvestment();

  const [acknowledgements, setAcknowledgements] = useState({
    feeDisclosure: false,
    qdefault: false,
  });
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((msg: string) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setFeedbackMessage(msg);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackMessage(null);
      feedbackTimeoutRef.current = null;
    }, 4000);
  }, []);

  const prerequisites = useMemo(() => {
    if (!enrollment.state.isInitialized) {
      return { hasPlan: false, hasContribution: false, hasInvestment: false, allMet: false, loading: true };
    }
    const hasPlan = enrollment.state.selectedPlan !== null;
    const hasContribution = enrollment.state.contributionAmount > 0;
    const hasInvestment = investment.canConfirmAllocation;
    return {
      hasPlan,
      hasContribution,
      hasInvestment,
      allMet: hasPlan && hasContribution && hasInvestment,
      loading: false,
    };
  }, [
    enrollment.state.isInitialized,
    enrollment.state.selectedPlan,
    enrollment.state.contributionAmount,
    investment.canConfirmAllocation,
  ]);

  if (prerequisites.loading) return null;
  if (!prerequisites.hasPlan) return <Navigate to="/enrollment/choose-plan" replace />;
  if (!prerequisites.hasContribution) return <Navigate to="/enrollment/contribution" replace />;
  // Allow viewing Review even when allocation invalid; CTA disabled until allocation = 100%

  const selectedPlanName = enrollment.state.selectedPlan ? PLAN_NAMES[enrollment.state.selectedPlan] : "";
  const { preTax = 0, roth = 0, afterTax = 0 } = enrollment.state.sourceAllocation ?? {};
  const contributionTotal = enrollment.state.contributionAmount ?? 0;

  // Unified fund list from chart allocations
  const fundTableRows = useMemo(() => {
    return investment.chartAllocations
      .filter((a) => a.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .map(({ fundId, percentage }) => {
        const fund = getFundById(fundId);
        return fund ? { fund, percentage } : null;
      })
      .filter(Boolean) as { fund: NonNullable<ReturnType<typeof getFundById>>; percentage: number }[];
  }, [investment.chartAllocations]);

  const totalAllocation = fundTableRows.reduce((s, r) => s + r.percentage, 0);
  const weightedSummary = investment.weightedSummary;
  const isAllocationValid = weightedSummary.isValid;

  // Projected value for goal simulator
  const projectedValue = useMemo(() => {
    const years = (enrollment.state.retirementAge ?? 67) - (enrollment.state.currentAge ?? 40);
    const annual = (enrollment.monthlyContribution?.employee ?? 0) * 12;
    const rate = (weightedSummary.expectedReturn ?? 7) / 100;
    let v = enrollment.state.currentBalance ?? 0;
    for (let i = 0; i < years; i++) v = v * (1 + rate) + annual;
    return v;
  }, [
    enrollment.state.retirementAge,
    enrollment.state.currentAge,
    enrollment.monthlyContribution?.employee,
    enrollment.state.currentBalance,
    weightedSummary.expectedReturn,
  ]);

  const fundedPct = useMemo(() => {
    const goal = projectedValue;
    const cur = enrollment.state.currentBalance ?? 0;
    return goal > 0 ? Math.min(100, (cur / goal) * 100) : 100;
  }, [projectedValue, enrollment.state.currentBalance]);

  const canEnroll =
    prerequisites.allMet &&
    investment.canConfirmAllocation &&
    acknowledgements.feeDisclosure &&
    acknowledgements.qdefault;

  const formatRiskLevel = (r: number) => {
    if (r < 3) return "Conservative Investor";
    if (r < 5) return "Moderate Investor";
    if (r < 7) return "Moderate-Aggressive Investor";
    return "Aggressive Investor";
  };

  const formatContributionPct = (pct: number) =>
    pct % 1 === 0 ? `${pct}%` : `${pct.toFixed(1)}%`;

  const PencilIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );

  const buildEnrollmentSummary = useCallback(() => {
    const lines: string[] = [
      "Enrollment Summary",
      "==================",
      "",
      `Plan: ${selectedPlanName || "Traditional 401(k)"}`,
      `Employer Match: ${enrollment.state.assumptions.employerMatchPercentage}%`,
      `Contribution: ${contributionTotal}% of paycheck`,
      `  Pre-tax: ${preTax > 0 ? ((preTax / 100) * contributionTotal).toFixed(1) + "%" : "—"}`,
      `  Roth: ${roth > 0 ? ((roth / 100) * contributionTotal).toFixed(1) + "%" : "—"}`,
      `  After-tax: ${afterTax > 0 ? ((afterTax / 100) * contributionTotal).toFixed(1) + "%" : "—"}`,
      "",
      "Investment Elections:",
      ...fundTableRows.map((r) => `  ${r.fund.ticker} ${r.fund.name}: ${r.percentage.toFixed(1)}%`),
      "",
      `Total Allocation: ${totalAllocation.toFixed(1)}%`,
      `Expected Return: ${(weightedSummary.expectedReturn ?? 0).toFixed(1)}%`,
      `Estimated Fees: ${(weightedSummary.totalFees ?? 0).toFixed(2)}%`,
    ];
    return lines.join("\n");
  }, [
    selectedPlanName,
    enrollment.state.assumptions.employerMatchPercentage,
    contributionTotal,
    preTax,
    roth,
    afterTax,
    fundTableRows,
    totalAllocation,
    weightedSummary.expectedReturn,
    weightedSummary.totalFees,
  ]);

  const handleDownloadPDF = useCallback(() => {
    const summary = buildEnrollmentSummary();
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enrollment-summary-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback("Summary downloaded.");
  }, [buildEnrollmentSummary, showFeedback]);

  const handleEmailSummary = useCallback(() => {
    const summary = buildEnrollmentSummary();
    const subject = encodeURIComponent("My Retirement Enrollment Summary");
    const body = encodeURIComponent(summary);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    showFeedback("Opening email client...");
  }, [buildEnrollmentSummary, showFeedback]);

  const handlePlanViewDetails = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigate("/enrollment/choose-plan");
    },
    [navigate]
  );

  const handleApplySuggestion = useCallback(
    (suggestion: "contribution" | "investments") => {
      showFeedback(
        suggestion === "contribution"
          ? "Go to Contributions to apply this change."
          : "Go to Investment Elections to apply this change."
      );
      setTimeout(() => {
        navigate(suggestion === "contribution" ? "/enrollment/contribution" : "/enrollment/investments");
      }, 800);
    },
    [navigate, showFeedback]
  );

  return (
    <DashboardLayout header={<DashboardHeader />}>
      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-medium text-emerald-800 shadow-lg dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
        >
          {feedbackMessage}
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-6 w-full pb-[100px]">
        <div className="enrollment-stepper-section review-page__stepper w-full">
          <EnrollmentStepper
            currentStep={4}
            title="Review Your Enrollment"
            subtitle="Please review your selections before confirming enrollment."
          />
        </div>

        {/* Investment Goal Simulator - full width per Figma (505-4259) */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-6 sm:gap-6 sm:px-6 dark:from-blue-600 dark:to-blue-700">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 sm:gap-6">
            <div className="relative h-20 w-20 shrink-0 sm:h-[100px] sm:w-[100px]">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.min(100, fundedPct) * 2.64} 264`} transform="rotate(-90 50 50)" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-center text-sm font-semibold text-white">
                Reached {Math.min(100, Math.round(fundedPct))}%
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="m-0 mb-2 text-xl font-semibold text-white">Investment Goal Simulator</h3>
              <p className="m-0 mb-1 text-[0.9375em] text-white/95">Based on your current selections, you are on track.</p>
              <p className="m-0 mb-4 text-sm text-white/90">Projected Shortfall: $0</p>
            </div>
          </div>
          <div className="shrink-0">
            <Button type="button" onClick={() => setShowAdvisorModal(true)} className="!bg-white !text-blue-600 hover:!bg-white/95 dark:!text-blue-600">
              Optimize your score
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-8">
          <div className="flex min-w-0 flex-col gap-4">
            {/* Contributions - only sources selected in Contribution step (sourceAllocation > 0) */}
            <DashboardCard
              title="Contributions"
              action={
                <button type="button" onClick={() => navigate("/enrollment/contribution")} className="border-0 bg-transparent p-0 text-sm font-medium text-blue-600 cursor-pointer font-inherit hover:underline dark:text-blue-400">
                  Edit
                </button>
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-5">
                <div className="relative flex flex-col rounded-lg border border-border bg-card p-5">
                  <span className="mb-3 text-[0.9375em] font-normal text-slate-700 dark:text-slate-200">Pre-tax</span>
                  <button type="button" className="absolute top-2 right-2 p-1 bg-transparent border-0 text-slate-400 cursor-pointer leading-none hover:text-blue-500 dark:hover:text-blue-400" aria-label="Edit Pre-tax" onClick={() => navigate("/enrollment/contribution")}>
                    <PencilIcon />
                  </button>
                  <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                    <div className={`text-2xl font-bold ${preTax > 0 ? "text-foreground" : "text-slate-400 dark:text-slate-500"}`}>
                      {formatContributionPct((preTax / 100) * contributionTotal)}
                    </div>
                    <div className="text-[0.8125em] font-normal text-muted-foreground">of paycheck</div>
                  </div>
                </div>
                <div className="relative flex flex-col rounded-lg border border-border bg-card p-5">
                  <span className="mb-3 text-[0.9375em] font-normal text-slate-700 dark:text-slate-200">Roth</span>
                  <button type="button" className="absolute top-2 right-2 p-1 bg-transparent border-0 text-slate-400 cursor-pointer leading-none hover:text-blue-500 dark:hover:text-blue-400" aria-label="Edit Roth" onClick={() => navigate("/enrollment/contribution")}>
                    <PencilIcon />
                  </button>
                  <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                    <div className={`text-2xl font-bold ${roth > 0 ? "text-foreground" : "text-slate-400 dark:text-slate-500"}`}>
                      {formatContributionPct((roth / 100) * contributionTotal)}
                    </div>
                    <div className="text-[0.8125em] font-normal text-muted-foreground">of paycheck</div>
                  </div>
                </div>
                <div className="relative flex flex-col rounded-lg border border-border bg-card p-5 sm:col-span-2 lg:col-span-1">
                  <span className="mb-3 text-[0.9375em] font-normal text-slate-700 dark:text-slate-200">After-tax</span>
                  <button type="button" className="absolute top-2 right-2 p-1 bg-transparent border-0 text-slate-400 cursor-pointer leading-none hover:text-blue-500 dark:hover:text-blue-400" aria-label="Edit After-tax" onClick={() => navigate("/enrollment/contribution")}>
                    <PencilIcon />
                  </button>
                  <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                    <div className={`text-2xl font-bold ${afterTax > 0 ? "text-foreground" : "text-slate-400 dark:text-slate-500"}`}>
                      {formatContributionPct((afterTax / 100) * contributionTotal)}
                    </div>
                    <div className="text-[0.8125em] font-normal text-muted-foreground">of paycheck</div>
                  </div>
                </div>
              </div>
              <button type="button" className="inline-flex items-center gap-0 border-0 bg-transparent text-base font-medium text-blue-600 cursor-pointer p-1 hover:underline dark:text-blue-400" onClick={() => navigate("/enrollment/contribution")}>
                <span className="inline-flex h-6 w-6 items-center justify-center mr-2 bg-blue-500 text-white rounded-full shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                Increase my contribution
              </button>
            </DashboardCard>

            {/* Auto Increase */}
            <DashboardCard
              title="Auto Increase"
              action={
                <button type="button" onClick={() => navigate("/enrollment/future-contributions")} className="border-0 bg-transparent p-0 text-sm font-medium text-blue-600 cursor-pointer font-inherit hover:underline dark:text-blue-400">
                  Edit
                </button>
              }
            >
              {(() => {
                const ai = enrollment.state.autoIncrease;
                const formatPct = (pct: number) => (pct > 0 ? `${pct}%` : "—");
                const hasAnyIncrease = (ai.preTaxIncrease ?? 0) > 0 || (ai.rothIncrease ?? 0) > 0 || (ai.afterTaxIncrease ?? 0) > 0;
                if (!hasAnyIncrease) {
                  return (
                    <p className="m-0 text-[0.9375em] text-slate-600 dark:text-slate-400">
                      Automatic annual increase is not configured.
                    </p>
                  );
                }
                return (
                  <>
                    <div className="mb-4">
                      <span className="text-[0.8125em] font-medium text-muted-foreground">Increment cycle</span>
                      <p className="m-0 mt-1 text-[0.9375em] font-medium text-foreground">
                        {INCREMENT_CYCLE_LABELS[ai.incrementCycle]}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="relative flex flex-col rounded-lg border border-border bg-card p-5">
                        <span className="mb-3 text-[0.9375em] font-normal text-slate-700 dark:text-slate-200">Pre-tax</span>
                        <button type="button" className="absolute top-2 right-2 p-1 bg-transparent border-0 text-slate-400 cursor-pointer leading-none hover:text-blue-500 dark:hover:text-blue-400" aria-label="Edit Pre-tax increase" onClick={() => navigate("/enrollment/future-contributions")}>
                          <PencilIcon />
                        </button>
                        <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                          <div className={`text-2xl font-bold ${(ai.preTaxIncrease ?? 0) > 0 ? "text-foreground" : "text-slate-400 dark:text-slate-500"}`}>
                            {formatPct(ai.preTaxIncrease ?? 0)}
                          </div>
                          <div className="text-[0.8125em] font-normal text-muted-foreground">per year</div>
                        </div>
                      </div>
                      <div className="relative flex flex-col rounded-lg border border-border bg-card p-5">
                        <span className="mb-3 text-[0.9375em] font-normal text-slate-700 dark:text-slate-200">Roth</span>
                        <button type="button" className="absolute top-2 right-2 p-1 bg-transparent border-0 text-slate-400 cursor-pointer leading-none hover:text-blue-500 dark:hover:text-blue-400" aria-label="Edit Roth increase" onClick={() => navigate("/enrollment/future-contributions")}>
                          <PencilIcon />
                        </button>
                        <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                          <div className={`text-2xl font-bold ${(ai.rothIncrease ?? 0) > 0 ? "text-foreground" : "text-slate-400 dark:text-slate-500"}`}>
                            {formatPct(ai.rothIncrease ?? 0)}
                          </div>
                          <div className="text-[0.8125em] font-normal text-muted-foreground">per year</div>
                        </div>
                      </div>
                      <div className="relative flex flex-col rounded-lg border border-border bg-card p-5 sm:col-span-2 lg:col-span-1">
                        <span className="mb-3 text-[0.9375em] font-normal text-slate-700 dark:text-slate-200">After-tax</span>
                        <button type="button" className="absolute top-2 right-2 p-1 bg-transparent border-0 text-slate-400 cursor-pointer leading-none hover:text-blue-500 dark:hover:text-blue-400" aria-label="Edit After-tax increase" onClick={() => navigate("/enrollment/future-contributions")}>
                          <PencilIcon />
                        </button>
                        <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                          <div className={`text-2xl font-bold ${(ai.afterTaxIncrease ?? 0) > 0 ? "text-foreground" : "text-slate-400 dark:text-slate-500"}`}>
                            {formatPct(ai.afterTaxIncrease ?? 0)}
                          </div>
                          <div className="text-[0.8125em] font-normal text-muted-foreground">per year</div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </DashboardCard>

            {/* Investment Elections - unified table, not split by source */}
            <DashboardCard
              title="Investment Elections"
              action={
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    {investment.activeSources.map((s) => SOURCE_NAMES[s]).join(", ")} – {fundTableRows.length} funds
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate("/enrollment/investments")}
                    className={`inline-flex items-center gap-1.5 border-0 bg-transparent text-sm font-medium text-blue-600 cursor-pointer p-0 font-inherit hover:underline dark:text-blue-400 ${!isAllocationValid ? "!text-red-500 dark:!text-red-400" : ""}`}
                  >
                    {!isAllocationValid && (
                      <svg className="review-page__edit-elections-warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    Edit Elections
                  </button>
                </div>
              }
            >
              {!isAllocationValid && (
                <div className="flex items-start gap-2 p-4 mb-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800" role="alert">
                  <svg className="shrink-0 mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-foreground">Total allocation is {totalAllocation.toFixed(0)}%. Must equal 100%.</span>
                    <span className="text-sm text-red-600 dark:text-red-400">Please adjust your fund percentages to proceed.</span>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto mb-4 min-w-0">
                <table className="w-full border-collapse text-[0.9375em]">
                  <thead>
                    <tr>
                      <th className="text-left p-4 font-semibold text-[0.6875em] tracking-wider text-muted-foreground border-b-2 border-slate-200 dark:border-slate-700">FUND NAME</th>
                      <th className="text-left p-4 font-semibold text-[0.6875em] tracking-wider text-muted-foreground border-b-2 border-slate-200 dark:border-slate-700">ASSET CLASS</th>
                      <th className="text-left p-4 font-semibold text-[0.6875em] tracking-wider text-muted-foreground border-b-2 border-slate-200 dark:border-slate-700">EXP RATIO</th>
                      <th className="text-left p-4 font-semibold text-[0.6875em] tracking-wider text-muted-foreground border-b-2 border-slate-200 dark:border-slate-700">ALLOCATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundTableRows.map(({ fund, percentage }) => (
                      <tr key={fund.id}>
                        <td className="p-4 border-b border-slate-200 dark:border-slate-700">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded font-mono w-fit ${["Large Cap", "International"].some(c => fund.assetClass.includes(c)) ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300"}`}>
                              {fund.ticker}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground text-[0.9375em]">{fund.name}</span>
                              <span className="text-xs text-muted-foreground">Risk Score: {Math.min(5, Math.ceil(fund.riskLevel / 2))}/5</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-foreground">{getAssetClassLabel(fund.assetClass)}</td>
                        <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-foreground">{fund.expenseRatio.toFixed(2)}%</td>
                        <td className="p-4 border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-[60px] h-2.5 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                              <div className="h-full rounded-full bg-blue-500 dark:bg-blue-600" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="font-semibold min-w-[3em]">{percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Total funds selected: {fundTableRows.length}</span>
                <span className={`font-semibold inline-flex items-center gap-1.5 ${!isAllocationValid ? "text-red-500 dark:text-red-400" : ""}`}>
                  {!isAllocationValid && (
                    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  Total: {totalAllocation.toFixed(1)}%
                </span>
              </div>
            </DashboardCard>
          </div>

          {/* Right rail - fixed sidebar width (360/400/420) canonical grid */}
          <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            {/* Plan Details - per Figma 505-4560 */}
            <DashboardCard>
              <div className="flex justify-between items-center mb-4">
                <h3 className="m-0 text-lg font-semibold text-foreground">Plan Details</h3>
                <a href="/enrollment/choose-plan" onClick={handlePlanViewDetails} className="text-sm text-blue-600 no-underline hover:underline dark:text-blue-400">View details</a>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.6875em] font-semibold tracking-wider text-muted-foreground">PLAN NAME</span>
                  <span className="text-[0.9375em] font-semibold text-foreground">{enrollment.state.selectedPlan ? PLAN_TYPE_LABELS[enrollment.state.selectedPlan] : "401(k) Plan"}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[0.6875em] font-semibold tracking-wider text-muted-foreground">TYPE</span>
                    <span className="text-[0.9375em] font-semibold text-foreground">{selectedPlanName || "Traditional 401(k)"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-[0.6875em] font-semibold tracking-wider text-muted-foreground">MATCH</span>
                    <span className="text-[0.9375em] font-semibold text-green-600 dark:text-green-400">{enrollment.state.assumptions.employerMatchPercentage}% Employer Match</span>
                  </div>
                </div>
                <div className="h-px bg-slate-200 my-2 dark:bg-slate-600" />
                <div className="flex justify-between items-center">
                  <span className="text-[0.9375em] font-medium text-foreground">Risk Profile</span>
                  <span className="inline-block px-3 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{formatRiskLevel(weightedSummary.riskLevel)}</span>
                </div>
              </div>
            </DashboardCard>

            {/* Allocation Summary - static, never overlaps AI Insights */}
            <DashboardCard className="static">
              <h3 className="text-lg font-semibold text-foreground mb-4">Allocation Summary</h3>
              <div className="review-page__allocation-chart">
                <AllocationChart
                  allocations={investment.chartAllocations}
                  centerLabel="Total"
                  centerValue={totalAllocation.toFixed(0)}
                  showValidBadge={false}
                  isValid={isAllocationValid}
                />
              </div>
              <div className={`flex items-center gap-1 text-sm my-2 ${!isAllocationValid ? "text-red-500 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}`}>
                {!isAllocationValid && (
                  <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                Status: {isAllocationValid ? "Complete" : "Incomplete"}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-muted-foreground">Expected return</span>
                  <span className="text-[0.9375em] font-semibold text-foreground">{(weightedSummary.expectedReturn ?? 0).toFixed(1)}%</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-muted-foreground">Estimated fees</span>
                  <span className="text-[0.9375em] font-semibold text-foreground">{(weightedSummary.totalFees ?? 0).toFixed(2)}%</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Risk</span>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 dark:bg-blue-600 transition-all" style={{ width: `${Math.min(100, (weightedSummary.riskLevel ?? 0) * 10)}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{formatRiskLevel(weightedSummary.riskLevel ?? 0)}</span>
                </div>
              </div>
              <Button type="button" disabled={!isAllocationValid} className="w-full mt-2">
                Confirm Allocation
              </Button>
              {!isAllocationValid && (
                <p className="text-[0.8125em] text-red-500 dark:text-red-400 mt-2 mb-0">Fix allocation error to confirm</p>
              )}
            </DashboardCard>

            {/* AI Insights - always visible below Allocation Summary */}
            <DashboardCard>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                <span className="text-blue-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/></svg></span> AI Insights
              </h3>
              <div className="flex flex-col gap-4">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="mb-2 text-[0.9375em] text-foreground">Increase pre-tax by 2% to close ~40% of shortfall.</p>
                  <Button type="button" onClick={() => handleApplySuggestion("contribution")} className="bg-blue-600 text-white border-0 px-4 py-2 text-sm rounded-md hover:bg-blue-700">Apply Suggestion</Button>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="mb-2 text-[0.9375em] text-foreground">Consider rebalancing to a Target Retirement Fund to simplify allocations.</p>
                  <Button type="button" onClick={() => handleApplySuggestion("investments")} className="bg-blue-600 text-white border-0 px-4 py-2 text-sm rounded-md hover:bg-blue-700">Apply Suggestion</Button>
                </div>
              </div>
              <p className="text-[0.8125em] text-muted-foreground mt-4 mb-0">Insights generated from your plan data.</p>
            </DashboardCard>
          </div>
        </div>

        {/* Full-width sections per Figma - Legal Documents, What Happens Next */}
        <div className="flex flex-col gap-6 w-full md:gap-8">
          {/* Terms and Conditions */}
          <DashboardCard>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-2">
              <svg className="shrink-0 text-muted-foreground" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Terms and Conditions
            </h3>
            <p className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
              <svg className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Please accept the terms and conditions to enable enrollment.
            </p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800">
                <input type="checkbox" checked={acknowledgements.feeDisclosure} onChange={(e) => setAcknowledgements((p) => ({ ...p, feeDisclosure: e.target.checked }))} />
                <span className="flex-1">Fee Disclosure Statement</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800">
                <input type="checkbox" checked={acknowledgements.qdefault} onChange={(e) => setAcknowledgements((p) => ({ ...p, qdefault: e.target.checked }))} />
                <span className="flex-1">Qualified Default Investment Notice</span>
              </label>
            </div>
          </DashboardCard>

          {/* What Happens Next */}
          <DashboardCard title="What Happens Next">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-2xl shrink-0">📅</span>
                <div className="min-w-0">
                  <h4 className="m-0 mb-1 text-base font-semibold text-foreground">When Contributions Start</h4>
                  <p className="m-0 text-sm text-muted-foreground">Deductions will begin on the first payroll cycle following the 15th of next month.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-2xl shrink-0">🕐</span>
                <div className="min-w-0">
                  <h4 className="m-0 mb-1 text-base font-semibold text-foreground">Payroll Timeline</h4>
                  <p className="m-0 text-sm text-muted-foreground">Processing typically takes 1-2 pay periods to reflect on your pay stub.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sm:col-span-2 lg:col-span-1">
                <span className="text-2xl shrink-0">⚙</span>
                <div className="min-w-0">
                  <h4 className="m-0 mb-1 text-base font-semibold text-foreground">Modify Later</h4>
                  <p className="m-0 text-sm text-muted-foreground">You can change your contribution rate or investment elections at any time.</p>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Download / Email */}
          <div className="flex flex-wrap gap-4">
            <Button type="button" onClick={handleDownloadPDF} className="inline-flex items-center gap-2 !border !border-slate-300 !bg-transparent !text-slate-700 hover:!bg-slate-100 dark:!border-slate-600 dark:!bg-transparent dark:!text-slate-300 dark:hover:!bg-slate-800">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> <polyline points="7 10 12 15 17 10" /> <line x1="12" y1="15" x2="12" y2="3" /> </svg>
              Download PDF Summary
            </Button>
            <Button type="button" onClick={handleEmailSummary} className="inline-flex items-center gap-2 !border !border-slate-300 !bg-transparent !text-slate-700 hover:!bg-slate-100 dark:!border-slate-600 dark:!bg-transparent dark:!text-slate-300 dark:hover:!bg-slate-800">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"> <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /> <polyline points="22,6 12,13 2,6" /> </svg>
              Email Summary
            </Button>
          </div>
        </div>

        {!canEnroll && (
          <p className="text-sm text-muted-foreground mt-2 mb-0">
            Please complete all required sections and acknowledge all documents before enrolling.
          </p>
        )}
        <EnrollmentFooter
          step={4}
          primaryLabel="Confirm & Submit"
          primaryDisabled={!canEnroll}
          onPrimary={() => {
            if (!canEnroll) return;
            setShowSuccessModal(true);
          }}
          summaryText={!isAllocationValid ? "Allocation must total 100%" : "Ready to submit"}
          summaryError={!isAllocationValid}
          getDraftSnapshot={() => ({ investment: investment.getInvestmentSnapshot() })}
        />
        <AIAdvisorModal open={showAdvisorModal} onClose={() => setShowAdvisorModal(false)} />
        <SuccessEnrollmentModal
          open={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate("/dashboard/post-enrollment");
          }}
          onViewPlanDetails={() => {
            setShowSuccessModal(false);
            navigate("/dashboard/post-enrollment");
          }}
        />
      </div>
    </DashboardLayout>
  );
};

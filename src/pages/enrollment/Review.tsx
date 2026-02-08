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
import type { SelectedPlanId } from "../../enrollment/context/EnrollmentContext";
import type { ContributionSource } from "../../enrollment/logic/types";

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
  const [autoRebalance, setAutoRebalance] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
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
      <div className="review-page review-page--with-footer">
        <div className="review-page__stepper">
          <EnrollmentStepper currentStep={3} />
        </div>

        <div className="review-page__header">
          <h1 className="review-page__title">
            Review Your Enrollment
            <span className="review-page__step-badge">4/4</span>
          </h1>
          <p className="review-page__description">
            Please review your selections before confirming enrollment.
          </p>
        </div>

        <div className="review-page__content">
          <div className="review-page__left">
            {/* Investment Goal Simulator - blue card, button on right per Figma */}
            <div className="review-page__block review-page__block--goal-simulator review-page__goal-simulator-card">
              <div className="review-page__goal-simulator-main">
                <div className="review-page__goal-simulator-progress">
                  <svg viewBox="0 0 100 100" className="review-page__goal-simulator-ring">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.min(100, fundedPct) * 2.64} 264`} transform="rotate(-90 50 50)" />
                  </svg>
                  <span className="review-page__goal-simulator-value">Reached {Math.min(100, Math.round(fundedPct))}%</span>
                </div>
                <div className="review-page__goal-simulator-body">
                  <h3 className="review-page__goal-simulator-title">Investment Goal Simulator</h3>
                  <p className="review-page__goal-simulator-status">Based on your current selections, you are on track.</p>
                  <p className="review-page__goal-simulator-shortfall">Projected Shortfall: $0</p>
                </div>
              </div>
              <div className="review-page__goal-simulator-actions">
                <Button type="button" onClick={() => setShowAdvisorModal(true)} className="review-page__goal-simulator-optimize">
                  Optimize your score
                </Button>
              </div>
            </div>

            {/* Contributions - only sources selected in Contribution step (sourceAllocation > 0) */}
            <DashboardCard
              title="Contributions"
              action={
                <button type="button" onClick={() => navigate("/enrollment/contribution")} className="review-page__edit-link">
                  Edit
                </button>
              }
              className="review-page__block review-page__block--contributions"
            >
              <div className="review-page__contributions-grid">
                {preTax > 0 && (
                  <div className="review-page__contribution-card">
                    <div className="review-page__contribution-value">{((preTax / 100) * contributionTotal).toFixed(1)}%</div>
                    <div className="review-page__contribution-label">of paycheck</div>
                    <span className="review-page__contribution-source">Pre-tax</span>
                    <button type="button" className="review-page__contribution-edit" aria-label="Edit Pre-tax" onClick={() => navigate("/enrollment/contribution")}>✎</button>
                  </div>
                )}
                {roth > 0 && (
                  <div className="review-page__contribution-card">
                    <div className="review-page__contribution-value">{((roth / 100) * contributionTotal).toFixed(1)}%</div>
                    <div className="review-page__contribution-label">of paycheck</div>
                    <span className="review-page__contribution-source">Roth</span>
                    <button type="button" className="review-page__contribution-edit" aria-label="Edit Roth" onClick={() => navigate("/enrollment/contribution")}>✎</button>
                  </div>
                )}
                {afterTax > 0 && (
                  <div className="review-page__contribution-card">
                    <div className="review-page__contribution-value">{((afterTax / 100) * contributionTotal).toFixed(1)}%</div>
                    <div className="review-page__contribution-label">of paycheck</div>
                    <span className="review-page__contribution-source">After-tax</span>
                    <button type="button" className="review-page__contribution-edit" aria-label="Edit After-tax" onClick={() => navigate("/enrollment/contribution")}>✎</button>
                  </div>
                )}
              </div>
              <button type="button" className="review-page__increase-contribution" onClick={() => navigate("/enrollment/contribution")}>
                <span className="review-page__increase-icon">+</span> Increase my contribution
              </button>
            </DashboardCard>

            {/* Investment Elections - unified table, not split by source */}
            <DashboardCard
              className="review-page__block review-page__block--investments"
              title="Investment Elections"
              action={
                <div className="review-page__investments-header-actions">
                  <span className="review-page__investments-tag">
                    {investment.activeSources.map((s) => SOURCE_NAMES[s]).join(", ")} – {fundTableRows.length} funds
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate("/enrollment/investments")}
                    className={`review-page__edit-elections-link ${!isAllocationValid ? "review-page__edit-elections-link--error" : ""}`}
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
                <div className="review-page__allocation-error-banner" role="alert">
                  <svg className="review-page__allocation-error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Total allocation is {totalAllocation.toFixed(0)}%. Must equal 100%. Please adjust your fund percentages to proceed.
                </div>
              )}
              <div className="review-page__investments-table-wrap">
                <table className="review-page__investments-table">
                  <thead>
                    <tr>
                      <th>FUND NAME</th>
                      <th>ASSET CLASS</th>
                      <th>EXP RATIO</th>
                      <th>ALLOCATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundTableRows.map(({ fund, percentage }) => (
                      <tr key={fund.id}>
                        <td>
                          <div className="review-page__fund-cell">
                            <span className="review-page__fund-ticker">{fund.ticker}</span>
                            <span className="review-page__fund-name">{fund.name}</span>
                            <span className="review-page__fund-risk">Risk Score: {Math.min(5, Math.ceil(fund.riskLevel / 2))}/5</span>
                          </div>
                        </td>
                        <td>{getAssetClassLabel(fund.assetClass)}</td>
                        <td>{fund.expenseRatio.toFixed(2)}%</td>
                        <td>
                          <div className="review-page__allocation-cell">
                            <div className="review-page__allocation-bar">
                              <div className="review-page__allocation-bar-fill" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="review-page__allocation-pct">{percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="review-page__investments-footer">
                <span>Total funds selected: {fundTableRows.length}</span>
                <span className={`review-page__investments-total ${!isAllocationValid ? "review-page__investments-total--invalid" : ""}`}>
                  {!isAllocationValid && (
                    <svg className="review-page__investments-total-warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  Total: {totalAllocation.toFixed(1)}%
                </span>
              </div>
            </DashboardCard>

            {/* Important Legal Documents */}
            <DashboardCard className="review-page__block review-page__block--legal">
              <h3 className="review-page__documents-title">
                <svg className="review-page__documents-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Important Legal Documents
              </h3>
              <p className="review-page__documents-sub">3 documents available - <span className="review-page__documents-required-count">2 required</span></p>
              <p className="review-page__documents-hint">
                <svg className="review-page__documents-hint-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Please acknowledge all required documents to enable enrollment.
              </p>
              <div className="review-page__documents-list">
                <label className="review-page__document-item">
                  <input type="checkbox" checked={acknowledgements.feeDisclosure} onChange={(e) => setAcknowledgements((p) => ({ ...p, feeDisclosure: e.target.checked }))} />
                  <span className="review-page__document-name">Fee Disclosure Statement</span>
                  <span className="review-page__document-required">Required</span>
                  <span className="review-page__document-arrow">→</span>
                </label>
                <label className="review-page__document-item">
                  <input type="checkbox" checked={acknowledgements.qdefault} onChange={(e) => setAcknowledgements((p) => ({ ...p, qdefault: e.target.checked }))} />
                  <span className="review-page__document-name">Qualified Default Investment Notice</span>
                  <span className="review-page__document-required">Required</span>
                  <span className="review-page__document-arrow">→</span>
                </label>
              </div>
            </DashboardCard>

            {/* What Happens Next */}
            <DashboardCard title="What Happens Next" className="review-page__block review-page__block--next">
              <div className="review-page__next-cards">
                <div className="review-page__next-card">
                  <span className="review-page__next-icon">📅</span>
                  <div>
                    <h4>When Contributions Start</h4>
                    <p>Deductions will begin on the first payroll cycle following the 15th of next month.</p>
                  </div>
                </div>
                <div className="review-page__next-card">
                  <span className="review-page__next-icon">🕐</span>
                  <div>
                    <h4>Payroll Timeline</h4>
                    <p>Processing typically takes 1-2 pay periods to reflect on your pay stub.</p>
                  </div>
                </div>
                <div className="review-page__next-card">
                  <span className="review-page__next-icon">⚙</span>
                  <div>
                    <h4>Modify Later</h4>
                    <p>You can change your contribution rate or investment elections at any time.</p>
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* Download / Email */}
            <div className="review-page__block review-page__block--download review-page__download-actions">
              <Button type="button" onClick={handleDownloadPDF} className="review-page__download-btn button--outline">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> <polyline points="7 10 12 15 17 10" /> <line x1="12" y1="15" x2="12" y2="3" /> </svg>
                Download PDF Summary
              </Button>
              <Button type="button" onClick={handleEmailSummary} className="review-page__download-btn button--outline">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"> <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /> <polyline points="22,6 12,13 2,6" /> </svg>
                Email Summary
              </Button>
            </div>
          </div>

          {/* Right rail */}
          <div className="review-page__right">
            {/* Plan Details - from selectedPlan state */}
            <DashboardCard className="review-page__block review-page__block--plan">
              <div className="review-page__plan-header">
                <h3>Plan Details</h3>
                <a href="/enrollment/choose-plan" onClick={handlePlanViewDetails} className="review-page__plan-view">View details</a>
              </div>
              <dl className="review-page__plan-dl">
                <dt>PLAN NAME</dt>
                <dd>{enrollment.state.selectedPlan ? PLAN_TYPE_LABELS[enrollment.state.selectedPlan] : "401(k) Plan"}</dd>
                <dt>TYPE</dt>
                <dd>{selectedPlanName || "Traditional 401(k)"}</dd>
                <dt>MATCH</dt>
                <dd className="review-page__plan-match">{enrollment.state.assumptions.employerMatchPercentage}% Employer Match</dd>
                <dt>Risk Profile</dt>
                <dd><span className="review-page__plan-risk-pill">{formatRiskLevel(weightedSummary.riskLevel)}</span></dd>
              </dl>
            </DashboardCard>

            {/* Allocation Summary - static, never overlaps AI Insights */}
            <DashboardCard className="review-page__block review-page__block--allocation review-page__allocation-summary">
              <h3 className="review-page__allocation-title">Allocation Summary</h3>
              <div className="review-page__allocation-chart">
                <AllocationChart
                  allocations={investment.chartAllocations}
                  centerLabel="Total"
                  centerValue={totalAllocation.toFixed(0)}
                  showValidBadge={false}
                  isValid={isAllocationValid}
                />
              </div>
              <div className={`review-page__allocation-status ${!isAllocationValid ? "review-page__allocation-status--invalid" : ""}`}>
                {!isAllocationValid && (
                  <svg className="review-page__allocation-status-warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                Status: {isAllocationValid ? "Complete" : "Incomplete"}
              </div>
              <div className="review-page__allocation-metrics">
                <div className="review-page__allocation-metric">
                  <span className="review-page__allocation-metric-label">Expected return</span>
                  <span className="review-page__allocation-metric-value">{(weightedSummary.expectedReturn ?? 0).toFixed(1)}%</span>
                </div>
                <div className="review-page__allocation-metric">
                  <span className="review-page__allocation-metric-label">Estimated fees</span>
                  <span className="review-page__allocation-metric-value">{(weightedSummary.totalFees ?? 0).toFixed(2)}%</span>
                </div>
                <div className="review-page__allocation-metric review-page__allocation-metric--risk">
                  <span className="review-page__allocation-metric-label">Risk</span>
                  <div className="review-page__risk-slider">
                    <div className="review-page__risk-slider-track">
                      <div className="review-page__risk-slider-fill" style={{ width: `${Math.min(100, (weightedSummary.riskLevel ?? 0) * 10)}%` }} />
                    </div>
                    <span className="review-page__risk-slider-label">{formatRiskLevel(weightedSummary.riskLevel ?? 0)}</span>
                  </div>
                </div>
              </div>
              <label className="review-page__auto-rebalance">
                <span className="review-page__auto-rebalance-toggle">
                  <input type="checkbox" checked={autoRebalance} onChange={(e) => setAutoRebalance(e.target.checked)} className="review-page__auto-rebalance-input" />
                  <span className="review-page__auto-rebalance-slider" />
                </span>
                Auto Rebalance
              </label>
              <Button type="button" disabled={!isAllocationValid} className="review-page__confirm-allocation">
                Confirm Allocation
              </Button>
              {!isAllocationValid && (
                <p className="review-page__fix-hint">Fix allocation error to confirm</p>
              )}
            </DashboardCard>

            {/* AI Insights - always visible below Allocation Summary */}
            <DashboardCard className="review-page__block review-page__block--insights">
              <h3 className="review-page__insights-title">
                <span className="review-page__insights-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/></svg></span> AI Insights
              </h3>
              <div className="review-page__insights-list">
                <div className="review-page__insight-item">
                  <p>Increase pre-tax by 2% to close ~40% of shortfall.</p>
                  <Button type="button" onClick={() => handleApplySuggestion("contribution")} className="review-page__apply-suggestion-btn">Apply Suggestion</Button>
                </div>
                <div className="review-page__insight-item">
                  <p>Consider rebalancing to a Target Retirement Fund to simplify allocations.</p>
                  <Button type="button" onClick={() => handleApplySuggestion("investments")} className="review-page__apply-suggestion-btn">Apply Suggestion</Button>
                </div>
              </div>
              <p className="review-page__insights-footer">Insights generated from your plan data.</p>
            </DashboardCard>
          </div>
        </div>

        {!canEnroll && (
          <p className="review-page__footer-note">
            Please complete all required sections and acknowledge all documents before enrolling.
          </p>
        )}
        <EnrollmentFooter
          step={3}
          primaryLabel="Confirm & Submit"
          primaryDisabled={!canEnroll}
          onPrimary={() => {
            if (!canEnroll) return;
            navigate("/dashboard/post-enrollment");
          }}
          summaryText={!isAllocationValid ? "Allocation must total 100%" : "Ready to submit"}
          summaryError={!isAllocationValid}
          getDraftSnapshot={() => ({ investment: investment.getInvestmentSnapshot() })}
        />
        <AIAdvisorModal open={showAdvisorModal} onClose={() => setShowAdvisorModal(false)} />
      </div>
    </DashboardLayout>
  );
};

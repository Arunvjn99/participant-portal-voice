import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { DashboardCard } from "../dashboard/DashboardCard";
import Button from "../ui/Button";
import { AllocationChart } from "./AllocationChart";
import { useInvestment } from "../../context/InvestmentContext";
import { ConfirmAllocationModal } from "./ConfirmAllocationModal";

/**
 * AllocationSummary - Sticky right-side panel with weighted allocation summary
 */
export const AllocationSummary = () => {
  const navigate = useNavigate();
  const {
    weightedSummary,
    chartAllocations,
    canConfirmAllocation,
    confirmAllocation,
  } = useInvestment();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [autoRebalance, setAutoRebalance] = useState(false);

  const handleConfirmClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmAllocation = () => {
    if (!canConfirmAllocation) return;
    confirmAllocation();
    setShowConfirmModal(false);
    navigate("/enrollment/review");
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2);
  };

  const formatRiskLevel = (risk: number) => {
    if (risk < 3) return "Conservative";
    if (risk < 5) return "Moderate";
    if (risk < 7) return "Moderate-Aggressive";
    return "Aggressive";
  };

  const expReturnLow = (weightedSummary.expectedReturn * 0.9).toFixed(1);
  const expReturnHigh = (weightedSummary.expectedReturn * 1.1).toFixed(1);
  const riskPercent = Math.min(100, (weightedSummary.riskLevel / 10) * 100);

  const totalAllocation = chartAllocations.reduce((s, a) => s + a.percentage, 0);

  return (
    <>
      <div className="allocation-summary-panel">
        <DashboardCard className="allocation-summary allocation-summary--sticky">
          <div className="allocation-summary__content">
            <div className="allocation-summary__header">
              <div>
                <h3 className="allocation-summary__title">Allocation Summary</h3>
                <p className="allocation-summary__subtitle">Real-time impact of your elections.</p>
              </div>
              <label className="allocation-summary__auto-rebalance">
                <input
                  type="checkbox"
                  checked={autoRebalance}
                  onChange={(e) => setAutoRebalance(e.target.checked)}
                  className="allocation-summary__auto-rebalance-input"
                />
                <span className="allocation-summary__auto-rebalance-text">Auto-rebalance</span>
              </label>
            </div>

            <div className="allocation-summary__chart">
              <AllocationChart
                allocations={chartAllocations}
                centerLabel="TOTAL"
                centerValue={totalAllocation.toFixed(0)}
                showValidBadge
                isValid={weightedSummary.isValid}
              />
            </div>

            <div className="allocation-summary__metrics">
              <div className="allocation-summary__metric">
                <span className="allocation-summary__metric-label">
                  <svg className="allocation-summary__metric-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  Exp. Return
                </span>
                <span className="allocation-summary__metric-value allocation-summary__metric-value--success">
                  {expReturnLow}% - {expReturnHigh}%
                </span>
              </div>
              <div className="allocation-summary__metric">
                <span className="allocation-summary__metric-label">
                  <svg className="allocation-summary__metric-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  Est. Fees
                </span>
                <span className="allocation-summary__metric-value">
                  {formatPercentage(weightedSummary.totalFees)}% / yr
                </span>
              </div>
            </div>

            <div className="allocation-summary__risk-meter">
              <div className="allocation-summary__risk-labels">
                <span>CONSERVATIVE</span>
                <span>AGGRESSIVE</span>
              </div>
              <div className="allocation-summary__risk-track">
                <div
                  className="allocation-summary__risk-marker"
                  style={{ left: `${riskPercent}%` }}
                />
              </div>
              <p className="allocation-summary__risk-value">Risk Level: {formatRiskLevel(weightedSummary.riskLevel)}</p>
            </div>

            <Button
              onClick={handleConfirmClick}
              disabled={!canConfirmAllocation}
              className="allocation-summary__cta"
              type="button"
            >
              Confirm Allocation
            </Button>

            <div className="allocation-summary__secondary-actions">
              <Button type="button" variant="outline" className="allocation-summary__secondary-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Preview PDF
              </Button>
              <Button type="button" variant="outline" className="allocation-summary__secondary-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 19.8L19 21M17.8 4.2L19 3M12 4v2M4 12h2M12 19v2M4.2 6.2L3 5M19.8 6.2L21 5M6.2 19.8L5 21M19.8 17.8L21 19" />
                </svg>
                Ask AI
              </Button>
            </div>
          </div>
        </DashboardCard>

        <div className="advisor-help-card">
          <div className="advisor-help-card__icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <h4 className="advisor-help-card__title">Need help choosing investments?</h4>
          <p className="advisor-help-card__text">
            Get personalized guidance from our AI advisor or connect with a human expert to optimize your portfolio.
          </p>
          <Button type="button" className="advisor-help-card__btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Get Advisor Help
          </Button>
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmAllocationModal
          onConfirm={handleConfirmAllocation}
          onCancel={() => setShowConfirmModal(false)}
          canConfirm={canConfirmAllocation}
        />
      )}
    </>
  );
};

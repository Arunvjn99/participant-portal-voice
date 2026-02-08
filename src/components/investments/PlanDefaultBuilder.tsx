import { useState } from "react";
import { DashboardCard } from "../dashboard/DashboardCard";
import Button from "../ui/Button";
import { FundAllocationRow } from "./FundAllocationRow";
import { AfterTaxAccordion } from "./AfterTaxAccordion";
import { useInvestment } from "../../context/InvestmentContext";
import { getFundById } from "../../data/mockFunds";

/**
 * PlanDefaultBuilder - Displays recommended portfolio with optional edit toggle
 */
export const PlanDefaultBuilder = () => {
  const {
    planDefaultPortfolio,
    planDefaultEditEnabled,
    setPlanDefaultEditEnabled,
    draftAllocation,
    setDraftAllocation,
    updateDraftAllocation,
    allocationState,
    canConfirmAllocation,
  } = useInvestment();
  const [preTaxExpanded, setPreTaxExpanded] = useState(true);

  if (!planDefaultPortfolio) return null;

  const funds = (planDefaultEditEnabled ? draftAllocation : planDefaultPortfolio.allocations)
    .filter((a) => a.percentage > 0);
  const fundCount = funds.length;

  return (
    <>
    <DashboardCard>
      <div className="plan-default-builder">
        <div className="plan-default-builder__header">
          <div className="plan-default-builder__title-row">
            <span className="plan-default-builder__icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            <div>
              <h3 className="plan-default-builder__title">{planDefaultPortfolio.name}</h3>
              <span className="plan-default-builder__badge">MODERATE INVESTOR</span>
              <span className="plan-default-builder__confidence">88% confidence</span>
            </div>
          </div>
          <div className="plan-default-builder__info-banner">
            <p className="plan-default-builder__info-text">
              Your balanced approach to risk and return indicates a moderate portfolio is ideal. A 60% stocks / 40% bonds allocation provides growth potential while maintaining stability, suitable for most investors with 10+ year horizons.
            </p>
          </div>
          <div className="plan-default-builder__kpis">
            <div className="plan-default-builder__kpi">
              <span className="plan-default-builder__kpi-label">EXPECTED RETURN</span>
              <span className="plan-default-builder__kpi-value">6-8%</span>
            </div>
            <div className="plan-default-builder__kpi">
              <span className="plan-default-builder__kpi-label">VOLATILITY RANGE</span>
              <span className="plan-default-builder__kpi-value">Moderate (10-15%)</span>
            </div>
            <div className="plan-default-builder__kpi">
              <span className="plan-default-builder__kpi-label">RISK LEVEL</span>
              <span className="plan-default-builder__kpi-value plan-default-builder__kpi-value--pill">Medium</span>
            </div>
          </div>
          <label className="plan-default-builder__toggle">
            <input
              type="checkbox"
              checked={planDefaultEditEnabled}
              onChange={(e) => setPlanDefaultEditEnabled(e.target.checked)}
              className="plan-default-builder__toggle-input"
            />
            <span className="plan-default-builder__toggle-text">Allow me to edit allocation</span>
            <span className="plan-default-builder__toggle-desc">Enable to customize recommended allocations and add investments.</span>
          </label>
        </div>
        <div className="plan-default-builder__fund-allocation-header">FUND ALLOCATION</div>
        <div className="plan-default-builder__pre-tax">
          <button
            type="button"
            className="plan-default-builder__accordion-trigger"
            onClick={() => setPreTaxExpanded((x) => !x)}
            aria-expanded={preTaxExpanded}
          >
            <span className="plan-default-builder__accordion-title">Pre-tax</span>
            <span className="plan-default-builder__accordion-meta">{fundCount} funds</span>
            <span
              className={`plan-default-builder__accordion-total ${
                allocationState.isValid ? "" : "plan-default-builder__accordion-total--invalid"
              }`}
            >
              {allocationState.total.toFixed(1)}%
            </span>
            <span className="plan-default-builder__accordion-chevron" aria-hidden="true">
              {preTaxExpanded ? "▼" : "▶"}
            </span>
          </button>
          {preTaxExpanded && (
            <div className="plan-default-builder__accordion-content">
              {planDefaultEditEnabled && (
                <Button
                  type="button"
                  variant="outline"
                  className="plan-default-builder__add-investment"
                  onClick={() => {}}
                >
                  + Add Investment
                </Button>
              )}
              <div className="plan-default-builder__funds">
                {funds.map((allocation) => {
                  const fund = getFundById(allocation.fundId);
                  if (!fund) return null;
                  return (
                    <FundAllocationRow
                      key={fund.id}
                      fund={fund}
                      allocation={allocation}
                      disabled={!planDefaultEditEnabled}
                      onAllocationChange={(pct) => updateDraftAllocation(fund.id, pct)}
                      onRemove={
                        planDefaultEditEnabled
                          ? () => {
                              const removedPct = allocation.percentage;
                              const rest = draftAllocation.filter((a) => a.fundId !== fund.id);
                              const next = rest.map((a) => ({
                                ...a,
                                percentage: rest.length > 0 && removedPct > 0 ? a.percentage + removedPct / rest.length : a.percentage,
                              }));
                              setDraftAllocation(next);
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
              <div className="plan-default-builder__total-row">
                <span className="plan-default-builder__total-label">Total Allocation:</span>
                <span
                  className={`plan-default-builder__total-value ${
                    allocationState.isValid ? "" : "plan-default-builder__total-value--invalid"
                  }`}
                >
                  {allocationState.total.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
        <AfterTaxAccordion embedded />
        {canConfirmAllocation && (
          <div className="plan-default-builder__success" role="status">
            <span className="plan-default-builder__success-icon" aria-hidden="true">✓</span>
            <span>Total Allocation: 100% Perfect! Your allocation is complete.</span>
          </div>
        )}
      </div>
    </DashboardCard>
  </>
  );
};

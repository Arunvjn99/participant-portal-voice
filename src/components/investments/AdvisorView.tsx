import { useState } from "react";
import { DashboardCard } from "../dashboard/DashboardCard";
import Button from "../ui/Button";
import { useInvestment } from "../../context/InvestmentContext";
import { getFundById } from "../../data/mockFunds";

/**
 * AdvisorView - Read-only investment view with advisor explanation
 */
export const AdvisorView = () => {
  const { draftAllocation } = useInvestment();
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);

  return (
    <>
    <DashboardCard>
      <div className="advisor-view">
        <div className="advisor-view__header">
          <h3 className="advisor-view__title">Managed by Your Advisor</h3>
          <p className="advisor-view__description">
            Your investment portfolio is professionally managed by your financial advisor. They will
            monitor and adjust your allocation based on market conditions and your retirement goals.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvisorModal(true)}
            className="advisor-view__cta"
          >
            Contact Advisor
          </Button>
        </div>

        <div className="advisor-view__current-allocation">
          <h4 className="advisor-view__section-title">Current Allocation</h4>
          <div className="advisor-view__funds">
            {draftAllocation
              .filter((allocation) => allocation.percentage > 0)
              .map((allocation) => {
                const fund = getFundById(allocation.fundId);
                if (!fund) return null;
                
                return (
                  <div key={fund.id} className="advisor-view__fund-item">
                    <div className="advisor-view__fund-info">
                      <span className="advisor-view__fund-name">{fund.name}</span>
                      <span className="advisor-view__fund-ticker">{fund.ticker}</span>
                    </div>
                    <div className="advisor-view__fund-details">
                      <span>{fund.assetClass}</span>
                      <span>•</span>
                      <span>{allocation.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="advisor-view__disclosure">
          <h4 className="advisor-view__disclosure-title">Fee Disclosure</h4>
          <p className="advisor-view__disclosure-text">
            Your advisor charges an annual management fee of 0.75% of assets under management. This
            fee is in addition to the expense ratios of the underlying funds. All fees are clearly
            disclosed in your quarterly statements.
          </p>
        </div>
      </div>
    </DashboardCard>
    {showAdvisorModal && (
      <div
        className="advisor-view__modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="advisor-modal-title"
      >
        <div className="advisor-view__modal">
          <h2 id="advisor-modal-title" className="advisor-view__modal-title">
            Contact Your Advisor
          </h2>
          <p className="advisor-view__modal-text">
            Reach out to your financial advisor to discuss your investment strategy or schedule a
            meeting. You can continue with enrollment without contacting your advisor.
          </p>
          <div className="advisor-view__modal-actions">
            <Button type="button" onClick={() => setShowAdvisorModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

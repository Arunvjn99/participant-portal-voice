import { useState } from "react";
import { DashboardCard } from "../dashboard/DashboardCard";
import { FundAllocationRow } from "./FundAllocationRow";
import { useInvestment } from "../../context/InvestmentContext";
import { getFundById } from "../../data/mockFunds";

interface AfterTaxAccordionProps {
  /** When true, render without card wrapper (for embedding in PlanDefaultBuilder) */
  embedded?: boolean;
}

/**
 * After-tax allocation section - collapsed by default, independent from pre-tax.
 * Shown only when hasAfterTax (sourceAllocation.afterTax > 0).
 */
export const AfterTaxAccordion = ({ embedded }: AfterTaxAccordionProps) => {
  const {
    hasAfterTax,
    afterTaxDraftAllocation,
    updateAfterTaxDraftAllocation,
    afterTaxAllocationState,
    planDefaultPortfolio,
  } = useInvestment();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasAfterTax || !planDefaultPortfolio) return null;

  const fundCount = planDefaultPortfolio.allocations.length;

  const content = (
    <div className="after-tax-accordion">
        <button
          type="button"
          id="after-tax-trigger"
          className="after-tax-accordion__trigger"
          onClick={() => setIsExpanded((x) => !x)}
          aria-expanded={isExpanded}
          aria-controls="after-tax-content"
        >
          <span className="after-tax-accordion__title">After-tax</span>
          <span className="after-tax-accordion__meta">{fundCount} funds</span>
          <span
            className={`after-tax-accordion__total ${
              afterTaxAllocationState.isValid ? "" : "after-tax-accordion__total--invalid"
            }`}
          >
            {afterTaxAllocationState.total.toFixed(1)}%
          </span>
          <span className="after-tax-accordion__chevron" aria-hidden="true">
            {isExpanded ? "▼" : "▶"}
          </span>
        </button>
        <div
          id="after-tax-content"
          className={`after-tax-accordion__content ${isExpanded ? "after-tax-accordion__content--expanded" : ""}`}
          role="region"
          aria-labelledby="after-tax-trigger"
        >
          <p className="after-tax-accordion__description">
            Allocate your after-tax contributions separately. This total must equal 100%.
          </p>
          <div className="after-tax-accordion__funds">
            {planDefaultPortfolio.allocations.map((allocation) => {
              const fund = getFundById(allocation.fundId);
              if (!fund) return null;
              const draft = afterTaxDraftAllocation.find((x) => x.fundId === fund.id);
              const displayAllocation = draft ?? allocation;
              return (
                <FundAllocationRow
                  key={fund.id}
                  fund={fund}
                  allocation={displayAllocation}
                  disabled={false}
                  onAllocationChange={(pct) => updateAfterTaxDraftAllocation(fund.id, pct)}
                />
              );
            })}
          </div>
        </div>
      </div>
  );

  if (embedded) {
    return content;
  }
  return <DashboardCard>{content}</DashboardCard>;
};

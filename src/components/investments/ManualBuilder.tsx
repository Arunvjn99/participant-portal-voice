import { SourceAccordion } from "./SourceAccordion";
import { PlanDefaultPortfolioCard } from "./PlanDefaultPortfolioCard";
import { useInvestment } from "../../context/InvestmentContext";

/**
 * ManualBuilder - Per Figma: Plan Default Portfolio (with edit toggle), FUND ALLOCATION accordions.
 */
export const ManualBuilder = () => {
  const {
    activeSources,
    editAllocationEnabled,
    setEditAllocationEnabled,
    hasPreTaxOrRoth,
    hasAfterTax,
  } = useInvestment();

  if (!hasPreTaxOrRoth && !hasAfterTax) {
    return null;
  }

  return (
    <div className="manual-builder">
      <PlanDefaultPortfolioCard
        editAllocationEnabled={editAllocationEnabled}
        onEditToggleChange={setEditAllocationEnabled}
      />

      <div className="manual-builder__allocation-header">
        <h3 className="manual-builder__allocation-title">FUND ALLOCATION</h3>
      </div>

      {activeSources.map((source) => (
        <SourceAccordion key={source} source={source} />
      ))}
    </div>
  );
};

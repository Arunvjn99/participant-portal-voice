import { DashboardCard } from "../dashboard/DashboardCard";

/** Lock icon for edit toggle */
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="4" y="8" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <path d="M6 8V5a4 4 0 118 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Filter icon for header */
const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
    <circle cx="18" cy="6" r="2" fill="currentColor" />
    <circle cx="6" cy="12" r="2" fill="currentColor" />
    <circle cx="14" cy="18" r="2" fill="currentColor" />
  </svg>
);

interface PlanDefaultPortfolioCardProps {
  editAllocationEnabled?: boolean;
  onEditToggleChange?: (enabled: boolean) => void;
}

/**
 * Plan Default Portfolio card - Figma design
 * Shows recommended strategy with MODERATE INVESTOR badge, info banner, metrics, and edit toggle
 */
export const PlanDefaultPortfolioCard = ({
  editAllocationEnabled = false,
  onEditToggleChange,
}: PlanDefaultPortfolioCardProps) => {
  return (
    <DashboardCard>
      <div className="plan-default-portfolio">
        <div className="plan-default-portfolio__header">
          <div className="plan-default-portfolio__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="14" y="2" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="2" y="14" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="14" y="14" width="8" height="8" rx="1" fill="currentColor" />
            </svg>
          </div>
          <div className="plan-default-portfolio__title-row">
            <h3 className="plan-default-portfolio__title">Plan Default Portfolio</h3>
            <span className="plan-default-portfolio__badge">MODERATE INVESTOR</span>
            <span className="plan-default-portfolio__confidence">88% confidence</span>
          </div>
          <button
            type="button"
            className="plan-default-portfolio__filter-btn"
            aria-label="Filter options"
          >
            <FilterIcon />
          </button>
        </div>
        <div className="plan-default-portfolio__banner">
          <svg className="plan-default-portfolio__banner-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M10 7v4M10 13h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="plan-default-portfolio__banner-text">
            Your balanced approach to risk and return indicates a moderate portfolio is ideal. A 60% stocks / 40% bonds allocation provides potential while maintaining stability, suitable for most investors with 10+ year horizons.
          </p>
        </div>
        <div className="plan-default-portfolio__metrics">
          <div className="plan-default-portfolio__metric">
            <span className="plan-default-portfolio__metric-label">EXPECTED RETURN</span>
            <span className="plan-default-portfolio__metric-value plan-default-portfolio__metric-value--green">6-8%</span>
          </div>
          <div className="plan-default-portfolio__metric">
            <span className="plan-default-portfolio__metric-label">VOLATILITY RANGE</span>
            <span className="plan-default-portfolio__metric-value">Moderate (10-15%)</span>
          </div>
          <div className="plan-default-portfolio__metric">
            <span className="plan-default-portfolio__metric-label">RISK LEVEL</span>
            <span className="plan-default-portfolio__metric-value plan-default-portfolio__metric-value--pill">Medium</span>
          </div>
        </div>

        {onEditToggleChange && (
          <div className="plan-default-portfolio__edit-toggle">
            <span className="plan-default-portfolio__edit-toggle-icon" aria-hidden="true">
              <LockIcon />
            </span>
            <label className="plan-default-portfolio__edit-toggle-label">
              <span className="plan-default-portfolio__edit-toggle-text">Allow me to edit allocation</span>
              <div className="plan-default-portfolio__edit-toggle-switch-wrapper">
                <input
                  type="checkbox"
                  checked={editAllocationEnabled}
                  onChange={(e) => onEditToggleChange(e.target.checked)}
                  className="plan-default-portfolio__edit-toggle-input"
                  role="switch"
                />
                <span className="plan-default-portfolio__edit-toggle-switch" />
              </div>
            </label>
          </div>
        )}
        {onEditToggleChange && (
          <p className="plan-default-portfolio__edit-toggle-hint">
            Enable to customize recommended allocations and add investments
          </p>
        )}
      </div>
    </DashboardCard>
  );
};

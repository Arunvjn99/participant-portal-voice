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
      <div className="flex flex-col gap-4">
        {/* Header: icon | title block | filter - per Figma 293-777 */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="14" y="4" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="4" y="14" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="14" y="14" width="6" height="6" rx="1" fill="currentColor" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 text-xl font-semibold text-foreground">Plan Default Portfolio</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-green-600 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white dark:bg-green-500">
                MODERATE INVESTOR
              </span>
              <span className="text-sm text-muted-foreground">88% confidence</span>
            </div>
          </div>
          <button
            type="button"
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 dark:hover:text-foreground"
            aria-label="Filter options"
          >
            <FilterIcon />
          </button>
        </div>

        {/* Info banner - light blue bg, info icon, dark blue text per Figma */}
        <div className="flex gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-600">
            <span className="text-sm font-bold">i</span>
          </div>
          <p className="m-0 text-[0.9375em] leading-relaxed text-blue-900 dark:text-blue-100">
            Your balanced approach to risk and return indicates a moderate portfolio is ideal. A 60% stocks / 40% bonds allocation provides growth potential while maintaining stability, suitable for most investors with 10+ year horizons.
          </p>
        </div>
        {/* Metrics row */}
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">EXPECTED RETURN</span>
            <span className="font-semibold text-green-600 dark:text-green-400">6-8%</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">VOLATILITY RANGE</span>
            <span className="font-semibold text-foreground">Moderate (10-15%)</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">RISK LEVEL</span>
            <span className="inline-block w-fit rounded-full bg-green-600 px-2.5 py-0.5 text-sm font-semibold text-white dark:bg-green-500">
              Medium
            </span>
          </div>
        </div>

        {onEditToggleChange && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground" aria-hidden="true">
                <LockIcon />
              </span>
              <label className="flex flex-1 cursor-pointer items-center justify-between gap-4">
                <span className="font-semibold text-foreground">Allow me to edit allocation</span>
                <div className="relative h-6 w-12 shrink-0">
                  <input
                    type="checkbox"
                    checked={editAllocationEnabled}
                    onChange={(e) => onEditToggleChange(e.target.checked)}
                    className="peer sr-only"
                    role="switch"
                  />
                  <span className="absolute inset-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-blue-500 dark:bg-slate-600 peer-checked:dark:bg-blue-600" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-6 dark:bg-slate-100" />
                </div>
              </label>
            </div>
            <p className="m-0 text-sm text-muted-foreground">
              Enable to customize recommended allocations and add investments
            </p>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

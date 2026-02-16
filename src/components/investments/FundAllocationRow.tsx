import { motion } from "framer-motion";
import type { Fund, Allocation } from "../../types/investment";

interface FundAllocationRowProps {
  fund: Fund;
  allocation: Allocation;
  disabled?: boolean;
  onAllocationChange: (percentage: number) => void;
  onRemove?: () => void;
}

const getAssetClassShort = (ac: string): string => {
  if (ac.includes("Large") || ac.includes("Mid") || ac.includes("Small") || ac.includes("International")) return "Equity";
  if (ac.includes("Bond")) return "Fixed Income";
  if (ac.includes("Real Estate")) return "Real Estate";
  if (ac.includes("Cash")) return "Cash";
  if (ac.includes("Target")) return "Target Date";
  return ac;
};

function getRiskBarColor(risk: number): string {
  if (risk <= 3) return "var(--enroll-accent)";
  if (risk <= 5) return "var(--enroll-brand)";
  if (risk <= 7) return "var(--color-warning)";
  return "var(--color-danger)";
}

export const FundAllocationRow = ({
  fund,
  allocation,
  disabled = false,
  onAllocationChange,
  onRemove,
}: FundAllocationRowProps) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) onAllocationChange(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onAllocationChange(Math.max(0, Math.min(100, value)));
    } else if (e.target.value === "") {
      onAllocationChange(0);
    }
  };

  const formatPercentage = (value: number) => value.toFixed(1);
  const riskColor = getRiskBarColor(fund.riskLevel);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="p-4 rounded-xl"
      style={{
        background: "var(--enroll-soft-bg)",
        border: "1px solid var(--enroll-card-border)",
      }}
    >
      {/* Fund info row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold truncate" style={{ color: "var(--enroll-text-primary)" }}>
              {fund.name}
            </h4>
            <span
              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
              style={{ background: "rgb(var(--enroll-brand-rgb) / 0.08)", color: "var(--enroll-brand)" }}
            >
              {fund.ticker}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px]" style={{ color: "var(--enroll-text-muted)" }}>
              {getAssetClassShort(fund.assetClass)}
            </span>
            <span className="text-[11px]" style={{ color: "var(--enroll-text-muted)" }}>
              Exp: {fund.expenseRatio.toFixed(2)}%
            </span>
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--enroll-text-muted)" }}>
              Risk:
              <span className="inline-flex gap-0.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <span
                    key={i}
                    className="w-1 h-2.5 rounded-sm"
                    style={{
                      background: i < fund.riskLevel ? riskColor : "var(--enroll-card-border)",
                      opacity: i < fund.riskLevel ? 1 : 0.4,
                    }}
                  />
                ))}
              </span>
            </span>
          </div>
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-md transition-colors hover:opacity-80"
            style={{ color: "var(--enroll-text-muted)" }}
            aria-label={`Remove ${fund.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Slider + input */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={allocation.percentage}
            onChange={handleSliderChange}
            disabled={disabled}
            aria-label={`Allocation for ${fund.name}`}
            className="fund-row-slider"
            style={{
              "--slider-pct": `${allocation.percentage}%`,
              "--slider-color": "var(--enroll-brand)",
            } as React.CSSProperties}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            name={`allocation-${fund.id}`}
            value={allocation.percentage > 0 ? formatPercentage(allocation.percentage) : ""}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="0.1"
            disabled={disabled}
            placeholder="0"
            className="w-16 text-right text-sm font-semibold py-1.5 px-2 rounded-lg outline-none transition-colors"
            style={{
              background: "var(--enroll-card-bg)",
              border: "1px solid var(--enroll-card-border)",
              color: "var(--enroll-text-primary)",
            }}
            aria-label={`Allocation for ${fund.name}`}
          />
          <span className="text-xs font-semibold" style={{ color: "var(--enroll-text-muted)" }}>%</span>
        </div>
      </div>
    </motion.div>
  );
};

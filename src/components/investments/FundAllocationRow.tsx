import { Input } from "../ui/Input";
import type { Fund, Allocation } from "../../types/investment";

interface FundAllocationRowProps {
  fund: Fund;
  allocation: Allocation;
  disabled?: boolean;
  onAllocationChange: (percentage: number) => void;
  /** Optional remove handler - shows X button when provided */
  onRemove?: () => void;
}

/**
 * FundAllocationRow - Displays fund info with allocation slider and input
 */
/** Map asset class to short label for Figma format */
const getAssetClassShort = (ac: string): string => {
  if (ac.includes("Large") || ac.includes("Mid") || ac.includes("Small") || ac.includes("International")) return "Equity";
  if (ac.includes("Bond")) return "Fixed Income";
  if (ac.includes("Real Estate")) return "Real Estate";
  if (ac.includes("Cash")) return "Cash";
  if (ac.includes("Target")) return "Target Date";
  return ac;
};

export const FundAllocationRow = ({
  fund,
  allocation,
  disabled = false,
  onAllocationChange,
  onRemove,
}: FundAllocationRowProps) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onAllocationChange(value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onAllocationChange(Math.max(0, Math.min(100, value)));
    } else if (e.target.value === "") {
      onAllocationChange(0);
    }
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(1);
  };

  return (
    <div className="fund-allocation-row">
      <div className="fund-allocation-row__info">
        <div className="fund-allocation-row__header">
          <h4 className="fund-allocation-row__name">{fund.name}</h4>
          <span className="fund-allocation-row__ticker-pill">{fund.ticker}</span>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="fund-allocation-row__remove fund-allocation-row__remove--mobile"
              aria-label={`Remove ${fund.name}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <div className="fund-allocation-row__details fund-allocation-row__details--compact">
          <span className="fund-allocation-row__detail-inline">
            {getAssetClassShort(fund.assetClass)} · $ Exp: {fund.expenseRatio.toFixed(2)}% · Risk: {fund.riskLevel}/10
          </span>
        </div>
      </div>
      <div className="fund-allocation-row__controls">
        <div className="fund-allocation-row__slider-wrapper">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={allocation.percentage}
            onChange={handleSliderChange}
            disabled={disabled}
            className="fund-allocation-row__slider"
            aria-label={`Allocation for ${fund.name}`}
            style={
              {
                "--slider-pct": `${allocation.percentage}%`,
              } as React.CSSProperties
            }
          />
        </div>
        <div className="fund-allocation-row__input-row">
          <div className="fund-allocation-row__input-wrapper">
            <Input
              label="Allocation %"
              type="number"
              name={`allocation-${fund.id}`}
              value={allocation.percentage > 0 ? formatPercentage(allocation.percentage) : ""}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              disabled={disabled}
              suffix="%"
              className="fund-allocation-row__input"
            />
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="fund-allocation-row__remove fund-allocation-row__remove--desktop"
              aria-label={`Remove ${fund.name}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

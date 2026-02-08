import type { Allocation } from "../../types/investment";
import { getFundById } from "../../data/mockFunds";

interface AllocationChartProps {
  allocations: Allocation[];
  /** Center text (e.g. "TOTAL" or "Allocated") */
  centerLabel?: string;
  /** Center value (e.g. "100") - defaults to total % */
  centerValue?: string;
  /** Show "Valid Allocation" badge below chart */
  showValidBadge?: boolean;
  isValid?: boolean;
}

/**
 * AllocationChart - Donut/pie chart component showing allocation breakdown
 */
export const AllocationChart = ({
  allocations,
  centerLabel = "Allocated",
  centerValue,
  showValidBadge = false,
  isValid = true,
}: AllocationChartProps) => {
  // Filter out zero allocations and sort by percentage
  const activeAllocations = allocations
    .filter((a) => a.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  if (activeAllocations.length === 0) {
    return (
      <div className="allocation-chart">
        <div className="allocation-chart__container">
          <svg viewBox="0 0 200 200" className="allocation-chart__svg">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="40"
              className="allocation-chart__background"
            />
          </svg>
          <div className="allocation-chart__center">
            <span className="allocation-chart__center-value">0%</span>
            <span className="allocation-chart__center-label">{centerLabel}</span>
          </div>
        </div>
        <div className="allocation-chart__legend">
          <p className="allocation-chart__empty">No funds allocated</p>
        </div>
      </div>
    );
  }

  // Calculate angles for donut chart
  let currentAngle = -90; // Start at top
  const total = activeAllocations.reduce((sum, a) => sum + a.percentage, 0);
  const displayValue = centerValue ?? total.toFixed(0);

  // Color palette - theme-aware via CSS variables
  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
    "var(--chart-9)",
    "var(--chart-10)",
  ];

  return (
    <div className="allocation-chart">
      <div className="allocation-chart__container">
        <svg viewBox="0 0 200 200" className="allocation-chart__svg">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="40"
            className="allocation-chart__background"
          />
          {activeAllocations.map((allocation, index) => {
            const fund = getFundById(allocation.fundId);
            if (!fund) return null;
            
            const percentage = (allocation.percentage / total) * 100;
            const angle = (percentage / 100) * 360;
            const largeArc = percentage > 50 ? 1 : 0;
            
            const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const pathData = [
              `M ${x1} ${y1}`,
              `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
            ].join(" ");

            const color = chartColors[index % chartColors.length];
            const prevAngle = currentAngle;
            currentAngle += angle;

            return (
              <path
                key={allocation.fundId}
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="40"
                className="allocation-chart__segment"
                data-fund-id={allocation.fundId}
              />
            );
          })}
        </svg>
        <div className="allocation-chart__center">
          <span className="allocation-chart__center-value">{displayValue}%</span>
          <span className="allocation-chart__center-label">{centerLabel}</span>
        </div>
      </div>
      {showValidBadge && (
        <div
          className={`allocation-chart__valid-badge ${
            isValid ? "allocation-chart__valid-badge--valid" : "allocation-chart__valid-badge--invalid"
          }`}
        >
          {isValid ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Valid Allocation
            </>
          ) : (
            "Invalid Allocation"
          )}
        </div>
      )}
      <div className="allocation-chart__legend">
        {activeAllocations.map((allocation, index) => {
          const fund = getFundById(allocation.fundId);
          if (!fund) return null;
          const color = chartColors[index % chartColors.length];
          
          return (
            <div key={allocation.fundId} className="allocation-chart__legend-item">
              <span
                className="allocation-chart__legend-color"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className="allocation-chart__legend-label">{fund.name}</span>
              <span className="allocation-chart__legend-value">{allocation.percentage.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

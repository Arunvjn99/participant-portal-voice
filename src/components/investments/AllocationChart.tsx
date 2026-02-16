import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Allocation } from "../../types/investment";
import { getFundById } from "../../data/mockFunds";

interface AllocationChartProps {
  allocations: Allocation[];
  centerLabel?: string;
  centerValue?: string;
  showValidBadge?: boolean;
  isValid?: boolean;
}

const CHART_COLORS = [
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

function useAnimatedValue(target: number, duration = 400): number {
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number>(0);
  const startRef = useRef(current);
  const startTimeRef = useRef(0);

  useEffect(() => {
    startRef.current = current;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(startRef.current + (target - startRef.current) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

export const AllocationChart = ({
  allocations,
  centerLabel = "Allocated",
  centerValue,
  showValidBadge = false,
  isValid = true,
}: AllocationChartProps) => {
  const [tooltip, setTooltip] = useState<{
    fundName: string;
    percentage: number;
    x: number;
    y: number;
  } | null>(null);

  const activeAllocations = allocations
    .filter((a) => a.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const total = activeAllocations.reduce((sum, a) => sum + a.percentage, 0);
  const displayValue = centerValue ?? total.toFixed(0);
  const animatedTotal = useAnimatedValue(parseFloat(displayValue));

  const handleSegmentHover = (
    e: React.MouseEvent<SVGPathElement>,
    fundName: string,
    percentage: number
  ) => {
    const container = e.currentTarget.closest("[data-chart-container]");
    if (container) {
      const rect = (container as HTMLElement).getBoundingClientRect();
      setTooltip({
        fundName,
        percentage,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  if (activeAllocations.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-[180px] h-[180px]" data-chart-container>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="var(--enroll-card-border)" strokeWidth="32" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: "var(--enroll-text-primary)" }}>0%</span>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>{centerLabel}</span>
          </div>
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--enroll-text-muted)" }}>No funds allocated</p>
      </div>
    );
  }

  let currentAngle = -90;

  return (
    <div className="flex flex-col items-center">
      {/* Donut */}
      <div className="relative w-[180px] h-[180px]" data-chart-container>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--enroll-card-border)" strokeWidth="32" opacity="0.3" />
          {activeAllocations.map((allocation, index) => {
            const fund = getFundById(allocation.fundId);
            if (!fund) return null;

            const pct = (allocation.percentage / total) * 100;
            const angle = (pct / 100) * 360;
            const largeArc = pct > 50 ? 1 : 0;

            const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);

            const pathData = `M ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2}`;
            const color = CHART_COLORS[index % CHART_COLORS.length];
            currentAngle += angle;

            return (
              <path
                key={allocation.fundId}
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="32"
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300"
                style={{ filter: tooltip?.fundName === fund.name ? "brightness(1.15)" : "none" }}
                onMouseEnter={(e) => handleSegmentHover(e, fund.name, pct)}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: "var(--enroll-text-primary)" }}>
            {Math.round(animatedTotal)}%
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>
            {centerLabel}
          </span>
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute z-10 rounded-lg px-3 py-2 text-sm"
              style={{
                left: tooltip.x + 12,
                top: tooltip.y - 8,
                background: "var(--enroll-card-bg)",
                border: "1px solid var(--enroll-card-border)",
                boxShadow: "var(--enroll-elevation-2)",
              }}
            >
              <div className="font-medium" style={{ color: "var(--enroll-text-primary)" }}>{tooltip.fundName}</div>
              <div className="font-semibold" style={{ color: "var(--enroll-brand)" }}>{tooltip.percentage.toFixed(1)}%</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Valid badge */}
      {showValidBadge && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: isValid ? "rgb(var(--enroll-accent-rgb) / 0.08)" : "rgb(var(--color-danger-rgb) / 0.08)",
            color: isValid ? "var(--enroll-accent)" : "var(--color-danger)",
            border: isValid ? "1px solid rgb(var(--enroll-accent-rgb) / 0.2)" : "1px solid rgb(var(--color-danger-rgb) / 0.2)",
          }}
        >
          {isValid ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Valid Allocation
            </>
          ) : "Incomplete"}
        </motion.span>
      )}

      {/* Legend */}
      <div className="mt-4 w-full space-y-1.5">
        {activeAllocations.map((allocation, index) => {
          const fund = getFundById(allocation.fundId);
          if (!fund) return null;
          const color = CHART_COLORS[index % CHART_COLORS.length];
          return (
            <div key={allocation.fundId} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs truncate" style={{ color: "var(--enroll-text-secondary)" }}>{fund.name}</span>
              </div>
              <span className="text-xs font-semibold shrink-0" style={{ color: "var(--enroll-text-primary)" }}>
                {allocation.percentage.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

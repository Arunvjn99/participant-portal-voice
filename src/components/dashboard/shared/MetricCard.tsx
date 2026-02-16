import { memo } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: { direction: "up" | "down" | "neutral"; label: string };
  accent?: boolean;
  className?: string;
}

/**
 * Reusable elevated metric display card.
 * Uses global design tokens — no hardcoded colors.
 */
export const MetricCard = memo(function MetricCard({
  label,
  value,
  trend,
  accent,
  className = "",
}: MetricCardProps) {
  return (
    <div
      className={`rounded-xl p-3 ${className}`}
      style={{
        background: "var(--color-bg-soft, var(--enroll-soft-bg))",
        border: "1px solid var(--enroll-card-border)",
      }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: "var(--enroll-text-muted)" }}
      >
        {label}
      </p>
      <p
        className="text-lg font-bold mt-1"
        style={{
          color: accent
            ? "var(--enroll-brand)"
            : "var(--enroll-text-primary)",
        }}
      >
        {value}
      </p>
      {trend && (
        <p
          className="text-[10px] font-semibold mt-0.5"
          style={{
            color:
              trend.direction === "up"
                ? "var(--color-success)"
                : trend.direction === "down"
                  ? "var(--color-danger)"
                  : "var(--enroll-text-muted)",
          }}
        >
          {trend.direction === "up"
            ? "↑"
            : trend.direction === "down"
              ? "↓"
              : "→"}{" "}
          {trend.label}
        </p>
      )}
    </div>
  );
});

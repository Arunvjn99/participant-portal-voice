import { memo } from "react";
import { motion } from "framer-motion";

interface ConfidenceGaugeProps {
  value: number;
  size?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

/**
 * Animated radial confidence gauge.
 * Value 0-100 mapped to a smooth arc animation.
 */
export const ConfidenceGauge = memo(function ConfidenceGauge({
  value,
  size = 120,
  label,
  sublabel,
  color,
}: ConfidenceGaugeProps) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75;
  const arcOffset = arcLength * (1 - Math.min(100, Math.max(0, value)) / 100);

  const gaugeColor =
    color ??
    (value >= 70
      ? "var(--enroll-accent)"
      : value >= 40
        ? "var(--color-warning)"
        : "var(--color-danger)");

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(135deg)" }}>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--enroll-card-border)"
          strokeWidth="8"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={gaugeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: arcOffset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: size * 0.06 }}>
        <span
          className="font-bold"
          style={{
            fontSize: size * 0.22,
            color: "var(--enroll-text-primary)",
          }}
        >
          {Math.round(value)}%
        </span>
        {label && (
          <span
            className="font-semibold"
            style={{
              fontSize: Math.max(8, size * 0.08),
              color: "var(--enroll-text-muted)",
            }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span
            className="font-medium"
            style={{
              fontSize: Math.max(7, size * 0.07),
              color: gaugeColor,
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
});

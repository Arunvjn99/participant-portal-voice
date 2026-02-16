import { memo } from "react";
import { motion } from "framer-motion";

interface InsightCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  impact?: string;
  actionLabel?: string;
  onAction?: () => void;
  index?: number;
}

/**
 * AI Insight card with staggered entrance, hover glow, and optional action.
 */
export const InsightCard = memo(function InsightCard({
  icon,
  title,
  description,
  impact,
  actionLabel,
  onAction,
  index = 0,
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.08 * index, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ boxShadow: "0 0 20px rgb(var(--enroll-brand-rgb) / 0.08)" }}
      className="p-4 rounded-xl transition-all"
      style={{
        background: "var(--color-bg-surface, var(--enroll-card-bg))",
        border: "1px solid var(--enroll-card-border)",
      }}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: "rgb(var(--enroll-brand-rgb) / 0.08)",
              color: "var(--enroll-brand)",
            }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-bold"
            style={{ color: "var(--enroll-text-primary)" }}
          >
            {title}
          </p>
          <p
            className="text-[11px] mt-0.5 leading-relaxed"
            style={{ color: "var(--enroll-text-secondary)" }}
          >
            {description}
          </p>
          {impact && (
            <span
              className="inline-block text-[10px] font-semibold mt-1.5 px-2 py-0.5 rounded-full"
              style={{
                background: "rgb(var(--enroll-accent-rgb) / 0.08)",
                color: "var(--enroll-accent)",
              }}
            >
              {impact}
            </span>
          )}
        </div>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 w-full text-[11px] font-semibold py-1.5 rounded-lg border-none cursor-pointer transition-colors"
          style={{
            background: "rgb(var(--enroll-brand-rgb) / 0.06)",
            color: "var(--enroll-brand)",
          }}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
});

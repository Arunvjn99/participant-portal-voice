import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CARD_STYLE, fmtCurrency } from "../../core/types";
import type { ModuleProps } from "../../core/types";

const TX_ICON: Record<string, string> = {
  contribution: "💰",
  "employer-match": "🤝",
  fee: "📋",
  dividend: "📈",
  "loan-repayment": "🔄",
};

const fmtDate = (d: string) => {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * ActivityFeed — Recent transactions with animated entrance and color-coded amounts.
 */
export const ActivityFeed = memo(function ActivityFeed({ data }: ModuleProps) {
  const navigate = useNavigate();
  const transactions = data.transactions.slice(0, 5);

  if (transactions.length === 0) return null;

  return (
    <div className="p-6" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--enroll-text-muted)" }}
        >
          Recent Activity
        </p>
        <button
          type="button"
          onClick={() => navigate("/transactions")}
          className="text-[10px] font-semibold border-none bg-transparent cursor-pointer p-0"
          style={{ color: "var(--enroll-brand)" }}
        >
          View all →
        </button>
      </div>

      <div className="space-y-2">
        {transactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.04 * i }}
            className="flex items-center gap-3 p-2.5 rounded-xl"
            style={{
              background: "var(--color-bg-soft, var(--enroll-soft-bg))",
              border: "1px solid var(--enroll-card-border)",
            }}
          >
            <span className="text-base shrink-0">{TX_ICON[tx.type] ?? "💰"}</span>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "var(--enroll-text-primary)" }}
              >
                {tx.description}
              </p>
              <p className="text-[10px]" style={{ color: "var(--enroll-text-muted)" }}>
                {fmtDate(tx.date)}
              </p>
            </div>
            <span
              className="text-xs font-bold shrink-0"
              style={{
                color: tx.amount >= 0 ? "var(--enroll-accent)" : "var(--color-danger)",
              }}
            >
              {tx.amount >= 0 ? "+" : ""}
              {fmtCurrency(Math.abs(tx.amount))}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

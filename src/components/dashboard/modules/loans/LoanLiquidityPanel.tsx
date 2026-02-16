import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedNumber } from "../../shared/AnimatedNumber";
import { CARD_STYLE, fmtCurrency } from "../../core/types";
import type { ModuleProps } from "../../core/types";

/**
 * LoanLiquidityPanel — Borrowing power, risk state, impact warning, repayment info.
 */
export const LoanLiquidityPanel = memo(function LoanLiquidityPanel({ engine }: ModuleProps) {
  const navigate = useNavigate();

  const statusConfig = {
    healthy: { label: "Healthy Liquidity", color: "var(--enroll-accent)", bgToken: "enroll-accent-rgb" },
    warning: { label: "Moderate", color: "var(--color-warning)", bgToken: "color-warning-rgb" },
    critical: { label: "Low Liquidity", color: "var(--color-danger)", bgToken: "color-danger-rgb" },
  };

  const status = statusConfig[engine.liquidityStatus];
  const monthlyRepayment = engine.maxLoanAmount > 0 ? engine.maxLoanAmount / 60 : 0;

  return (
    <div className="p-5" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--enroll-text-muted)" }}
        >
          Loan & Liquidity
        </p>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: `rgb(var(--${status.bgToken}) / 0.08)`,
            color: status.color,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Max borrowable */}
      <div className="mb-3">
        <p className="text-[10px] font-semibold" style={{ color: "var(--enroll-text-muted)" }}>
          Max Borrowable
        </p>
        <AnimatedNumber
          value={engine.maxLoanAmount}
          format="currency"
          duration={600}
          className="text-xl font-bold"
          style={{ color: "var(--enroll-text-primary)" }}
        />
      </div>

      {/* Repayment breakdown */}
      <div
        className="p-3 rounded-xl space-y-1.5 mb-3"
        style={{
          background: "var(--color-bg-soft, var(--enroll-soft-bg))",
          border: "1px solid var(--enroll-card-border)",
        }}
      >
        {[
          { label: "Estimated Monthly", value: fmtCurrency(monthlyRepayment) },
          { label: "Repayment Period", value: "60 months" },
          { label: "Source", value: "Vested Balance" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--enroll-text-muted)" }}>{label}</span>
            <span className="text-[10px] font-semibold" style={{ color: "var(--enroll-text-primary)" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Impact warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-start gap-2 p-2.5 rounded-xl"
        style={{
          background: "rgb(var(--color-warning-rgb) / 0.05)",
          border: "1px solid rgb(var(--color-warning-rgb) / 0.1)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" className="shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-[10px] leading-relaxed" style={{ color: "var(--enroll-text-secondary)" }}>
          Borrowing reduces your invested balance and future growth potential. Consider other options first.
        </p>
      </motion.div>

      <button
        type="button"
        onClick={() => navigate("/transactions/applications/loan")}
        className="mt-3 w-full text-[11px] font-semibold py-2 rounded-xl border-none cursor-pointer transition-colors"
        style={{
          background: "rgb(var(--enroll-brand-rgb) / 0.06)",
          color: "var(--enroll-brand)",
        }}
      >
        Explore Loan Options
      </button>
    </div>
  );
});

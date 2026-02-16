import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AllocationChart } from "../../../investments/AllocationChart";
import { CARD_STYLE } from "../../core/types";
import type { ModuleProps } from "../../core/types";

/**
 * InvestmentHealth — Allocation donut, risk alignment, diversification score, hover insights.
 */
export const InvestmentHealth = memo(function InvestmentHealth({ engine, data }: ModuleProps) {
  const navigate = useNavigate();

  const allocationForChart = useMemo(
    () => data.investmentAllocations.map((r) => ({ fundId: r.fundId, percentage: r.allocationPct })),
    [data.investmentAllocations],
  );

  if (data.investmentAllocations.length === 0) return null;

  const diversPct = engine.diversificationScore;
  const riskPct = Math.min(100, engine.riskAlignment);

  return (
    <div className="p-5" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--enroll-text-muted)" }}
        >
          Investment Health
        </p>
        <button
          type="button"
          onClick={() => navigate("/enrollment/investments")}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full border-none cursor-pointer"
          style={{
            background: "rgb(var(--enroll-brand-rgb) / 0.06)",
            color: "var(--enroll-brand)",
          }}
        >
          Manage
        </button>
      </div>

      {/* Allocation chart */}
      <AllocationChart allocations={allocationForChart} centerLabel="Allocated" showValidBadge={false} />

      {/* Risk alignment bar */}
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold" style={{ color: "var(--enroll-text-muted)" }}>
              Risk Alignment
            </span>
            <span className="text-[10px] font-bold" style={{ color: "var(--enroll-text-primary)" }}>
              {riskPct}%
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: "var(--enroll-card-border)" }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${riskPct}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: "var(--enroll-brand)" }}
            />
          </div>
        </div>

        {/* Diversification score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold" style={{ color: "var(--enroll-text-muted)" }}>
              Diversification
            </span>
            <span className="text-[10px] font-bold" style={{ color: "var(--enroll-text-primary)" }}>
              {diversPct}%
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: "var(--enroll-card-border)" }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${diversPct}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
              style={{ background: "var(--enroll-accent)" }}
            />
          </div>
        </div>
      </div>

      {/* AI insight */}
      {data.allocationDescription && (
        <div
          className="flex items-start gap-2 mt-4 p-3 rounded-xl"
          style={{
            background: "rgb(var(--enroll-brand-rgb) / 0.04)",
            border: "1px solid rgb(var(--enroll-brand-rgb) / 0.08)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--enroll-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
          </svg>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--enroll-text-secondary)" }}>
            {data.allocationDescription}
          </p>
        </div>
      )}
    </div>
  );
});

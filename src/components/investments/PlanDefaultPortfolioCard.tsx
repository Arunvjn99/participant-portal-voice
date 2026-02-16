import { motion } from "framer-motion";
import { useInvestment } from "../../context/InvestmentContext";

const cardStyle: React.CSSProperties = {
  background: "var(--enroll-card-bg)",
  border: "1px solid var(--enroll-card-border)",
  borderRadius: "var(--enroll-card-radius)",
  boxShadow: "var(--enroll-elevation-2)",
};

function formatRiskLabel(risk: number): string {
  if (risk < 3) return "Conservative";
  if (risk < 5) return "Moderate";
  if (risk < 7) return "Growth";
  return "Aggressive";
}

function getRiskColor(risk: number): string {
  if (risk < 3) return "var(--enroll-accent)";
  if (risk < 5) return "var(--enroll-brand)";
  if (risk < 7) return "var(--color-warning)";
  return "var(--color-danger)";
}

export const PlanDefaultPortfolioCard = () => {
  const { weightedSummary } = useInvestment();
  const { expectedReturn, riskLevel } = weightedSummary;
  const riskLabel = formatRiskLabel(riskLevel);
  const riskColor = getRiskColor(riskLevel);
  const riskPct = Math.min(100, (riskLevel / 10) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6"
      style={cardStyle}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgb(var(--enroll-brand-rgb) / 0.1)", color: "var(--enroll-brand)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="6" height="6" rx="1.5" fill="currentColor" />
            <rect x="14" y="4" width="6" height="6" rx="1.5" fill="currentColor" />
            <rect x="4" y="14" width="6" height="6" rx="1.5" fill="currentColor" />
            <rect x="14" y="14" width="6" height="6" rx="1.5" fill="currentColor" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold" style={{ color: "var(--enroll-text-primary)" }}>
            Plan Default Portfolio
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full"
              style={{
                background: `rgb(var(--enroll-brand-rgb) / 0.08)`,
                color: "var(--enroll-brand)",
              }}
            >
              {riskLabel} Investor
            </span>
            <span className="text-xs" style={{ color: "var(--enroll-text-muted)" }}>
              88% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div
        className="flex gap-3 rounded-xl p-4 mt-4"
        style={{
          background: "rgb(var(--enroll-brand-rgb) / 0.04)",
          border: "1px solid rgb(var(--enroll-brand-rgb) / 0.08)",
        }}
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: "var(--enroll-brand)", color: "white" }}
        >
          i
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--enroll-text-secondary)" }}>
          Your balanced approach suggests a moderate portfolio. A 60/40 stocks-to-bonds ratio provides growth potential while maintaining stability for 10+ year horizons.
        </p>
      </div>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-3 gap-4">
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--enroll-soft-bg)", border: "1px solid var(--enroll-card-border)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>
            Expected Return
          </p>
          <p className="text-base font-bold mt-0.5" style={{ color: "var(--enroll-accent)" }}>
            {expectedReturn > 0 ? `${expectedReturn.toFixed(1)}%` : "6-8%"}
          </p>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--enroll-soft-bg)", border: "1px solid var(--enroll-card-border)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>
            Volatility
          </p>
          <p className="text-base font-bold mt-0.5" style={{ color: "var(--enroll-text-primary)" }}>
            Moderate
          </p>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--enroll-soft-bg)", border: "1px solid var(--enroll-card-border)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>
            Risk Level
          </p>
          {/* Animated risk bar */}
          <div className="mt-1.5">
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "var(--enroll-card-border)" }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${riskPct}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                style={{ background: riskColor }}
              />
            </div>
            <p className="text-[10px] font-semibold mt-1" style={{ color: riskColor }}>
              {riskLabel}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

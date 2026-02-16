import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedNumber } from "../../shared/AnimatedNumber";
import { CARD_STYLE, fmtCurrency } from "../../core/types";
import type { ModuleProps } from "../../core/types";

/**
 * ContributionOptimizer — Free Money Alert, match visualization,
 * before/after impact preview, and optimization guidance.
 */
export const ContributionOptimizer = memo(function ContributionOptimizer({
  engine,
}: ModuleProps) {
  const navigate = useNavigate();
  const hasMissedMatch = engine.matchGap > 0;

  const currentAnnual = (engine.contributionRate / 100) * engine.salary;
  const matchedAnnual = ((engine.contributionRate + engine.matchGap) / 100) * engine.salary;
  const projectedGainPerYear = engine.missingMatch;

  /* Visual: contribution bar vs match threshold */
  const barPct = Math.min(100, (engine.contributionRate / (engine.employerMatch.cap * 2)) * 100);
  const matchZonePct = (engine.employerMatch.cap / (engine.employerMatch.cap * 2)) * 100;

  return (
    <div className="p-6" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--enroll-text-muted)" }}
        >
          Contribution Optimizer
        </p>
        <AnimatePresence>
          {hasMissedMatch && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{
                background: "rgb(var(--color-warning-rgb) / 0.1)",
                color: "var(--color-warning)",
              }}
            >
              Free Money Alert
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Contribution bar visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold" style={{ color: "var(--enroll-text-primary)" }}>
            Your Rate: {engine.contributionRate}%
          </span>
          <span className="text-[10px] font-semibold" style={{ color: "var(--enroll-text-muted)" }}>
            Match Zone: {engine.employerMatch.cap}%
          </span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "var(--enroll-card-border)" }}>
          {/* Match zone background */}
          <div
            className="absolute top-0 left-0 h-full rounded-full opacity-20"
            style={{
              width: `${matchZonePct}%`,
              background: "var(--enroll-accent)",
            }}
          />
          {/* Current contribution bar */}
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: hasMissedMatch
                ? "var(--color-warning)"
                : "var(--enroll-accent)",
            }}
          />
          {/* Match zone marker */}
          <div
            className="absolute top-0 h-full w-0.5"
            style={{
              left: `${matchZonePct}%`,
              background: "var(--enroll-accent)",
              opacity: 0.6,
            }}
          />
        </div>
      </div>

      {/* Before / After */}
      {hasMissedMatch && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <div
            className="p-3 rounded-xl"
            style={{
              background: "var(--color-bg-soft, var(--enroll-soft-bg))",
              border: "1px solid var(--enroll-card-border)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>
              Current
            </p>
            <p className="text-sm font-bold mt-0.5" style={{ color: "var(--enroll-text-primary)" }}>
              {fmtCurrency(currentAnnual)}/yr
            </p>
          </div>
          <div
            className="p-3 rounded-xl"
            style={{
              background: "rgb(var(--enroll-accent-rgb) / 0.04)",
              border: "1px solid rgb(var(--enroll-accent-rgb) / 0.15)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--enroll-accent)" }}>
              With Full Match
            </p>
            <p className="text-sm font-bold mt-0.5" style={{ color: "var(--enroll-accent)" }}>
              {fmtCurrency(matchedAnnual)}/yr
            </p>
          </div>
        </motion.div>
      )}

      {/* Impact summary */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl"
        style={{
          background: hasMissedMatch
            ? "rgb(var(--color-warning-rgb) / 0.06)"
            : "rgb(var(--enroll-accent-rgb) / 0.04)",
          border: `1px solid ${hasMissedMatch ? "rgb(var(--color-warning-rgb) / 0.12)" : "rgb(var(--enroll-accent-rgb) / 0.1)"}`,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={hasMissedMatch ? "var(--color-warning)" : "var(--enroll-accent)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          {hasMissedMatch ? (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </>
          ) : (
            <>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </>
          )}
        </svg>
        <div className="flex-1">
          <p className="text-xs font-semibold" style={{ color: "var(--enroll-text-primary)" }}>
            {hasMissedMatch
              ? `You're leaving ${fmtCurrency(projectedGainPerYear)}/year on the table`
              : "You're capturing your full employer match"}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--enroll-text-muted)" }}>
            {hasMissedMatch
              ? `Increase by ${engine.matchGap}% to unlock free employer contributions.`
              : `Your ${engine.contributionRate}% rate exceeds the ${engine.employerMatch.cap}% match threshold.`}
          </p>
        </div>
      </div>

      {hasMissedMatch && (
        <button
          type="button"
          onClick={() => navigate("/enrollment/contribution")}
          className="mt-4 w-full text-xs font-semibold py-2 rounded-xl border-none cursor-pointer transition-all"
          style={{
            background: "var(--enroll-brand)",
            color: "white",
            boxShadow: "0 4px 12px rgb(var(--enroll-brand-rgb) / 0.15)",
          }}
        >
          Optimize Contribution
        </button>
      )}
    </div>
  );
});

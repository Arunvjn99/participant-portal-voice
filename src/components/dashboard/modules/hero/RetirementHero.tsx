import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ConfidenceGauge } from "../../shared/ConfidenceGauge";
import { AnimatedNumber } from "../../shared/AnimatedNumber";
import { CARD_STYLE, fmtCurrency } from "../../core/types";
import type { ModuleProps } from "../../core/types";

/**
 * RetirementHero — Premium full-width hero.
 * Animated progress arc, projected balance, confidence gauge,
 * life stage badge, dynamic inspirational messaging.
 */
export const RetirementHero = memo(function RetirementHero({ engine }: ModuleProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-8 relative overflow-hidden"
      style={{
        ...CARD_STYLE,
        background:
          "linear-gradient(135deg, var(--color-bg-surface, var(--enroll-card-bg)) 0%, rgb(var(--enroll-brand-rgb) / 0.05) 50%, rgb(var(--enroll-accent-rgb) / 0.03) 100%)",
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute top-0 right-0 w-[320px] h-[320px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgb(var(--enroll-brand-rgb) / 0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        {/* Confidence gauge */}
        <div className="shrink-0 mx-auto md:mx-0">
          <ConfidenceGauge
            value={engine.readinessScore}
            size={128}
            label="on track"
            sublabel={engine.lifeStageLabel}
          />
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--enroll-text-muted)" }}
            >
              Your Retirement Progress
            </p>
            <span
              className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "rgb(var(--enroll-brand-rgb) / 0.08)",
                color: "var(--enroll-brand)",
              }}
            >
              {engine.lifeStageLabel}
            </span>
          </div>

          <h2
            className="text-xl md:text-2xl font-bold leading-snug"
            style={{ color: "var(--enroll-text-primary)" }}
          >
            {engine.heroMessage}
          </h2>

          <p
            className="text-sm mt-1.5 mb-4"
            style={{ color: "var(--enroll-text-secondary)" }}
          >
            Projected at {engine.retirementAge}:{" "}
            <AnimatedNumber
              value={engine.projectedBalance}
              format="currency"
              duration={900}
              className="font-bold"
              style={{ color: "var(--enroll-brand)" }}
            />
          </p>

          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
            <div
              className="rounded-xl px-3 py-2"
              style={{
                background: "var(--color-bg-soft, var(--enroll-soft-bg))",
                border: "1px solid var(--enroll-card-border)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--enroll-text-muted)" }}
              >
                Balance
              </p>
              <AnimatedNumber
                value={engine.currentBalance}
                format="currency"
                duration={700}
                className="text-base font-bold"
                style={{ color: "var(--enroll-brand)" }}
              />
            </div>
            <div
              className="rounded-xl px-3 py-2"
              style={{
                background: "var(--color-bg-soft, var(--enroll-soft-bg))",
                border: "1px solid var(--enroll-card-border)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--enroll-text-muted)" }}
              >
                YTD Return
              </p>
              <p className="text-base font-bold" style={{ color: "var(--enroll-accent)" }}>
                +{engine.ytdReturn}%
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/enrollment/contribution")}
              className="text-xs font-semibold px-4 py-2 rounded-xl border-none cursor-pointer transition-all"
              style={{
                background: "var(--enroll-brand)",
                color: "white",
                boxShadow: "0 4px 12px rgb(var(--enroll-brand-rgb) / 0.2)",
              }}
            >
              Take Action
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

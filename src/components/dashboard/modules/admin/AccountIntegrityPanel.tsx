import { memo } from "react";
import { motion } from "framer-motion";
import { CARD_STYLE } from "../../core/types";
import type { ModuleProps } from "../../core/types";

/**
 * AccountIntegrityPanel — Onboarding progress, account health, badges.
 */
export const AccountIntegrityPanel = memo(function AccountIntegrityPanel({ engine, data }: ModuleProps) {
  const onboarding = data.onboardingProgress;
  if (!onboarding) return null;

  const pct = onboarding.percentComplete;
  const circumference = 2 * Math.PI * 32;

  return (
    <div className="p-5" style={CARD_STYLE}>
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-3"
        style={{ color: "var(--enroll-text-muted)" }}
      >
        Account Health
      </p>

      <div className="flex items-center gap-4">
        {/* Progress ring */}
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--enroll-card-border)" strokeWidth="6" />
            <motion.circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke="var(--enroll-brand)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color: "var(--enroll-text-primary)" }}>
              {pct}%
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: "var(--enroll-text-primary)" }}>
            {pct === 100 ? "All Set!" : `${100 - pct}% Remaining`}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--enroll-text-muted)" }}>
            {onboarding.message}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-3">
        {Array.from({ length: onboarding.badgesTotal }).map((_, i) => {
          const earned = i < onboarding.badgesCompleted;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * i }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
              style={{
                background: earned ? "rgb(var(--enroll-brand-rgb) / 0.1)" : "var(--color-bg-soft, var(--enroll-soft-bg))",
                border: `1px solid ${earned ? "rgb(var(--enroll-brand-rgb) / 0.2)" : "var(--enroll-card-border)"}`,
                color: earned ? "var(--enroll-brand)" : "var(--enroll-text-muted)",
              }}
            >
              {earned ? "★" : "○"}
            </motion.div>
          );
        })}
        <span className="text-[10px] font-semibold ml-1" style={{ color: "var(--enroll-text-muted)" }}>
          {onboarding.badgesCompleted}/{onboarding.badgesTotal}
        </span>
      </div>
    </div>
  );
});

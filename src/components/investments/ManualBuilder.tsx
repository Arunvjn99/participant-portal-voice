import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FundAllocationSection } from "./FundAllocationSection";
import { PlanDefaultPortfolioCard } from "./PlanDefaultPortfolioCard";
import { useInvestment } from "../../context/InvestmentContext";

type PersonalityKey = "conservative" | "balanced" | "growth" | "aggressive";

interface PersonalityProfile {
  label: string;
  desc: string;
  icon: string;
  allocations: Record<string, number>;
}

const PERSONALITY_PROFILES: Record<PersonalityKey, PersonalityProfile> = {
  conservative: {
    label: "Conservative",
    desc: "Stability-focused",
    icon: "🛡️",
    allocations: { "fund-7": 50, "fund-8": 20, "fund-1": 20, "fund-9": 10 },
  },
  balanced: {
    label: "Balanced",
    desc: "Growth + stability",
    icon: "⚖️",
    allocations: { "fund-1": 40, "fund-5": 20, "fund-7": 30, "fund-9": 10 },
  },
  growth: {
    label: "Growth",
    desc: "Higher returns",
    icon: "📈",
    allocations: { "fund-1": 45, "fund-3": 20, "fund-5": 25, "fund-7": 10 },
  },
  aggressive: {
    label: "Aggressive",
    desc: "Maximum growth",
    icon: "🚀",
    allocations: { "fund-1": 35, "fund-4": 25, "fund-6": 25, "fund-3": 15 },
  },
};

export const ManualBuilder = () => {
  const [activePersonality, setActivePersonality] = useState<PersonalityKey>("balanced");
  const { activeSources, updateSourceAllocation, getFundsForSource, addFundToSource } = useInvestment();

  const applyPersonality = useCallback((key: PersonalityKey) => {
    setActivePersonality(key);
    const profile = PERSONALITY_PROFILES[key];

    for (const source of activeSources) {
      const currentFunds = getFundsForSource(source);
      const targetFundIds = Object.keys(profile.allocations);

      for (const fundId of targetFundIds) {
        const exists = currentFunds.some((f) => f.fundId === fundId);
        if (!exists) {
          addFundToSource(source, fundId);
        }
      }

      for (const [fundId, pct] of Object.entries(profile.allocations)) {
        updateSourceAllocation(source, fundId, pct);
      }

      for (const fund of currentFunds) {
        if (!targetFundIds.includes(fund.fundId)) {
          updateSourceAllocation(source, fund.fundId, 0);
        }
      }
    }
  }, [activeSources, updateSourceAllocation, getFundsForSource, addFundToSource]);

  return (
    <div className="space-y-6">
      {/* Portfolio Personality Selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color: "var(--enroll-text-muted)" }}
        >
          Investment Style
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(PERSONALITY_PROFILES) as PersonalityKey[]).map((key) => {
            const profile = PERSONALITY_PROFILES[key];
            const isActive = activePersonality === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPersonality(key)}
                className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-all duration-200 text-center"
                style={{
                  background: isActive ? "rgb(var(--enroll-brand-rgb) / 0.08)" : "var(--enroll-card-bg)",
                  border: isActive ? "1.5px solid var(--enroll-brand)" : "1px solid var(--enroll-card-border)",
                  boxShadow: isActive ? "var(--enroll-elevation-2)" : "var(--enroll-elevation-1)",
                }}
              >
                <span className="text-lg">{profile.icon}</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: isActive ? "var(--enroll-brand)" : "var(--enroll-text-primary)" }}
                >
                  {profile.label}
                </span>
                <span className="text-[10px]" style={{ color: "var(--enroll-text-muted)" }}>
                  {profile.desc}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <PlanDefaultPortfolioCard />
      <FundAllocationSection />
    </div>
  );
};

import { memo } from "react";
import { MetricCard } from "../../shared/MetricCard";
import { CARD_STYLE, fmtCurrency } from "../../core/types";
import type { ModuleProps } from "../../core/types";

/**
 * WealthSnapshot — Plan overview with balance breakdown and key metrics.
 */
export const WealthSnapshot = memo(function WealthSnapshot({ engine, data }: ModuleProps) {
  const plan = data.planDetails;
  if (!plan) return null;

  return (
    <div className="p-6" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--enroll-text-muted)" }}
          >
            Your Plan
          </p>
          <p
            className="text-base font-bold mt-0.5"
            style={{ color: "var(--enroll-text-primary)" }}
          >
            {plan.planName}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: "rgb(var(--enroll-accent-rgb) / 0.08)",
            color: "var(--enroll-accent)",
          }}
        >
          {engine.employerMatch.pct}% up to {engine.employerMatch.cap}% match
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Total Balance"
          value={fmtCurrency(plan.totalBalance)}
          accent
        />
        <MetricCard
          label="YTD Return"
          value={`+${plan.ytdReturn}%`}
          trend={{ direction: plan.ytdReturn >= 0 ? "up" : "down", label: "this year" }}
        />
        <MetricCard
          label="Contribution"
          value={`${plan.contributionRate}%`}
        />
        <MetricCard
          label="Enrolled"
          value={new Date(plan.enrolledAt + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        />
      </div>
    </div>
  );
});

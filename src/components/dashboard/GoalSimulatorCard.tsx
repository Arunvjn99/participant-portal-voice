import { useState } from "react";
import type { GoalProgress } from "../../data/enrollmentSummary";

interface GoalSimulatorCardProps {
  data: GoalProgress;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

/**
 * Goal Simulator - circular progress, metrics, Save Sim / Load Saved.
 * READ-ONLY: no sliders, no edit toggles.
 */
export const GoalSimulatorCard = ({ data }: GoalSimulatorCardProps) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (data.percentOnTrack / 100) * circumference;

  return (
    <article className="ped-goal bg-card rounded-xl border border-border p-6 shadow-sm min-h-fit w-full min-w-0">
      <div className="ped-goal__header">
        <h2 className="ped-goal__title">Goal Simulator</h2>
        <button type="button" className="ped-goal__bookmark" aria-label="Info">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>
      </div>
      <div className="ped-goal__ring-wrap relative">
        <svg
          className="ped-goal__ring cursor-crosshair"
          viewBox="0 0 100 100"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--accent-primary, var(--color-primary))"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
          />
        </svg>
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:shadow-black/50"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y + 12,
              transform: "translate(0, -50%)",
            }}
          >
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {data.percentOnTrack}% On Track
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Projected: {formatCurrency(data.projectedBalance)} at age {data.retirementAge}
            </div>
          </div>
        )}
        <div className="ped-goal__center">
          <span className="ped-goal__center-val">{data.percentOnTrack}%</span>
          <span className="ped-goal__center-label">On Track</span>
        </div>
      </div>
      <div className="ped-goal__row">
        <span className="ped-goal__label">Retirement Age</span>
        <span className="ped-goal__value">{data.retirementAge}</span>
      </div>
      <div className="ped-goal__row">
        <span className="ped-goal__label">Monthly Contribution</span>
        <span className="ped-goal__value">{formatCurrency(data.monthlyContribution)}</span>
      </div>
      <div className="ped-goal__actions">
        <button type="button" className="ped-goal__btn ped-goal__btn--outline">
          Save Sim
        </button>
        <button type="button" className="ped-goal__btn ped-goal__btn--outline">
          Load Saved
        </button>
      </div>
      <div className="ped-goal__projected">
        <span className="ped-goal__projected-label">Projected Balance at age {data.retirementAge}</span>
        <span className="ped-goal__projected-value">{formatCurrency(data.projectedBalance)}</span>
      </div>
    </article>
  );
};

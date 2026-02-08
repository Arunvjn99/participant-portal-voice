import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RateOfReturnCardProps {
  confidencePct: number;
  message: string;
  timeRange: "5Y" | "1Y" | "3M";
}

/**
 * Rate of Return - time range selector, line chart placeholder, confidence indicator
 */
export const RateOfReturnCard = ({ confidencePct, message, timeRange: initialRange }: RateOfReturnCardProps) => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState(initialRange);

  return (
    <article className="ped-ror bg-card rounded-xl border border-border p-6 shadow-sm min-h-fit w-full min-w-0">
      <div className="ped-ror__header">
        <h2 className="ped-ror__title">Rate of Return</h2>
      </div>
      <p className="ped-ror__sub">Historical performance across all plans</p>
      <div className="ped-ror__tabs">
        {(["5Y", "1Y", "3M"] as const).map((r) => (
          <button
            key={r}
            type="button"
            className={`ped-ror__tab ${timeRange === r ? "ped-ror__tab--active" : ""}`}
            onClick={() => setTimeRange(r)}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="ped-ror__chart">
        <svg viewBox="0 0 400 120" className="ped-ror__chart-svg">
          <defs>
            <linearGradient id="ror-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 80 Q 50 70 100 60 T 200 50 T 300 45 T 400 40 L 400 120 L 0 120 Z"
            fill="url(#ror-fill)"
          />
          <path
            d="M 0 80 Q 50 70 100 60 T 200 50 T 300 45 T 400 40"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
          />
          <path
            d="M 0 90 Q 80 75 200 55 T 400 35"
            fill="none"
            stroke="var(--color-success)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        </svg>
        <div className="ped-ror__chart-labels">
          <span>Now</span>
          <span>30 yrs</span>
        </div>
      </div>
      <div className="ped-ror__confidence">
        <span className="ped-ror__confidence-label">Confidence Indicator: {confidencePct}%</span>
        <span className="ped-ror__confidence-check" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span className="ped-ror__confidence-msg">{message}</span>
      </div>
      <button
        type="button"
        className="ped-ror__btn"
        onClick={() => navigate("/enrollment/investments")}
      >
        Manage Strategy
      </button>
    </article>
  );
};

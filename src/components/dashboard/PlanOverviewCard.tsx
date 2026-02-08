import { useNavigate } from "react-router-dom";
import type { PlanDetails, Balances } from "../../data/enrollmentSummary";

interface PlanOverviewCardProps {
  plan: PlanDetails;
  balances: Balances;
  isWithdrawalRestricted: boolean;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const formatCurrencyWithSign = (n: number) => {
  const sign = n >= 0 ? "" : "-";
  return `${sign}${formatCurrency(Math.abs(n))}`;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/**
 * Plan Overview Card - 90% Fit badge, primary actions, simplified Quick Stats
 */
export const PlanOverviewCard = ({
  plan,
  balances,
  isWithdrawalRestricted,
}: PlanOverviewCardProps) => {
  const navigate = useNavigate();

  return (
    <article className="ped-plan bg-card rounded-xl border border-border p-6 shadow-sm min-h-fit w-full min-w-0">
      <div className="ped-plan__header">
        <div className="ped-plan__meta">
          <span className="ped-plan__icon" aria-hidden>401(k)</span>
          <span className="ped-plan__enrolled">Enrolled: {formatDate(plan.enrolledAt)}</span>
        </div>
        {plan.planFitPct != null && (
          <span className="ped-plan__fit-badge">{plan.planFitPct}% Fit</span>
        )}
      </div>
      <h2 className="ped-plan__name">{plan.planName}</h2>
      <div className="ped-plan__balance-section">
        <span className="ped-plan__balance-label">TOTAL BALANCE</span>
        <span className="ped-plan__balance-value">{formatCurrency(plan.totalBalance)}</span>
        <span className="ped-plan__ytd">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <polyline points="18 15 12 9 6 15" />
          </svg>
          +{plan.ytdReturn}% YTD
        </span>
      </div>
      <div className="ped-plan__primary-actions">
        <button
          type="button"
          className="ped-plan__primary-btn"
          onClick={() => navigate("/transactions/rollover/start")}
        >
          Start Rollover
        </button>
        <button
          type="button"
          className="ped-plan__primary-btn"
          disabled={isWithdrawalRestricted}
          onClick={() => navigate("/transactions/withdrawal/start")}
        >
          Request Withdrawal
        </button>
      </div>
      <div className="ped-plan__stats">
        <div className="ped-plan__stat-card">
          <h3 className="ped-plan__stat-title">Rollover Eligible</h3>
          <span className="ped-plan__stat-value">{formatCurrency(balances.rolloverEligible)}</span>
          <button
            type="button"
            className="ped-plan__stat-link"
            onClick={() => navigate("/transactions/rollover/start")}
          >
            Start Rollover
          </button>
        </div>
        <div className="ped-plan__stat-card">
          <h3 className="ped-plan__stat-title">Available Cash</h3>
          <span className={`ped-plan__stat-value ${balances.availableCash < 0 ? "ped-plan__stat-value--neg" : ""}`}>
            {formatCurrencyWithSign(balances.availableCash)}
          </span>
          <button
            type="button"
            className="ped-plan__stat-link"
            disabled={isWithdrawalRestricted}
            onClick={() => navigate("/transactions/withdrawal/start")}
          >
            Request Withdrawal
          </button>
        </div>
        <div className="ped-plan__stat-card">
          <h3 className="ped-plan__stat-title">Restricted</h3>
          <span className="ped-plan__stat-value">{formatCurrency(balances.restricted)}</span>
          <span className="ped-plan__stat-action">
            <span className="ped-plan__stat-check" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <button
              type="button"
              className="ped-plan__stat-link"
              onClick={() => navigate("/profile")}
            >
              Review over time
            </button>
          </span>
        </div>
      </div>
    </article>
  );
};

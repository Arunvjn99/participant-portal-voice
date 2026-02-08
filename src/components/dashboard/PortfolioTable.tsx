import { useNavigate } from "react-router-dom";
import type { InvestmentAllocation } from "../../data/enrollmentSummary";

interface PortfolioTableProps {
  rows: InvestmentAllocation[];
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const formatPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

/**
 * Your Portfolio table: Fund, Balance, Allocation %, Return
 */
export const PortfolioTable = ({ rows }: PortfolioTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="ped-portfolio bg-card rounded-xl border border-border p-6 shadow-sm min-h-fit w-full min-w-0">
      <div className="ped-portfolio__header">
        <h2 className="ped-portfolio__title">Your Portfolio</h2>
        <a href="/enrollment/plans" className="ped-portfolio__link">Compare All Plans →</a>
      </div>
      <div className="ped-portfolio__sub-header">100% up to 6% Match</div>
      <p className="ped-portfolio__meta">
        Contributions are pre-tax. You pay taxes upon withdrawal in retirement.
      </p>
      <div className="ped-portfolio__tabs">
        <button type="button" className="ped-portfolio__tab ped-portfolio__tab--active">
          Pre-tax contributions
        </button>
        <button type="button" className="ped-portfolio__tab">
          Immediate tax break
        </button>
        <button type="button" className="ped-portfolio__tab">
          Employer Match
        </button>
      </div>
      <div className="ped-portfolio__table-wrap">
        <table className="ped-portfolio__table">
          <thead>
            <tr>
              <th>FUND</th>
              <th>BALANCE</th>
              <th>ALLOC</th>
              <th>RETURN</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.fundId}>
                <td>
                  <span className="ped-portfolio__fund-name">{row.fundName}</span>
                  <span className="ped-portfolio__fund-ticker">{row.ticker}</span>
                </td>
                <td>{formatCurrency(row.balance)}</td>
                <td>{row.allocationPct}%</td>
                <td>
                  <span className={row.returnPct >= 0 ? "ped-portfolio__return--pos" : "ped-portfolio__return--neg"}>
                    {formatPct(row.returnPct)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ped-portfolio__actions">
        <button type="button" className="ped-portfolio__btn ped-portfolio__btn--outline" onClick={() => navigate("/enrollment/investments")}>
          Rebalance Portfolio
        </button>
        <button type="button" className="ped-portfolio__btn ped-portfolio__btn--primary" onClick={() => navigate("/enrollment/investments")}>
          Manage Investments
        </button>
      </div>
    </div>
  );
};

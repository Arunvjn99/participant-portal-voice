import { useNavigate } from "react-router-dom";
import type { InvestmentAllocation } from "../../data/enrollmentSummary";

interface PortfolioTableProps {
  rows: InvestmentAllocation[];
  employerMatchLabel?: string;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const formatPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

/**
 * Your Portfolio — responsive: table on desktop, cards on mobile.
 * All fields visible; no truncation.
 */
export const PortfolioTable = ({ rows, employerMatchLabel = "100% up to 6% Match" }: PortfolioTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="ped-portfolio w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5 lg:p-6">
      {/* Header — stacks on mobile */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="m-0 text-lg font-semibold text-slate-900 dark:text-slate-100">Your Portfolio</h2>
        <a href="/enrollment/plans" className="self-start text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 sm:self-center">
          Compare All Plans →
        </a>
      </div>
      <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{employerMatchLabel}</div>
      <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
        Contributions are pre-tax. You pay taxes upon withdrawal in retirement.
      </p>

      {/* Tabs — wraps on mobile */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="rounded-md border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-medium text-white sm:text-sm">
          Pre-tax contributions
        </button>
        <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-600 dark:text-slate-400 sm:text-sm">
          Roth contributions
        </button>
        <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-600 dark:text-slate-400 sm:text-sm">
          Employer Match
        </button>
      </div>

      {/* Mobile: card layout — each fund as a card, all fields visible */}
      <div className="mb-4 flex flex-col gap-3 sm:hidden">
        {rows.map((row) => (
          <div
            key={row.fundId}
            className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-600 dark:bg-slate-700/30"
          >
            <div className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
              {row.fundName} <span className="font-normal text-slate-500 dark:text-slate-400">({row.ticker})</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Balance</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(row.balance)}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Alloc</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{row.allocationPct}%</span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Return</span>
                <span className={row.returnPct >= 0 ? "font-medium text-emerald-600 dark:text-emerald-400" : "font-medium text-red-600 dark:text-red-400"}>
                  {formatPct(row.returnPct)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* sm+: table — explicit column widths so Fund, Balance, Alloc, Return all visible */}
      <div className="mb-4 hidden overflow-x-auto sm:block" style={{ WebkitOverflowScrolling: "touch" }}>
        <table className="w-full min-w-[600px] border-collapse text-sm lg:text-base">
          <colgroup>
            <col style={{ width: "36%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "22%" }} />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-slate-600">
              <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fund</th>
              <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Balance</th>
              <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Alloc</th>
              <th className="py-3 pl-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Return</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.fundId} className="border-b border-slate-200 dark:border-slate-600 last:border-b-0">
                <td className="py-3 pr-4 break-words">
                  <span className="block font-semibold text-slate-900 dark:text-slate-100">
                    {row.fundName} <span className="font-normal text-slate-500 dark:text-slate-400">({row.ticker})</span>
                  </span>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap text-slate-900 dark:text-slate-100">{formatCurrency(row.balance)}</td>
                <td className="py-3 pr-4 whitespace-nowrap text-slate-900 dark:text-slate-100">{row.allocationPct}%</td>
                <td className="py-3 pl-4 whitespace-nowrap">
                  <span className={row.returnPct >= 0 ? "font-medium text-emerald-600 dark:text-emerald-400" : "font-medium text-red-600 dark:text-red-400"}>
                    {formatPct(row.returnPct)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions — stack on mobile */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <button
          type="button"
          className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-slate-600 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:text-blue-400 sm:w-auto"
          onClick={() => navigate("/enrollment/investments")}
        >
          Rebalance Portfolio
        </button>
        <button
          type="button"
          className="w-full rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 sm:w-auto"
          onClick={() => navigate("/enrollment/investments")}
        >
          Manage Investments
        </button>
      </div>
    </div>
  );
};

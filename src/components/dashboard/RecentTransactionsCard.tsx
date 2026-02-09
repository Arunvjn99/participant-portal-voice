import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Transaction } from "../../data/enrollmentSummary";

interface RecentTransactionsCardProps {
  transactions: Transaction[];
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n));

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const TYPE_LABELS: Record<Transaction["type"], string> = {
  contribution: "Contribution",
  "employer-match": "Employer Match",
  fee: "Fee",
  dividend: "Dividend Credit",
  "loan-repayment": "Loan Repayment",
};

const TYPE_COLORS: Record<Transaction["type"], string> = {
  contribution: "purple",
  "employer-match": "blue",
  fee: "red",
  dividend: "green",
  "loan-repayment": "orange",
};

/** Type-specific icons */
const TYPE_ICONS: Record<Transaction["type"], React.ReactNode> = {
  "loan-repayment": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  dividend: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
      <circle cx="12" cy="8" r="2" />
      <circle cx="8" cy="14" r="2" />
      <circle cx="16" cy="14" r="2" />
      <path d="M12 10v2M10 12l-2 2M14 12l2 2" />
    </svg>
  ),
  "employer-match": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
      <path d="M3 21h18M3 7v1a2 2 0 002 2h14a2 2 0 002-2V7M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2" />
    </svg>
  ),
  contribution: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  fee: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

export const RecentTransactionsCard = ({ transactions }: RecentTransactionsCardProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = transactions
    .filter((t) => !search || t.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <article className="ped-transactions bg-card rounded-xl border border-slate-200 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 min-h-fit w-full min-w-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h2 className="m-0 text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Transactions</h2>
          <p className="m-0 mt-1 text-sm text-slate-500 dark:text-slate-400">Your latest account activity</p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          onClick={() => navigate("/transactions")}
        >
          See all
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="flex-1 min-w-0 relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search transactions..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="ped-transactions__select px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Category: All</option>
        </select>
      </div>
      <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-600">
        {filtered.map((t) => (
          <div key={t.id} className="flex items-center gap-3 py-4 first:pt-0">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ped-transactions__icon--${TYPE_COLORS[t.type]}`}>
              {TYPE_ICONS[t.type]}
            </span>
            <div className="flex-1 min-w-0">
              <span className="block font-medium text-slate-900 dark:text-slate-100">{TYPE_LABELS[t.type]}</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">{formatDate(t.date)}</span>
            </div>
            <span className={`shrink-0 font-semibold ${t.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"}`}>
              {t.amount >= 0 ? "+" : "-"}{formatCurrency(t.amount)}
            </span>
            {t.account && (
              <span className="hidden sm:block shrink-0 text-xs text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                {t.account}
              </span>
            )}
          </div>
        ))}
      </div>
    </article>
  );
};

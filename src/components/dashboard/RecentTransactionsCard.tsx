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
  "loan-repayment": "yellow",
};

export const RecentTransactionsCard = ({ transactions }: RecentTransactionsCardProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [category, setCategory] = useState("all");

  const filtered = transactions
    .filter((t) => !search || t.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <article className="ped-transactions bg-card rounded-xl border border-border p-6 shadow-sm min-h-fit w-full min-w-0">
      <div className="ped-transactions__header">
        <h2 className="ped-transactions__title">Recent Transactions</h2>
        <button
          type="button"
          className="ped-transactions__link"
          onClick={() => navigate("/transactions")}
        >
          See all
        </button>
      </div>
      <p className="ped-transactions__sub">Your latest account activity</p>
      <div className="ped-transactions__filters">
        <input
          type="search"
          placeholder="Search transactions..."
          className="ped-transactions__search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="ped-transactions__select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Sort by Date</option>
        </select>
        <select
          className="ped-transactions__select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Category: All</option>
        </select>
      </div>
      <div className="ped-transactions__list">
        {filtered.map((t) => (
          <div key={t.id} className="ped-transactions__row">
            <span className={`ped-transactions__icon ped-transactions__icon--${TYPE_COLORS[t.type]}`} aria-hidden />
            <div className="ped-transactions__info">
              <span className="ped-transactions__type">{TYPE_LABELS[t.type]}</span>
              <span className="ped-transactions__date">{formatDate(t.date)}</span>
            </div>
            <span className={t.amount >= 0 ? "ped-transactions__amount--pos" : "ped-transactions__amount--neg"}>
              {t.amount >= 0 ? "+" : "-"}{formatCurrency(t.amount)}
            </span>
            {t.account && <span className="ped-transactions__account">{t.account}</span>}
          </div>
        ))}
      </div>
    </article>
  );
};

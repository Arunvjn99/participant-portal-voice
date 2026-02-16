import type { PersonaProfile } from "@/mock/personas";
import { ScenarioShell } from "./ScenarioShell";

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function RetiredScenario({ user }: { user: PersonaProfile }) {
  const monthlyIncome = Math.round(user.balance * 0.04 / 12);
  const annualIncome = Math.round(user.balance * 0.04);

  return (
    <ScenarioShell user={user} accentColor="#8b5cf6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Savings" value={fmt.format(user.balance)} color="#8b5cf6" />
        <StatCard label="Monthly Income" value={fmt.format(monthlyIncome)} color="#10b981" />
        <StatCard label="Annual Income" value={fmt.format(annualIncome)} color="#0b5fff" />
        <StatCard label="Retirement Score" value="100/100" color="#10b981" />
      </div>

      {/* Income distribution */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Income Distribution Plan</h3>
        <p className="mt-1 text-sm text-slate-500">Based on the 4% safe withdrawal rule</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <IncomeRow label="Monthly Distribution" amount={fmt.format(monthlyIncome)} pct="100%" color="#10b981" />
          <IncomeRow label="Social Security (est.)" amount="$1,800" pct="Supplemental" color="#0b5fff" />
          <IncomeRow label="Total Monthly" amount={fmt.format(monthlyIncome + 1800)} pct="Combined" color="#8b5cf6" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">Portfolio Health</h3>
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
            Your portfolio is well-diversified and positioned for sustainable withdrawals.
            At the current rate, your savings should last 25+ years.
          </p>
          <div className="mt-4 h-2 rounded-full bg-emerald-200 dark:bg-emerald-800">
            <div className="h-2 w-full rounded-full bg-emerald-500" />
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Sustainability: Excellent</p>
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-800 dark:bg-violet-900/20">
          <h3 className="font-semibold text-violet-900 dark:text-violet-200">Quick Actions</h3>
          <div className="mt-3 flex flex-col gap-2">
            <ActionButton label="Request Distribution" />
            <ActionButton label="Update Beneficiaries" />
            <ActionButton label="Tax Documents" />
          </div>
        </div>
      </div>
    </ScenarioShell>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function IncomeRow({ label, amount, pct, color }: { label: string; amount: string; pct: string; color: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-700">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold" style={{ color }}>{amount}</p>
      <p className="text-xs text-slate-400">{pct}</p>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50"
    >
      {label}
    </button>
  );
}

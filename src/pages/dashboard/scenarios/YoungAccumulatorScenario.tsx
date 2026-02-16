import type { PersonaProfile } from "@/mock/personas";
import { ScenarioShell } from "./ScenarioShell";

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function YoungAccumulatorScenario({ user }: { user: PersonaProfile }) {
  const yearsToRetire = 65 - user.age;
  const projectedBalance = Math.round(user.balance * Math.pow(1.07, yearsToRetire));

  return (
    <ScenarioShell user={user} accentColor="#10b981">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current Balance" value={fmt.format(user.balance)} color="#10b981" />
        <StatCard label="Contribution Rate" value={`${user.contributionRate}%`} color="#0b5fff" />
        <StatCard label="Employer Match" value={`${user.employerMatchRate}%`} color="#8b5cf6" />
        <StatCard label="Projected at 65" value={fmt.format(projectedBalance)} color="#f59e0b" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">Growth Trajectory</h3>
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
            With {yearsToRetire} years of compound growth at 7% average annual returns,
            your current {fmt.format(user.balance)} could grow to {fmt.format(projectedBalance)}.
          </p>
          <div className="mt-4 h-2 rounded-full bg-emerald-200 dark:bg-emerald-800">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min((user.balance / projectedBalance) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200">Recommendation</h3>
          <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            You're on a great start! Consider increasing your contribution rate by 1% each year
            to maximize your employer match and accelerate your retirement savings.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Increase Contribution
          </button>
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

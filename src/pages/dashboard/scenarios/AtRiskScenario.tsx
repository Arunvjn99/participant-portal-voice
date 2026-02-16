import type { PersonaProfile } from "@/mock/personas";
import { ScenarioShell } from "./ScenarioShell";

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function AtRiskScenario({ user }: { user: PersonaProfile }) {
  const yearsToRetire = 65 - user.age;
  const gap = user.employerMatchRate - user.contributionRate;
  const missedMatch = Math.round(user.balance * 0.5 * (gap / 100) * yearsToRetire);

  return (
    <ScenarioShell user={user} accentColor="#ef4444">
      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </span>
        <div>
          <h2 className="font-semibold text-red-900 dark:text-red-200">Action Needed: Low Contribution Rate</h2>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            You're contributing only {user.contributionRate}% — well below your employer match of {user.employerMatchRate}%.
            You're potentially leaving {fmt.format(missedMatch)} of employer match on the table over the next {yearsToRetire} years.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current Balance" value={fmt.format(user.balance)} color="#ef4444" alert />
        <StatCard label="Contribution Rate" value={`${user.contributionRate}%`} color="#ef4444" alert />
        <StatCard label="Retirement Score" value={`${user.retirementScore}/100`} color="#f59e0b" />
        <StatCard label="Employer Match" value={`${user.employerMatchRate}%`} color="#10b981" />
      </div>

      {/* Recovery plan */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
        <h3 className="font-semibold text-amber-900 dark:text-amber-200">Recovery Plan</h3>
        <ul className="mt-3 space-y-2 text-sm text-amber-800 dark:text-amber-300">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Increase contribution to at least {user.employerMatchRate}% to capture full employer match
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Set up automatic annual increase of 1% until you reach 15%
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Review investment allocation for better growth potential
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Schedule a consultation with a retirement advisor
          </li>
        </ul>
        <button
          type="button"
          className="mt-4 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
        >
          Fix My Contribution Now
        </button>
      </div>
    </ScenarioShell>
  );
}

function StatCard({ label, value, color, alert }: { label: string; value: string; color: string; alert?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${alert ? "border-red-200 bg-red-50/50 dark:border-red-800/50 dark:bg-red-900/10" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

import type { PersonaProfile } from "@/mock/personas";
import { ScenarioShell } from "./ScenarioShell";

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function MidCareerScenario({ user }: { user: PersonaProfile }) {
  const yearsToRetire = 65 - user.age;
  const projectedBalance = Math.round(user.balance * Math.pow(1.07, yearsToRetire));
  const monthlyIncome = Math.round(projectedBalance * 0.04 / 12);

  return (
    <ScenarioShell user={user} accentColor="#0b5fff">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Balance" value={fmt.format(user.balance)} color="#0b5fff" />
        <StatCard label="Retirement Score" value={`${user.retirementScore}/100`} color="#10b981" />
        <StatCard label="Years to Retire" value={`${yearsToRetire} years`} color="#f59e0b" />
        <StatCard label="Est. Monthly Income" value={fmt.format(monthlyIncome)} color="#8b5cf6" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ActionCard
          title="Optimize Portfolio"
          description="Review your asset allocation to ensure it matches your risk tolerance and timeline."
          buttonText="View Portfolio"
          color="#0b5fff"
        />
        <ActionCard
          title="Increase Savings"
          description={`Currently saving ${user.contributionRate}%. Consider maximizing your employer match of ${user.employerMatchRate}%.`}
          buttonText="Adjust Contribution"
          color="#10b981"
        />
        <ActionCard
          title="Tax Strategy"
          description="Explore Roth vs Traditional options to optimize your tax situation."
          buttonText="Compare Options"
          color="#8b5cf6"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Retirement Readiness</h3>
        <p className="mt-1 text-sm text-slate-500">Based on your current trajectory</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                style={{ width: `${user.retirementScore}%` }}
              />
            </div>
          </div>
          <span className="text-lg font-bold text-blue-600">{user.retirementScore}%</span>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          At your current pace, your projected balance at 65 is {fmt.format(projectedBalance)}.
          This could provide approximately {fmt.format(monthlyIncome)}/month in retirement income.
        </p>
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

function ActionCard({ title, description, buttonText, color }: { title: string; description: string; buttonText: string; color: string }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        className="mt-4 self-start rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors hover:text-white"
        style={{ borderColor: color, color, }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = color; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = color; }}
      >
        {buttonText}
      </button>
    </div>
  );
}

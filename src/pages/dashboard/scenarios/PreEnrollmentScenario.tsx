import type { PersonaProfile } from "@/mock/personas";
import { ScenarioShell } from "./ScenarioShell";

export function PreEnrollmentScenario({ user }: { user: PersonaProfile }) {
  return (
    <ScenarioShell user={user} accentColor="#6366f1">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title="Employer Match"
          value={`${user.employerMatchRate}% match available`}
          description="Your employer will match your contributions. Don't leave free money on the table!"
          color="#10b981"
        />
        <Card
          title="Enrollment Status"
          value="Not Yet Enrolled"
          description="You're eligible to start your retirement savings today."
          color="#f59e0b"
        />
        <Card
          title="Auto-Enrollment"
          value={user.flags.autoEnrollment ? "Active" : "Inactive"}
          description={
            user.flags.autoEnrollment
              ? "You'll be automatically enrolled in 30 days if you don't take action."
              : "Manual enrollment required."
          }
          color="#6366f1"
        />
      </div>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-900/20">
        <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">
          Ready to start your retirement journey?
        </h2>
        <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">
          At age {user.age}, starting now gives you over {65 - user.age} years of compound growth.
          Even a small contribution can grow significantly over time.
        </p>
        <button
          type="button"
          className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Start Enrollment
        </button>
      </div>
    </ScenarioShell>
  );
}

function Card({ title, value, description, color }: { title: string; value: string; description: string; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1 text-xl font-bold" style={{ color }}>{value}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

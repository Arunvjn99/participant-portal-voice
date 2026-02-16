import type { ReactNode } from "react";
import type { PersonaProfile } from "@/mock/personas";
import { SCENARIO_LABELS } from "@/mock/personas";

interface ScenarioShellProps {
  user: PersonaProfile;
  accentColor: string;
  children: ReactNode;
}

/**
 * Shared shell for scenario dashboards.
 * Renders a greeting banner + the scenario-specific content.
 */
export function ScenarioShell({ user, accentColor, children }: ScenarioShellProps) {
  const label = SCENARIO_LABELS[user.scenario];
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting banner */}
      <div
        className="rounded-xl border p-5 sm:p-6"
        style={{ borderColor: `${accentColor}33`, backgroundColor: `${accentColor}08` }}
      >
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Welcome back,
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
          {user.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {label}
          </span>
          <span>Age {user.age}</span>
          <span className="hidden sm:inline">•</span>
          <span>Balance: {formatter.format(user.balance)}</span>
          {user.retirementScore > 0 && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>Retirement Score: {user.retirementScore}</span>
            </>
          )}
        </div>
      </div>

      {/* Scenario-specific content */}
      {children}
    </div>
  );
}

import { Navigate } from "react-router-dom";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { useDemoUser } from "@/hooks/useDemoUser";
import {
  PreEnrollmentScenario,
  YoungAccumulatorScenario,
  MidCareerScenario,
  AtRiskScenario,
  RetiredScenario,
  ScenarioShell,
} from "./scenarios";

/**
 * Demo-aware dashboard that renders a scenario-specific view
 * based on the persona stored in localStorage.
 *
 * Falls back to the existing PreEnrollment dashboard if no persona is set
 * (navigates to login).
 */
export function DemoDashboard() {
  const user = useDemoUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const scenarioContent = (() => {
    switch (user.scenario) {
      case "pre_enrollment":
      case "new_enrollee":
        return <PreEnrollmentScenario user={user} />;
      case "young_accumulator":
        return <YoungAccumulatorScenario user={user} />;
      case "mid_career":
      case "pre_retiree":
      case "loan_active":
        return <MidCareerScenario user={user} />;
      case "at_risk":
        return <AtRiskScenario user={user} />;
      case "retired":
        return <RetiredScenario user={user} />;
      default:
        return (
          <ScenarioShell user={user} accentColor="#6b7280">
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                Dashboard for scenario "{user.scenario}" is coming soon.
              </p>
            </div>
          </ScenarioShell>
        );
    }
  })();

  return (
    <DashboardLayout header={<DashboardHeader />}>
      {scenarioContent}
    </DashboardLayout>
  );
}

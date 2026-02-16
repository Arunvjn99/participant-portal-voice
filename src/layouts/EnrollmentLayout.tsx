import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { EnrollmentHeaderWithStepper } from "../components/enrollment/EnrollmentHeaderWithStepper";
import { EnrollmentProvider } from "../enrollment/context/EnrollmentContext";
import { loadEnrollmentDraft } from "../enrollment/enrollmentDraftStore";

const ENROLLMENT_STEP_PATHS = [
  "/enrollment/choose-plan",
  "/enrollment/contribution",
  "/enrollment/future-contributions",
  "/enrollment/investments",
  "/enrollment/review",
] as const;

function pathToStep(pathname: string): number {
  const i = ENROLLMENT_STEP_PATHS.indexOf(pathname as (typeof ENROLLMENT_STEP_PATHS)[number]);
  return i >= 0 ? i : 0;
}

function useIsEnrollmentStepPath(): boolean {
  const { pathname } = useLocation();
  return ENROLLMENT_STEP_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function EnrollmentStepLayout() {
  const location = useLocation();
  const isStep = useIsEnrollmentStepPath();
  const pathname = location.pathname;
  const step = pathToStep(pathname);

  if (isStep) {
    return (
      <DashboardLayout
        header={<DashboardHeader />}
        subHeader={<EnrollmentHeaderWithStepper activeStep={step} />}
        transparentBackground
      >
        <Outlet />
      </DashboardLayout>
    );
  }
  return <Outlet />;
}

/**
 * EnrollmentLayout - Wraps enrollment routes with EnrollmentProvider.
 * For step routes (choose-plan, contribution, future-contributions, investments, review),
 * wraps with DashboardLayout using the global DashboardHeader + enrollment stepper bar.
 * Seeds draft when available.
 */
export const EnrollmentLayout = () => {
  const draft = loadEnrollmentDraft();

  return (
    <EnrollmentProvider
      initialSalary={draft?.annualSalary}
      initialAge={draft?.currentAge}
      initialRetirementAge={draft?.retirementAge}
      initialBalance={draft?.otherSavings?.amount ?? undefined}
      initialSelectedPlan={draft?.selectedPlanId ?? undefined}
      initialContributionType={draft?.contributionType}
      initialContributionAmount={draft?.contributionAmount}
      initialSourceAllocation={draft?.sourceAllocation}
      initialInvestmentProfile={draft?.investmentProfile}
      initialInvestmentProfileCompleted={draft?.investmentProfileCompleted}
    >
      <EnrollmentStepLayout />
    </EnrollmentProvider>
  );
};

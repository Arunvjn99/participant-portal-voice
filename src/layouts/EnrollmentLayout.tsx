import { Outlet } from "react-router-dom";
import { EnrollmentProvider } from "../enrollment/context/EnrollmentContext";
import { loadEnrollmentDraft } from "../enrollment/enrollmentDraftStore";

/**
 * EnrollmentLayout - Wraps enrollment routes with EnrollmentProvider
 * Seeds provider with enrollment draft when available (from wizard flow)
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
      <Outlet />
    </EnrollmentProvider>
  );
};

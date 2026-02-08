import { Navigate, type ReactNode } from "react-router-dom";
import { useEnrollment } from "../../enrollment/context/EnrollmentContext";

interface EnrollmentInvestmentsGuardProps {
  children: ReactNode;
}

/**
 * Guard for Investment Elections step - redirects if prerequisites not met.
 * Must be inside EnrollmentProvider.
 */
export const EnrollmentInvestmentsGuard = ({ children }: EnrollmentInvestmentsGuardProps) => {
  const { state } = useEnrollment();

  if (!state.isInitialized || !state.selectedPlan) {
    return <Navigate to="/enrollment/plans" replace />;
  }

  if (state.contributionAmount <= 0) {
    return <Navigate to="/enrollment/contribution" replace />;
  }

  return <>{children}</>;
};

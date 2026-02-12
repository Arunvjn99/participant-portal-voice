import { createBrowserRouter } from "react-router-dom";
import { Login } from "../pages/auth/Login";
import { VerifyCode } from "../pages/auth/VerifyCode";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import { ForgotPasswordVerify } from "../pages/auth/ForgotPasswordVerify";
import { ResetPassword } from "../pages/auth/ResetPassword";
import { HelpCenter } from "../pages/auth/HelpCenter";
import { PreEnrollment } from "../pages/dashboard/PreEnrollment";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { PostEnrollmentDashboard } from "../pages/dashboard/PostEnrollmentDashboard";
import { Profile } from "../pages/profile/Profile";
import { EnrollmentManagement } from "../pages/enrollment/EnrollmentManagement";
import { PlanDetailManagement } from "../pages/enrollment/PlanDetailManagement";
import { ChoosePlan } from "../pages/enrollment/ChoosePlan";
import { PlansPage } from "../pages/enrollment/PlansPage";
import { Contribution } from "../pages/enrollment/Contribution";
import { FutureContributions } from "../pages/enrollment/FutureContributions";
import { TransactionsHub } from "../pages/transactions/TransactionsHub";
import { TransactionAnalysis } from "../pages/transactions/TransactionAnalysis";
import { TransactionApplicationRouter } from "../pages/transactions/applications/TransactionApplicationRouter";
import { LoanFlow } from "../pages/transactions/applications/LoanFlow";
import { EnrollmentLayout } from "../layouts/EnrollmentLayout";
import { InvestmentProvider } from "../context/InvestmentContext";
import InvestmentsLayout from "../app/investments/layout";
import InvestmentsPage from "../app/investments/page";
import { EnrollmentInvestmentsGuard } from "../components/enrollment/EnrollmentInvestmentsGuard";
import { EnrollmentInvestmentsContent } from "../components/enrollment/EnrollmentInvestmentsContent";
import { EnrollmentReviewContent } from "../components/enrollment/EnrollmentReviewContent";
import { BellaVoiceRoute } from "../pages/voice/BellaVoiceRoute";
import { RootLayout } from "../layouts/RootLayout";

/**
 * Router configuration using createBrowserRouter (React Router v6+)
 * RootLayout wraps all routes and renders FloatingRetirementSearch on every screen.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/verify",
        element: <VerifyCode />,
      },
      {
        path: "/forgot",
        element: <ForgotPassword />,
      },
      {
        path: "/forgot/verify",
        element: <ForgotPasswordVerify />,
      },
      {
        path: "/reset",
        element: <ResetPassword />,
      },
      {
        path: "/help",
        element: <HelpCenter />,
      },
      {
        path: "/dashboard",
        element: <PreEnrollment />,
      },
      {
        path: "/dashboard/classic",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/post-enrollment",
        element: <PostEnrollmentDashboard />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/enrollment",
        element: <EnrollmentLayout />,
        children: [
          {
            index: true,
            element: <EnrollmentManagement />,
          },
          {
            path: "manage/:planId",
            element: <PlanDetailManagement />,
          },
          {
            path: "choose-plan",
            element: <ChoosePlan />,
          },
          {
            path: "plans",
            element: <PlansPage />,
          },
          {
            path: "contribution",
            element: <Contribution />,
          },
          {
            path: "future-contributions",
            element: <FutureContributions />,
          },
          {
            path: "investments",
            element: (
              <EnrollmentInvestmentsGuard>
                <EnrollmentInvestmentsContent />
              </EnrollmentInvestmentsGuard>
            ),
          },
          {
            path: "review",
            element: <EnrollmentReviewContent />,
          },
        ],
      },
      {
        path: "/transactions",
        element: <TransactionsHub />,
      },
      {
        path: "/transactions/loan/:transactionId",
        element: <LoanFlow />,
      },
      {
        path: "/transactions/:transactionType/start",
        element: <TransactionApplicationRouter />,
      },
      {
        path: "/transactions/:transactionType/:transactionId",
        element: <TransactionApplicationRouter />,
      },
      {
        path: "/transactions/:transactionId",
        element: <TransactionAnalysis />,
      },
      {
        path: "/investments",
        element: (
          <InvestmentProvider>
            <InvestmentsLayout>
              <InvestmentsPage />
            </InvestmentsLayout>
          </InvestmentProvider>
        ),
      },
      {
        path: "/voice",
        element: <BellaVoiceRoute />,
      },
    ],
  },
]);

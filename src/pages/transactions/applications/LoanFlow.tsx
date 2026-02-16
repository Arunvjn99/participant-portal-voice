import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { transactionStore } from "../../../data/transactionStore";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { DashboardLayout } from "../../../layouts/DashboardLayout";
import { DashboardHeader } from "../../../components/dashboard/DashboardHeader";
import {
  LoanProgressStepper,
  LoanIneligibleState,
  LOAN_STEP_LABELS,
} from "../../../components/loan";
import { LoanBasicsStep } from "../../../components/loan/steps/LoanBasicsStep";
import { PaymentSetupStep } from "../../../components/loan/steps/PaymentSetupStep";
import { InvestmentBreakdownStep } from "../../../components/loan/steps/InvestmentBreakdownStep";
import { DocumentsComplianceStep } from "../../../components/loan/steps/DocumentsComplianceStep";
import { LoanReviewStep } from "../../../components/loan/steps/LoanReviewStep";
import { ConfirmationStep } from "../../../components/loan/steps/ConfirmationStep";
import type { LoanFlowData, LoanStepIndex } from "../../../types/loan";
import { checkLoanEligibility } from "../../../services/loanEligibility";
import {
  validateLoanBasics,
  validatePaymentSetup,
  validateInvestmentBreakdown,
  validateDocuments,
  validateLoanReview,
} from "../../../utils/loanValidation";
import { DEFAULT_LOAN_PLAN_CONFIG } from "../../../config/loanPlanConfig";
import { ACCOUNT_OVERVIEW } from "../../../data/accountOverview";

const TOTAL_STEPS = 6;

function getDefaultFlowData(planConfig: typeof DEFAULT_LOAN_PLAN_CONFIG): LoanFlowData {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  const firstPaymentDate = nextMonth.toISOString().split("T")[0];
  return {
    basics: {
      loanAmount: planConfig.minLoanAmount,
      tenureYears: planConfig.termYearsMax,
      firstPaymentDate,
      payrollFrequency: "monthly",
    },
    payment: null,
    investment: null,
    documents: null,
  };
}

/** Mock user/account for eligibility; in production from API */
function getMockUserAndPlan() {
  return {
    user: {
      vestedBalance: ACCOUNT_OVERVIEW.vestedBalance,
      outstandingLoanBalance: ACCOUNT_OVERVIEW.outstandingLoan,
      isEnrolled: true,
      married: true,
    },
    plan: {
      planId: "plan-1",
      planName: "401(k) Plan",
      config: DEFAULT_LOAN_PLAN_CONFIG,
    },
  };
}

export function LoanFlow() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (transactionId === "start" || !transactionId) {
      const draft = transactionStore.createDraft("loan");
      navigate(`/transactions/loan/${draft.id}`, { replace: true });
    }
  }, [transactionId, navigate]);

  const [currentStep, setCurrentStep] = useState<LoanStepIndex>(0);
  const [flowData, setFlowData] = useState<LoanFlowData>(() => getDefaultFlowData(DEFAULT_LOAN_PLAN_CONFIG));

  const { user, plan } = useMemo(() => getMockUserAndPlan(), []);
  const eligibility = useMemo(() => checkLoanEligibility(user, plan), [user, plan]);

  const onDataChange = useCallback((patch: Partial<LoanFlowData>) => {
    setFlowData((prev) => ({ ...prev, ...patch }));
  }, []);

  const stepValidationErrors = useMemo(() => {
    const errors: string[] = [];
    if (currentStep === 0) {
      const r = validateLoanBasics(flowData.basics, plan.config);
      if (!r.valid) errors.push(...r.errors);
    }
    if (currentStep === 1) {
      const r = validatePaymentSetup(flowData.payment);
      if (!r.valid) errors.push(...r.errors);
    }
    if (currentStep === 2) {
      const r = validateInvestmentBreakdown(flowData.investment, flowData.basics?.loanAmount ?? 0);
      if (!r.valid) errors.push(...r.errors);
    }
    if (currentStep === 3) {
      const r = validateDocuments(flowData.documents, {
        loanPurpose: flowData.basics?.loanPurpose,
        reason: flowData.basics?.loanPurpose === "Hardship" ? "Hardship" : undefined,
        requiresSpousalConsent: plan.config.requiresSpousalConsent,
        userMarried: user.married,
      });
      if (!r.valid) errors.push(...r.errors);
    }
    if (currentStep === 4) {
      const r = validateLoanReview(flowData);
      if (!r.valid) errors.push(...r.errors);
    }
    return errors;
  }, [currentStep, flowData, plan.config, user.married]);

  const canProceed = stepValidationErrors.length === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const isConfirmation = currentStep === 5;

  const handleNext = useCallback(() => {
    if (currentStep === 4) {
      setCurrentStep(5);
      return;
    }
    if (!canProceed && currentStep < 4) return;
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => (s + 1) as LoanStepIndex);
    }
  }, [currentStep, canProceed]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => (s - 1) as LoanStepIndex);
  }, [currentStep]);

  const handleSaveAndExit = useCallback(() => {
    navigate("/transactions");
  }, [navigate]);

  const handleDownloadPDF = useCallback(() => {
    // Placeholder: in production trigger PDF generation
  }, []);

  if (transactionId === "start" || !transactionId) {
    return null;
  }

  if (!eligibility.eligible) {
    return (
      <DashboardLayout header={<DashboardHeader />}>
        <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
          <button
            type="button"
            onClick={() => navigate("/transactions")}
            className="text-sm font-medium text-blue-600 dark:text-blue-400"
            aria-label="Back to transactions"
          >
            ← Back to Transactions
          </button>
          <LoanIneligibleState reasons={eligibility.reasons} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout header={<DashboardHeader />}>
      <div className="flex min-h-screen flex-col">
        <div className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-800 md:px-6">
          <button
            type="button"
            onClick={() => navigate("/transactions")}
            className="mb-2 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            aria-label="Back to transactions"
          >
            ← Back to Transactions
          </button>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">
            401(k) Loan Application
          </h1>
          <div className="mt-4">
            <LoanProgressStepper
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              stepLabels={LOAN_STEP_LABELS}
            />
          </div>
        </div>

        <div className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <LoanBasicsStep
                key="basics"
                data={flowData}
                onDataChange={onDataChange}
                planConfig={plan.config}
                userContext={user}
              />
            )}
            {currentStep === 1 && (
              <PaymentSetupStep
                key="payment"
                data={flowData}
                onDataChange={onDataChange}
                planConfig={plan.config}
              />
            )}
            {currentStep === 2 && (
              <InvestmentBreakdownStep
                key="investment"
                data={flowData}
                onDataChange={onDataChange}
                planConfig={plan.config}
              />
            )}
            {currentStep === 3 && (
              <DocumentsComplianceStep
                key="documents"
                data={flowData}
                onDataChange={onDataChange}
                planConfig={plan.config}
                userMarried={user.married}
              />
            )}
            {currentStep === 4 && (
              <LoanReviewStep
                key="review"
                data={flowData}
                onDataChange={onDataChange}
                planConfig={plan.config}
                onNavigateToStep={(i) => setCurrentStep(i as LoanStepIndex)}
              />
            )}
            {currentStep === 5 && (
              <ConfirmationStep
                key="confirmation"
                data={flowData}
                planConfig={plan.config}
                onDownloadPDF={handleDownloadPDF}
              />
            )}
          </AnimatePresence>

          {stepValidationErrors.length > 0 && currentStep < 5 && (
            <motion.div
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ul className="list-inside list-disc">
                {stepValidationErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {!isConfirmation && (
          <footer className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05)] dark:border-slate-700 dark:bg-slate-800 md:px-6">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Previous step"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  aria-label="Save and exit"
                >
                  Save & Exit
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep < 4 && !canProceed}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                  aria-label={isLastStep ? "Submit" : "Next step"}
                >
                  {currentStep === 4 ? "Submit" : "Next"}
                </button>
              </div>
            </div>
          </footer>
        )}

        {isConfirmation && (
          <footer className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-800 md:px-6">
            <div className="mx-auto flex max-w-4xl justify-center">
              <button
                type="button"
                onClick={() => navigate("/transactions")}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                aria-label="Back to transactions"
              >
                Back to Transactions
              </button>
            </div>
          </footer>
        )}
      </div>
    </DashboardLayout>
  );
}

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { useEnrollment } from "../../enrollment/context/EnrollmentContext";
import { loadEnrollmentDraft, saveEnrollmentDraft } from "../../enrollment/enrollmentDraftStore";
import Button from "../ui/Button";
import type {
  InvestmentProfile,
  RiskTolerance,
  InvestmentHorizon,
  InvestmentPreference,
} from "../../enrollment/types/investmentProfile";
import { DEFAULT_INVESTMENT_PROFILE } from "../../enrollment/types/investmentProfile";

const RISK_OPTIONS: { value: RiskTolerance; label: string }[] = [
  { value: 1, label: "Very Uncomfortable" },
  { value: 2, label: "Uncomfortable" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Comfortable" },
  { value: 5, label: "Very Comfortable" },
];

const HORIZON_OPTIONS: { value: InvestmentHorizon; label: string }[] = [
  { value: "< 5 years", label: "< 5 years" },
  { value: "5–10 years", label: "5–10 years" },
  { value: "10–20 years", label: "10–20 years" },
  { value: "20+ years", label: "20+ years" },
];

const PREFERENCE_OPTIONS: { value: InvestmentPreference; label: string }[] = [
  { value: "prefer recommended", label: "Prefer recommended portfolio (hands-off)" },
  { value: "adjust allocations", label: "I want to adjust allocations" },
  { value: "full manual", label: "I want full manual control" },
  { value: "advisor assistance", label: "I want advisor assistance" },
];

const STEP_QUESTIONS = [
  {
    title: "How comfortable are you with investment volatility?",
    helper: "Volatility refers to how much your portfolio value may fluctuate over time.",
    options: RISK_OPTIONS,
    key: "riskTolerance" as const,
  },
  {
    title: "What is your investment time horizon?",
    helper: "How many years until you expect to start withdrawing these funds?",
    options: HORIZON_OPTIONS,
    key: "investmentHorizon" as const,
  },
  {
    title: "How involved do you want to be in managing your investments?",
    helper: "Choose the level of control you prefer.",
    options: PREFERENCE_OPTIONS,
    key: "investmentPreference" as const,
  },
];

/** Sparkle / AI icon */
const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M6 15l1.5 4.5L12 21l4.5-1.5L18 15l-4.5-1.5L12 9l-4.5 4.5L6 15z" />
  </svg>
);

interface InvestmentProfileWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const InvestmentProfileWizard = ({
  isOpen,
  onClose,
  onComplete,
}: InvestmentProfileWizardProps) => {
  const navigate = useNavigate();
  const { setInvestmentProfile, setInvestmentProfileCompleted } = useEnrollment();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<InvestmentProfile>>({});

  const currentStep = STEP_QUESTIONS[step - 1];
  const currentValue = profile[currentStep.key];
  const canProceed = currentValue != null;

  const handleSelect = useCallback((key: keyof InvestmentProfile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleNext = useCallback(() => {
    if (!canProceed) return;
    if (step < 3) {
      setStep(step + 1);
    } else {
      const fullProfile: InvestmentProfile = {
        riskTolerance: (profile.riskTolerance ?? DEFAULT_INVESTMENT_PROFILE.riskTolerance) as RiskTolerance,
        investmentHorizon: (profile.investmentHorizon ?? DEFAULT_INVESTMENT_PROFILE.investmentHorizon) as InvestmentHorizon,
        investmentPreference: (profile.investmentPreference ?? DEFAULT_INVESTMENT_PROFILE.investmentPreference) as InvestmentPreference,
      };
      setInvestmentProfile(fullProfile);
      setInvestmentProfileCompleted(true);
      const draft = loadEnrollmentDraft();
      if (draft) {
        saveEnrollmentDraft({
          ...draft,
          investmentProfile: fullProfile,
          investmentProfileCompleted: true,
        });
      }
      onComplete();
      navigate("/enrollment/investments");
    }
  }, [step, canProceed, profile, setInvestmentProfile, setInvestmentProfileCompleted, onComplete, navigate]);

  const handleClose = useCallback(() => {
    setInvestmentProfile(DEFAULT_INVESTMENT_PROFILE);
    setInvestmentProfileCompleted(true);
    const draft = loadEnrollmentDraft();
    if (draft) {
      saveEnrollmentDraft({
        ...draft,
        investmentProfile: DEFAULT_INVESTMENT_PROFILE,
        investmentProfileCompleted: true,
      });
    }
    onClose();
    navigate("/enrollment/investments");
  }, [setInvestmentProfile, setInvestmentProfileCompleted, onClose, navigate]);

  const progressPct = (step / 3) * 100;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 dark:bg-black/60" />
        <Dialog.Content
          className="investment-profile-wizard fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl focus:outline-none dark:border-slate-700 dark:bg-slate-900 md:p-8"
          aria-describedby={undefined}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={() => handleClose()}
        >
          {/* Header */}
          <div className="investment-profile-wizard__header mb-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                <SparkleIcon />
              </div>
              <div>
                <Dialog.Title className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  AI Investment Profile
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500 dark:text-slate-400">
                  Help us understand your investment preferences
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-400"
              aria-label="Close (skips wizard and applies default profile)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>

          {/* Progress */}
          <div className="investment-profile-wizard__progress mb-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Q{step}/3
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Step {step} of 3
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="investment-profile-wizard__step mb-6">
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {currentStep.title}
            </h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {currentStep.helper}
            </p>
            <div className="flex flex-col gap-2">
              {currentStep.options.map((opt) => {
                const isSelected =
                  String(currentValue) === String(opt.value) ||
                  (typeof opt.value === "string" && currentValue === opt.value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(currentStep.key, opt.value)}
                    className={`investment-profile-wizard__option rounded-lg border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-900/30"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="investment-profile-wizard__footer flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="min-w-[100px]"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className="min-w-[100px]"
            >
              {step < 3 ? "Next" : "Finish"}
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="investment-profile-wizard__disclaimer mt-6 rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            AI Disclaimer: This profile is generated using AI algorithms based on your responses.
            It is for educational purposes only and does not constitute personalized investment advice.
            Consult a licensed financial advisor for recommendations tailored to your situation.
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../ui/Modal";
import { Dropdown, type DropdownOption } from "../ui/Dropdown";
import {
  loadEnrollmentDraft,
  saveEnrollmentDraft,
  type EnrollmentDraft,
} from "../../enrollment/enrollmentDraftStore";

interface WizardFormState {
  currentAge: number;
  retirementAge: number;
  annualSalary: number;
  retirementLocation: string;
  savingsType: string;
  savingsAmount: number;
}

const DEFAULT_STATE: WizardFormState = {
  currentAge: 25,
  retirementAge: 65,
  annualSalary: 45000,
  retirementLocation: "New York",
  savingsType: "",
  savingsAmount: 0,
};

const RETIREMENT_LOCATIONS: DropdownOption[] = [
  { label: "New York", value: "New York" },
  { label: "California", value: "California" },
  { label: "Texas", value: "Texas" },
  { label: "Florida", value: "Florida" },
  { label: "Washington", value: "Washington" },
  { label: "Other", value: "Other" },
];

const SAVINGS_TYPES: DropdownOption[] = [
  { label: "IRA", value: "IRA" },
  { label: "Mutual Funds", value: "Mutual Funds" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Savings Account", value: "Savings Account" },
  { label: "401(k) Other", value: "401k Other" },
];

interface PersonalizePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(value: number): string {
  if (value === 0) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
}

function buildDraft(state: WizardFormState): EnrollmentDraft {
  const yearsToRetire = state.retirementAge - state.currentAge;
  const otherSavings =
    state.savingsType && state.savingsAmount > 0
      ? { type: state.savingsType, amount: state.savingsAmount }
      : undefined;

  return {
    currentAge: state.currentAge,
    retirementAge: state.retirementAge,
    yearsToRetire,
    annualSalary: state.annualSalary,
    retirementLocation: state.retirementLocation,
    otherSavings: otherSavings
      ? { type: otherSavings.type, amount: otherSavings.amount }
      : undefined,
  };
}

function validateWizard(state: WizardFormState): boolean {
  const retirementAgeValid = state.retirementAge > state.currentAge && state.retirementAge <= 75;
  const annualSalaryValid = state.annualSalary > 0;

  const otherSavingsFilled = Boolean(state.savingsType && state.savingsAmount > 0);
  const otherSavingsEmpty = !state.savingsType && state.savingsAmount === 0;
  const otherSavingsValid = otherSavingsFilled || otherSavingsEmpty;

  return retirementAgeValid && annualSalaryValid && otherSavingsValid;
}

export const PersonalizePlanModal = ({ isOpen, onClose }: PersonalizePlanModalProps) => {
  const navigate = useNavigate();
  const [state, setState] = useState<WizardFormState>(DEFAULT_STATE);

  // Load draft when modal opens
  useEffect(() => {
    if (isOpen) {
      const draft = loadEnrollmentDraft();
      if (draft) {
        setState((prev) => ({
          ...prev,
          currentAge: draft.currentAge ?? prev.currentAge,
          retirementAge: draft.retirementAge ?? prev.retirementAge,
          annualSalary: draft.annualSalary ?? prev.annualSalary,
          retirementLocation: draft.retirementLocation || prev.retirementLocation,
          savingsType: draft.otherSavings?.type ?? prev.savingsType,
          savingsAmount: draft.otherSavings?.amount ?? prev.savingsAmount,
        }));
      }
    }
  }, [isOpen]);

  const updateState = useCallback(<K extends keyof WizardFormState>(
    key: K,
    value: WizardFormState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveAndExit = () => {
    const draft = buildDraft(state);
    saveEnrollmentDraft(draft);
    onClose();
  };

  const handleNext = () => {
    if (!validateWizard(state)) return;
    const draft = buildDraft(state);
    saveEnrollmentDraft(draft);
    onClose();
    navigate("/enrollment/plans");
  };

  const isFormValid = validateWizard(state);
  const yearsToRetire = state.retirementAge - state.currentAge;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex max-h-[90vh] flex-col bg-white dark:bg-slate-800">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Personalize Your Plan
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-2.72 2.72a.75.75 0 101.06 1.06L10 11.06l2.72 2.72a.75.75 0 101.06-1.06L11.06 10l2.72-2.72a.75.75 0 00-1.06-1.06L10 8.94 7.28 6.22z" />
            </svg>
          </button>
        </div>

        {/* Summary strip - Figma: read-only current age + annual salary */}
        <div className="shrink-0 bg-sky-50 px-6 py-4 dark:bg-sky-950/40">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Your Current age</p>
              <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
                {state.currentAge} years
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Your Annual Salary</p>
              <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(state.annualSalary)} $
              </p>
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {/* Section 1: Retirement Age */}
            <div>
              <label className="block text-base font-semibold text-slate-900 dark:text-slate-100">
                What age would you like to Retire?
              </label>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                This helps us calculate how many years you have until retirement.
              </p>
              {state.retirementAge <= state.currentAge && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Retirement age must be greater than current age.
                </p>
              )}
              {state.retirementAge > 75 && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Retirement age must be 75 or less.
                </p>
              )}
              <div className="mt-4 flex items-center gap-4">
                <input
                  type="range"
                  min={Math.max(50, state.currentAge + 1)}
                  max={75}
                  value={Math.min(75, Math.max(state.currentAge + 1, state.retirementAge))}
                  onChange={(e) => updateState("retirementAge", parseInt(e.target.value, 10))}
                  style={{
                    background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${((state.retirementAge - 50) / 25) * 100}%, rgb(100 116 139) ${((state.retirementAge - 50) / 25) * 100}%, rgb(100 116 139) 100%)`,
                  }}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:border-0"
                />
                <input
                  type="number"
                  min={state.currentAge + 1}
                  max={75}
                  value={state.retirementAge}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v))
                      updateState(
                        "retirementAge",
                        Math.min(75, Math.max(state.currentAge + 1, v))
                      );
                  }}
                  className="h-10 w-16 rounded-lg border border-slate-200 bg-white px-3 text-center text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              {state.retirementAge > state.currentAge && state.retirementAge <= 75 && (
                <p className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                  You have {state.retirementAge - state.currentAge} {state.retirementAge - state.currentAge === 1 ? "year" : "years"} to retire.
                </p>
              )}
            </div>

            {/* Section 2: Retirement Location */}
            <div>
              <label className="block text-base font-semibold text-slate-900 dark:text-slate-100">
                Where would you like to Retire?
              </label>
              <div className="mt-4">
                <Dropdown
                  label=""
                  placeholder="Select location"
                  value={state.retirementLocation}
                  options={RETIREMENT_LOCATIONS}
                  onChange={(v) => updateState("retirementLocation", v)}
                  size="compact"
                />
              </div>
            </div>

            {/* Section 3: Other Savings */}
            <div>
              <label className="block text-base font-semibold text-slate-900 dark:text-slate-100">
                Other savings
              </label>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Provide both type and amount, or leave both empty.
              </p>
              {(state.savingsType && !state.savingsAmount) ||
              (!state.savingsType && state.savingsAmount > 0) ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Please provide both savings type and amount, or leave both empty.
                </p>
              ) : null}
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:gap-4">
                <div className="flex-1">
                  <Dropdown
                    label=""
                    placeholder="Savings Type"
                    value={state.savingsType}
                    options={SAVINGS_TYPES}
                    onChange={(v) => updateState("savingsType", v)}
                    size="compact"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={state.savingsAmount ? formatCurrency(state.savingsAmount) : ""}
                    onChange={(e) =>
                      updateState("savingsAmount", parseCurrencyInput(e.target.value))
                    }
                    placeholder="Amount"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - sticky */}
        <div className="shrink-0 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSaveAndExit}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Save & Exit
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!isFormValid}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Next
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.06l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../ui/Modal";
import { cn } from "@/lib/utils";
import {
  loadEnrollmentDraft,
  saveEnrollmentDraft,
  type EnrollmentDraft,
} from "../../enrollment/enrollmentDraftStore";

const TOTAL_STEPS = 4;

/* ──────────────────────── Shared helpers ──────────────────────── */

interface WizardFormState {
  currentAge: number;
  retirementAge: number;
  annualSalary: number;
  retirementLocation: string;
  savingsAmount: number;
}

const DEFAULT_STATE: WizardFormState = {
  currentAge: 30,
  retirementAge: 65,
  annualSalary: 45000,
  retirementLocation: "",
  savingsAmount: 0,
};

const COUNTRIES = [
  "Dominica",
  "Eritrea",
  "Chad",
  "Fiji",
  "Belize",
  "Gabon",
  "Andorra",
  "Haiti",
  "Iceland",
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
];

export interface PersonalizePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

function formatCurrency(value: number): string {
  if (value === 0) return "";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
}

/* Shared motion variants */
const stepVariants = {
  enter: { opacity: 0, x: 12 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};
const stepTransition = { duration: 0.2 };

/* ──────────────────────── Progress Bar ────────────────────────── */

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-[5px] shrink-0">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const filled = i < step;
          return (
            <motion.div
              key={i}
              className="h-2.5 rounded-full"
              style={{ width: filled ? 66 : 43 }}
              initial={false}
              animate={{
                backgroundColor: filled
                  ? "var(--color-primary)"
                  : "var(--color-background-tertiary)",
                width: filled ? 66 : 43,
              }}
              transition={{ duration: 0.25 }}
            />
          );
        })}
      </div>
      <span className="text-sm font-semibold whitespace-nowrap text-blue-700 dark:text-blue-400">
        Step {step} of {TOTAL_STEPS}
      </span>
    </div>
  );
}

/* ──────────────────────── Step 1: Current Age ─────────────────── */

function Step1CurrentAge({
  currentAge,
  onEdit,
}: {
  currentAge: number;
  onEdit: () => void;
}) {
  return (
    <motion.div
      key="step1"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
    >
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                Your Current Age
              </span>
              <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
                We believe you're currently{" "}
                <span className="text-blue-700 dark:text-blue-400">
                  {currentAge}
                </span>{" "}
                years old
              </p>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              If it doesn't look right, you can update it.
            </p>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────── Step 2: Retirement Age ──────────────── */

function Step2RetirementAge({
  currentAge,
  retirementAge,
  yearsToRetire,
  onRetirementAgeChange,
}: {
  currentAge: number;
  retirementAge: number;
  yearsToRetire: number;
  onRetirementAgeChange: (v: number) => void;
}) {
  const max = 75;
  const min = Math.min(max, Math.max(22, currentAge + 1));
  const value = Math.min(max, Math.max(min, retirementAge));
  const isRangeLocked = min === max;

  return (
    <motion.div
      key="step2"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
      className="space-y-5"
    >
      <div>
        <h3 className="text-xl sm:text-2xl font-bold leading-7 text-slate-900 dark:text-slate-100">
          At what age would you like to retire?
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          This helps us estimate how many years you have to retirement
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          disabled={isRangeLocked}
          onChange={(e) =>
            onRetirementAgeChange(parseInt(e.target.value, 10))
          }
          aria-label="Retirement age slider"
          className="personalize-plan-slider block min-w-0"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v))
              onRetirementAgeChange(Math.min(max, Math.max(min, v)));
          }}
          className="h-[42px] w-full rounded-lg border border-blue-500 bg-white px-3 py-1.5 text-center text-sm font-medium text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-blue-500 dark:bg-slate-800 dark:text-blue-400"
        />
      </div>
      <motion.div
        key={yearsToRetire}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-800/50"
      >
        <span className="text-slate-700 dark:text-slate-300">
          That is about{" "}
        </span>
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {yearsToRetire} years
        </span>
        <span className="text-slate-700 dark:text-slate-300"> from now</span>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────── Step 3: Location ───────────────────── */

function Step3Location({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  return (
    <motion.div
      key="step3"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
      className="flex flex-col gap-5"
    >
      <div>
        <h3 className="text-xl sm:text-2xl font-bold leading-7 text-slate-900 dark:text-slate-100">
          Where would you like to retire?
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          This helps us factor in cost-of-living for your plan
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 text-slate-400"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search Location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border-2 border-slate-200 bg-white py-3 pl-11 pr-11 text-sm font-medium text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-slate-400"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Location cards grid — scrollable to keep modal height consistent */}
      <div className="max-h-[240px] overflow-y-auto rounded-lg sm:max-h-[260px]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
          {filtered.map((location) => {
            const selected = value === location;
            return (
              <button
                key={location}
                type="button"
                onClick={() => onChange(selected ? "" : location)}
                className={cn(
                  "flex items-center h-[56px] sm:h-[60px] px-3 rounded-lg border-2 text-left text-sm font-medium transition-all duration-150",
                  selected
                    ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500"
                )}
              >
                {location}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-500 py-4 dark:text-slate-400">
              No locations found
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────── Step 4: Savings ────────────────────── */

function Step4Savings({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const display = value > 0 ? formatCurrency(value) : "";

  return (
    <motion.div
      key="step4"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
      className="space-y-5"
    >
      <div>
        <h3 className="text-xl sm:text-2xl font-bold leading-7 text-slate-900 dark:text-slate-100">
          Do you have any savings set aside for retirement?
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Include any 401(k), IRA, or other retirement accounts
        </p>
      </div>
      <div className="relative w-full">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 font-semibold text-lg">
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => onChange(parseCurrencyInput(e.target.value))}
          placeholder="0"
          className="h-14 w-full rounded-xl border-2 border-slate-200 bg-white pl-10 pr-4 py-3 text-lg font-semibold text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
    </motion.div>
  );
}

/* ──────────────────────── SVG Icons ──────────────────────────── */

function SaveIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ──────────────────────── Main Modal ─────────────────────────── */

export const PersonalizePlanModal = ({
  isOpen,
  onClose,
  userName = "there",
}: PersonalizePlanModalProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardFormState>(DEFAULT_STATE);
  const [editingAge, setEditingAge] = useState(false);

  useEffect(() => {
    setState((prev) => {
      const max = 75;
      const minRetirementAge = Math.min(
        max,
        Math.max(22, prev.currentAge + 1)
      );
      const normalizedRetirementAge = Math.min(
        max,
        Math.max(minRetirementAge, prev.retirementAge)
      );
      if (normalizedRetirementAge === prev.retirementAge) return prev;
      return { ...prev, retirementAge: normalizedRetirementAge };
    });
  }, [state.currentAge]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEditingAge(false);
      const draft = loadEnrollmentDraft();
      if (draft) {
        setState((prev) => ({
          ...prev,
          currentAge: draft.currentAge ?? prev.currentAge,
          retirementAge: draft.retirementAge ?? prev.retirementAge,
          annualSalary: draft.annualSalary ?? prev.annualSalary,
          retirementLocation:
            draft.retirementLocation || prev.retirementLocation,
          savingsAmount: draft.otherSavings?.amount ?? prev.savingsAmount,
        }));
      }
    }
  }, [isOpen]);

  const update = useCallback(
    <K extends keyof WizardFormState>(key: K, value: WizardFormState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const persistDraft = useCallback(() => {
    const existing = loadEnrollmentDraft();
    const yearsToRetire = state.retirementAge - state.currentAge;
    const merged: EnrollmentDraft = {
      ...existing,
      currentAge: state.currentAge,
      retirementAge: state.retirementAge,
      yearsToRetire,
      annualSalary: state.annualSalary,
      retirementLocation: state.retirementLocation,
      otherSavings:
        state.savingsAmount > 0
          ? { type: "Other", amount: state.savingsAmount }
          : existing?.otherSavings,
    };
    saveEnrollmentDraft(merged);
  }, [state]);

  const handleSaveAndExit = () => {
    persistDraft();
    onClose();
  };

  const handleNext = () => {
    persistDraft();
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      onClose();
      navigate("/enrollment/choose-plan");
    }
  };

  const handlePrevious = () => {
    persistDraft();
    setStep((s) => Math.max(1, s - 1));
  };

  const isLastStep = step === TOTAL_STEPS;
  const isFirstStep = step === 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} dialogClassName="max-w-[42rem]" wizard>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900"
      >
        {/* ─── Header ─── */}
        <div className="shrink-0 border-b border-slate-200 px-5 py-4 sm:px-6 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate dark:text-slate-100">
                Hello {userName}! 👋
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Let's plan your retirement together
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* ─── Content — flex-1 so it fills the wizard min-height ─── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {/* Progress bar */}
          <div className="mb-6">
            <ProgressBar step={step} />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1-wrap"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
              >
                {editingAge ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Your current age
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={75}
                      value={state.currentAge}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v))
                          update(
                            "currentAge",
                            Math.min(75, Math.max(18, v))
                          );
                      }}
                      className="h-12 max-w-[8rem] w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingAge(false)}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <Step1CurrentAge
                    currentAge={state.currentAge}
                    onEdit={() => setEditingAge(true)}
                  />
                )}
              </motion.div>
            )}
            {step === 2 && (
              <Step2RetirementAge
                key="step2"
                currentAge={state.currentAge}
                retirementAge={state.retirementAge}
                yearsToRetire={Math.max(
                  0,
                  state.retirementAge - state.currentAge
                )}
                onRetirementAgeChange={(v) => update("retirementAge", v)}
              />
            )}
            {step === 3 && (
              <Step3Location
                key="step3"
                value={state.retirementLocation}
                onChange={(v) => update("retirementLocation", v)}
              />
            )}
            {step === 4 && (
              <Step4Savings
                key="step4"
                value={state.savingsAmount}
                onChange={(v) => update("savingsAmount", v)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ─── Footer ─── */}
        <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6 sm:py-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center justify-between gap-3">
            {/* Save & Exit */}
            <button
              type="button"
              onClick={handleSaveAndExit}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              <SaveIcon />
              <span className="hidden sm:inline whitespace-nowrap">
                Save &amp; Exit
              </span>
            </button>

            {/* Right side: Previous + Next */}
            <div className="flex items-center gap-2 sm:gap-3">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 sm:px-5 py-2 text-sm font-medium text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-300"
                >
                  <ChevronLeftIcon />
                  <span className="hidden xs:inline">Previous</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 sm:px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isLastStep ? "Finish" : "Next Step"}
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
};

import { useMemo, useCallback, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEnrollment } from "../../enrollment/context/EnrollmentContext";
import { loadEnrollmentDraft, saveEnrollmentDraft } from "../../enrollment/enrollmentDraftStore";
import { EnrollmentFooter } from "../../components/enrollment/EnrollmentFooter";
import { EnrollmentPageContent } from "../../components/enrollment/EnrollmentPageContent";
import { ContributionHero } from "../../components/enrollment/ContributionHero";
import {
  PAYCHECKS_PER_YEAR,
  percentageToAnnualAmount,
  annualAmountToPercentage,
  deriveContribution,
} from "../../enrollment/logic/contributionCalculator";
import { calculateProjection } from "../../enrollment/logic/projectionCalculator";
import type { ProjectionDataPoint } from "../../enrollment/logic/types";
import { formatYAxisLabel, getYAxisTicks } from "../../utils/projectionChartAxis";

/* ── Constants (unchanged) ── */
const SLIDER_MIN = 1;
const SLIDER_MAX = 25;

const PRESETS = [
  { id: "safe", label: "Safe: 8%", percentage: 8 },
  { id: "aggressive", label: "Aggressive: 15%", percentage: 15 },
] as const;

const SOURCE_OPTIONS = [
  { id: "preTax", main: "Pre-tax", sub: "(default)", key: "preTax" as const },
  { id: "roth", main: "Roth", sub: "(after-tax, tax-free growth)", key: "roth" as const },
  { id: "afterTax", main: "After-tax", sub: "(non-Roth)", key: "afterTax" as const },
] as const;

/* ── Shared card style using tokens ── */
const cardStyle: React.CSSProperties = {
  background: "var(--enroll-card-bg)",
  border: "1px solid var(--enroll-card-border)",
  borderRadius: "var(--enroll-card-radius)",
  boxShadow: "var(--enroll-elevation-2)",
};

/* ═══════════════════════════════════════════════════════════════
   Contribution Page
   ═══════════════════════════════════════════════════════════════ */

export const Contribution = () => {
  const navigate = useNavigate();
  const {
    state,
    setContributionType,
    setContributionAmount,
    setSourceAllocation,
    setSourcesEditMode,
    setSourcesViewMode,
    monthlyContribution,
    perPaycheck,
  } = useEnrollment();

  const selectedPlanId = state.selectedPlan;
  const salary = state.salary || 72000;
  const currentAge = state.currentAge || 40;
  const retirementAge = state.retirementAge || 67;

  if (state.isInitialized && !selectedPlanId) {
    return <Navigate to="/enrollment/plans" replace />;
  }

  /* ── Derived calculations (unchanged) ── */
  const contributionPct =
    state.contributionType === "percentage"
      ? state.contributionAmount
      : salary > 0
        ? annualAmountToPercentage(salary, state.contributionAmount * PAYCHECKS_PER_YEAR)
        : 0;
  const annualAmount = salary > 0 ? percentageToAnnualAmount(salary, contributionPct) : 0;
  const dollarInput = annualAmount;

  const derived = useMemo(
    () =>
      deriveContribution({
        contributionType: "percentage",
        contributionValue: contributionPct,
        annualSalary: salary,
        paychecksPerYear: PAYCHECKS_PER_YEAR,
        employerMatchEnabled: state.employerMatchEnabled,
        employerMatchCap: state.assumptions.employerMatchCap,
        employerMatchPercentage: state.assumptions.employerMatchPercentage,
        currentAge,
        retirementAge,
      }),
    [contributionPct, salary, state.employerMatchEnabled, state.assumptions.employerMatchCap, state.assumptions.employerMatchPercentage, currentAge, retirementAge]
  );

  const projectionBaseline = useMemo(
    () =>
      calculateProjection({
        currentAge,
        retirementAge,
        currentBalance: state.currentBalance || 0,
        monthlyContribution: derived.monthlyContribution,
        employerMatch: state.employerMatchEnabled ? derived.employerMatchMonthly : 0,
        annualReturnRate: state.assumptions.annualReturnRate,
        inflationRate: state.assumptions.inflationRate,
      }),
    [currentAge, retirementAge, state.currentBalance, derived.monthlyContribution, derived.employerMatchMonthly, state.employerMatchEnabled, state.assumptions.annualReturnRate, state.assumptions.inflationRate]
  );

  const activePreset = PRESETS.find((p) => p.percentage === contributionPct)?.id ?? null;

  /* ── Handlers (unchanged) ── */
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      Number.isFinite(n) && n >= 0 ? n : 0
    );

  const handlePreset = (pct: number) => {
    setContributionType("percentage");
    setContributionAmount(pct);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setContributionType("percentage");
    if (!isNaN(v) && v >= 0) setContributionAmount(Math.min(100, v));
    else if (e.target.value === "") setContributionAmount(0);
  };

  const handleDollarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= 0 && salary > 0) {
      const pct = annualAmountToPercentage(salary, v);
      setContributionType("percentage");
      setContributionAmount(Math.min(100, Math.max(0, pct)));
    } else if (e.target.value === "") {
      setContributionType("percentage");
      setContributionAmount(0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) {
      setContributionType("percentage");
      setContributionAmount(Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, v)));
    }
  };

  const handleSourcePercentChange = (key: "preTax" | "roth" | "afterTax", value: number) => {
    const next = { ...state.sourceAllocation, [key]: Math.min(100, Math.max(0, value)) };
    const sum = next.preTax + next.roth + next.afterTax;
    if (sum <= 100) setSourceAllocation(next);
    else {
      const otherKeys = (["preTax", "roth", "afterTax"] as const).filter((k) => k !== key);
      const otherSum = otherKeys.reduce((s, k) => s + next[k], 0);
      const capped = Math.min(100, Math.max(0, 100 - otherSum));
      setSourceAllocation({ ...next, [key]: capped });
    }
  };

  const canContinue = contributionPct > 0 && contributionPct <= 100;

  const handleNext = useCallback(() => {
    if (!canContinue) return;
    const draft = loadEnrollmentDraft();
    if (draft) {
      saveEnrollmentDraft({
        ...draft,
        contributionType: "percentage",
        contributionAmount: contributionPct,
        sourceAllocation: state.sourceAllocation,
      });
    }
    navigate("/enrollment/future-contributions");
  }, [canContinue, contributionPct, state.sourceAllocation, navigate]);

  /* ── Local UI state ── */
  const sourceTotal = state.sourceAllocation.preTax + state.sourceAllocation.roth + state.sourceAllocation.afterTax;
  const sliderPct = ((Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, contributionPct)) - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [focusedInput, setFocusedInput] = useState<"pct" | "dollar" | null>(null);
  const monthlyAmount = annualAmount / 12;
  const inputsActive = focusedInput !== null;
  const summaryText = `Monthly contribution: ${formatCurrency(derived.monthlyContribution ?? monthlyAmount)}`;
  const isMaxMatch = contributionPct >= state.assumptions.employerMatchCap && state.assumptions.employerMatchCap > 0;
  const employerMatchPerPaycheck = derived.employerMatchMonthly / 2;
  const totalPerPaycheck = perPaycheck + employerMatchPerPaycheck;
  const projectedTotal = projectionBaseline.dataPoints.length > 0
    ? projectionBaseline.dataPoints[projectionBaseline.dataPoints.length - 1].balance
    : 0;

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <EnrollmentPageContent
      title="Design your savings strategy"
      subtitle="Small increases today can create life-changing impact tomorrow."
      badge={
        <ContributionHero
          matchCap={state.assumptions.employerMatchCap}
          matchEnabled={state.employerMatchEnabled}
        />
      }
    >
      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ═══ LEFT: Strategy Builder (2 cols) ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="lg:col-span-2"
        >
          <div className="p-6 md:p-8 space-y-8" style={cardStyle}>

            {/* ── Quick Presets ── */}
            <div>
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: "var(--enroll-text-primary)" }}
              >
                How much do you want to contribute?
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium" style={{ color: "var(--enroll-text-muted)" }}>Quick presets:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePreset(p.percentage)}
                    className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-200"
                    style={{
                      background: activePreset === p.id
                        ? (p.id === "safe" ? "rgb(var(--enroll-accent-rgb) / 0.08)" : "rgb(var(--enroll-brand-rgb) / 0.08)")
                        : "var(--enroll-soft-bg)",
                      color: activePreset === p.id
                        ? (p.id === "safe" ? "var(--enroll-accent)" : "var(--enroll-brand)")
                        : "var(--enroll-text-secondary)",
                      border: `1px solid ${activePreset === p.id
                        ? (p.id === "safe" ? "rgb(var(--enroll-accent-rgb) / 0.2)" : "rgb(var(--enroll-brand-rgb) / 0.2)")
                        : "var(--enroll-card-border)"}`,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Slider ── */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium" style={{ color: "var(--enroll-text-muted)" }}>
                <span>1%</span>
                {state.assumptions.employerMatchCap > 0 && (
                  <span className="font-semibold" style={{ color: "var(--enroll-brand)" }}>
                    {state.assumptions.employerMatchCap}% match zone
                  </span>
                )}
                <span>25%</span>
              </div>
              <input
                type="range"
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                value={Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, contributionPct))}
                onChange={handleSliderChange}
                aria-label="Contribution percentage"
                className="w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--enroll-brand) 0%, var(--enroll-brand) ${sliderPct}%, var(--enroll-soft-bg) ${sliderPct}%, var(--enroll-soft-bg) 100%)`,
                  ["--tw-shadow" as string]: "var(--enroll-elevation-1)",
                } as React.CSSProperties}
              />
            </div>

            {/* ── Percentage / Dollar Inputs ── */}
            <div
              className="rounded-xl transition-all duration-200"
              style={{
                border: inputsActive ? "1px solid var(--enroll-brand)" : "1px solid var(--enroll-card-border)",
                background: "var(--enroll-card-bg)",
              }}
            >
              <div className="flex items-stretch" style={{ borderColor: "var(--enroll-card-border)" }}>
                <div className="flex flex-1 items-center gap-1.5 min-w-0 px-4 py-3">
                  <input
                    type="number"
                    value={contributionPct > 0 ? contributionPct : ""}
                    onChange={handlePercentageChange}
                    onFocus={() => setFocusedInput("pct")}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                    aria-label="Contribution percentage"
                    className="w-full min-w-0 bg-transparent text-2xl font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ color: "var(--enroll-text-primary)" }}
                  />
                  <span className="text-lg font-semibold shrink-0" style={{ color: "var(--enroll-text-muted)" }}>%</span>
                </div>
                <div
                  className="flex shrink-0 items-center px-2"
                  style={{ borderLeft: "1px solid var(--enroll-card-border)", borderRight: "1px solid var(--enroll-card-border)" }}
                >
                  <span className="text-xs font-medium" style={{ color: "var(--enroll-text-muted)" }}>or</span>
                </div>
                <div className="flex flex-1 items-center gap-1.5 min-w-0 px-4 py-3">
                  <input
                    type="number"
                    value={dollarInput > 0 ? Math.round(dollarInput).toString() : ""}
                    onChange={handleDollarChange}
                    onFocus={() => setFocusedInput("dollar")}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="0"
                    min="0"
                    step="1"
                    aria-label="Annual contribution amount"
                    className="w-full min-w-0 bg-transparent text-2xl font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ color: "var(--enroll-text-primary)" }}
                  />
                  <span className="text-lg font-semibold shrink-0" style={{ color: "var(--enroll-text-muted)" }}>$/yr</span>
                </div>
              </div>
            </div>

            {/* ── Match Status ── */}
            <div
              className="p-4 rounded-xl transition-colors duration-300"
              style={{
                background: isMaxMatch ? "rgb(var(--enroll-accent-rgb) / 0.08)" : "var(--enroll-soft-bg)",
                border: isMaxMatch ? "1px solid rgb(var(--enroll-accent-rgb) / 0.2)" : "1px solid var(--enroll-card-border)",
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: isMaxMatch ? "var(--enroll-accent)" : "var(--enroll-text-primary)" }}
              >
                {isMaxMatch
                  ? "You're maximizing your employer match!"
                  : `You're contributing ${contributionPct}% of your salary`}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: isMaxMatch ? "rgb(var(--enroll-accent-rgb) / 0.8)" : "var(--enroll-text-muted)" }}
              >
                That's {formatCurrency(perPaycheck)} per paycheck
              </p>
            </div>

            {/* ── Paycheck Impact Blocks ── */}
            <div className="grid grid-cols-3 gap-3">
              <PaycheckCell
                label="You invest"
                value={formatCurrency(perPaycheck)}
                colorVar="--enroll-brand-rgb"
              />
              <PaycheckCell
                label="Employer adds"
                value={formatCurrency(employerMatchPerPaycheck)}
                colorVar="--enroll-accent-rgb"
              />
              <div
                className="rounded-xl p-4 text-center"
                style={{
                  background: "var(--enroll-soft-bg)",
                  border: "1px solid var(--enroll-card-border)",
                }}
              >
                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>Total working</p>
                <p className="text-lg font-bold mt-1" style={{ color: "var(--enroll-text-primary)" }}>{formatCurrency(totalPerPaycheck)}</p>
              </div>
            </div>

            {/* ── Advanced Tax Strategy (Collapsible) ── */}
            <section
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--enroll-card-border)" }}
            >
              <button
                type="button"
                onClick={() => setSourcesExpanded(!sourcesExpanded)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:opacity-80"
              >
                <span className="text-sm font-semibold" style={{ color: "var(--enroll-text-primary)" }}>Customize Your Tax Strategy</span>
                <motion.span
                  animate={{ rotate: sourcesExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: "var(--enroll-text-muted)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {sourcesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-4" style={{ borderTop: "1px solid var(--enroll-card-border)" }}>
                      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                        <span className="text-sm font-medium" style={{ color: "var(--enroll-text-secondary)" }}>Contribution Sources</span>
                        <div className="flex items-center gap-4">
                          <div className="inline-flex rounded-lg p-0.5" style={{ background: "var(--enroll-soft-bg)" }}>
                            <button
                              type="button"
                              onClick={() => setSourcesViewMode("percent")}
                              className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
                              style={{
                                background: state.sourcesViewMode === "percent" ? "var(--enroll-card-bg)" : "transparent",
                                color: state.sourcesViewMode === "percent" ? "var(--enroll-text-primary)" : "var(--enroll-text-muted)",
                                boxShadow: state.sourcesViewMode === "percent" ? "var(--enroll-elevation-1)" : "none",
                              }}
                            >
                              %
                            </button>
                            <button
                              type="button"
                              onClick={() => setSourcesViewMode("dollar")}
                              className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
                              style={{
                                background: state.sourcesViewMode === "dollar" ? "var(--enroll-card-bg)" : "transparent",
                                color: state.sourcesViewMode === "dollar" ? "var(--enroll-text-primary)" : "var(--enroll-text-muted)",
                                boxShadow: state.sourcesViewMode === "dollar" ? "var(--enroll-elevation-1)" : "none",
                              }}
                            >
                              $
                            </button>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs" style={{ color: "var(--enroll-text-muted)" }}>Edit</span>
                            <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={state.sourcesEditMode}
                                onChange={(e) => setSourcesEditMode(e.target.checked)}
                                className="peer sr-only"
                              />
                              <span className="relative block h-full w-full rounded-full transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:after:translate-x-4"
                                style={{
                                  background: state.sourcesEditMode ? "var(--enroll-brand)" : "var(--enroll-soft-bg)",
                                  border: state.sourcesEditMode ? "none" : "1px solid var(--enroll-card-border)",
                                }}
                              />
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {SOURCE_OPTIONS.map((opt) => {
                          const paycheckTotal = annualAmount / PAYCHECKS_PER_YEAR;
                          const sourcePerPaycheck = (state.sourceAllocation[opt.key] / 100) * paycheckTotal;
                          const displayValue =
                            state.sourcesViewMode === "percent"
                              ? state.sourceAllocation[opt.key] > 0 ? state.sourceAllocation[opt.key] : ""
                              : state.sourceAllocation[opt.key] > 0 ? Math.round(sourcePerPaycheck) : "";
                          return (
                            <div key={opt.id} className="flex justify-between items-center gap-4">
                              <label
                                className={`flex items-center gap-2 cursor-pointer ${!state.sourcesEditMode ? "opacity-80 cursor-default" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={state.sourceAllocation[opt.key] > 0}
                                  disabled={!state.sourcesEditMode}
                                  onChange={(e) => {
                                    const keys = ["preTax", "roth", "afterTax"] as const;
                                    const current = state.sourceAllocation;
                                    if (e.target.checked) {
                                      const activeKeys = keys.filter((k) => current[k] > 0 || k === opt.key);
                                      const count = activeKeys.length;
                                      const equalShare = Math.round((100 / count) * 10) / 10;
                                      const remainder = 100 - equalShare * (count - 1);
                                      const next: { preTax: number; roth: number; afterTax: number } = { preTax: 0, roth: 0, afterTax: 0 };
                                      activeKeys.forEach((k, i) => { next[k] = i === 0 ? remainder : equalShare; });
                                      setSourceAllocation(next);
                                    } else {
                                      const next = { ...current, [opt.key]: 0 };
                                      const remainingKeys = keys.filter((k) => next[k] > 0);
                                      if (remainingKeys.length === 0) {
                                        setSourceAllocation({ preTax: 100, roth: 0, afterTax: 0 });
                                      } else {
                                        const total = remainingKeys.reduce((s, k) => s + next[k], 0);
                                        const scale = total > 0 ? 100 / total : 1;
                                        remainingKeys.forEach((k) => { next[k] = Math.round(next[k] * scale * 10) / 10; });
                                        const diff = 100 - remainingKeys.reduce((s, k) => s + next[k], 0);
                                        if (diff !== 0 && remainingKeys[0]) next[remainingKeys[0]] += diff;
                                        setSourceAllocation(next);
                                      }
                                    }
                                  }}
                                  className="h-4 w-4 shrink-0 rounded cursor-pointer disabled:cursor-not-allowed"
                                  style={{ accentColor: "var(--enroll-brand)" }}
                                />
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm" style={{ color: "var(--enroll-text-primary)" }}>
                                    <span className="font-semibold">{opt.main}</span>
                                    {opt.sub && <span className="font-normal" style={{ color: "var(--enroll-text-muted)" }}> {opt.sub}</span>}
                                  </span>
                                </div>
                              </label>
                              <div
                                className="inline-flex w-24 shrink-0 overflow-hidden rounded-lg transition-colors"
                                style={{ border: "1px solid var(--enroll-card-border)", background: "var(--enroll-card-bg)" }}
                              >
                                <input
                                  type="number"
                                  value={displayValue}
                                  onChange={(e) => {
                                    const v = parseFloat(e.target.value);
                                    if (state.sourcesViewMode === "percent") {
                                      handleSourcePercentChange(opt.key, isNaN(v) ? 0 : v);
                                    } else if (salary > 0 && !isNaN(v) && v >= 0) {
                                      const paycheckTotalVal = annualAmount / PAYCHECKS_PER_YEAR;
                                      const pct = paycheckTotalVal > 0 ? (v / paycheckTotalVal) * 100 : 0;
                                      handleSourcePercentChange(opt.key, Math.min(100, Math.max(0, pct)));
                                    } else if (e.target.value === "") {
                                      handleSourcePercentChange(opt.key, 0);
                                    }
                                  }}
                                  min="0"
                                  max={state.sourcesViewMode === "percent" ? "100" : undefined}
                                  disabled={state.sourceAllocation[opt.key] === 0 || !state.sourcesEditMode}
                                  className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  style={{ color: "var(--enroll-text-primary)" }}
                                />
                                <span
                                  className="flex shrink-0 items-center px-2.5 py-2 text-sm font-medium"
                                  style={{ background: "var(--enroll-soft-bg)", color: "var(--enroll-text-secondary)" }}
                                >
                                  {state.sourcesViewMode === "percent" ? "%" : "$"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {sourceTotal !== 100 && (
                        <p className="mt-2 text-sm text-red-600">Total must equal 100%</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </motion.div>

        {/* ═══ RIGHT: Projection Panel (1 col) ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Projected retirement value */}
            <div className="p-6 md:p-8" style={cardStyle}>
              <h3
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: "var(--enroll-text-muted)" }}
              >
                Projected at retirement
              </h3>
              <motion.p
                key={Math.round(projectedTotal)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold"
                style={{ color: "var(--enroll-text-primary)" }}
              >
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(projectedTotal)}
              </motion.p>
              <p className="text-xs mt-1" style={{ color: "var(--enroll-text-muted)" }}>
                By age {retirementAge} ({retirementAge - currentAge} years)
              </p>

              <div
                className="mt-6 rounded-xl p-4"
                style={{
                  background: "rgb(var(--enroll-brand-rgb) / 0.04)",
                  border: "1px solid rgb(var(--enroll-brand-rgb) / 0.08)",
                }}
              >
                <div className="min-h-[180px]">
                  <ProjectionLineChart baseline={projectionBaseline.dataPoints} />
                </div>
              </div>

              <p className="text-[10px] leading-relaxed mt-3" style={{ color: "var(--enroll-text-muted)" }}>
                Assumes {state.assumptions.annualReturnRate}% annual return, {state.assumptions.inflationRate}% inflation.
              </p>
            </div>

            {/* Paycheck summary card */}
            <div
              className="p-6"
              style={{
                ...cardStyle,
                background: "rgb(var(--enroll-brand-rgb) / 0.04)",
                border: "1px solid rgb(var(--enroll-brand-rgb) / 0.1)",
              }}
            >
              <h3
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--enroll-brand)" }}
              >
                Per paycheck (bi-weekly)
              </h3>
              <p className="text-2xl font-bold" style={{ color: "var(--enroll-text-primary)" }}>
                {formatCurrency(perPaycheck)}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--enroll-text-secondary)" }}>
                {formatCurrency(monthlyAmount)}/month. Pre-tax deduction lowers your taxable income.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <EnrollmentFooter
        step={1}
        primaryLabel="Continue to Auto Increase"
        primaryDisabled={!canContinue}
        onPrimary={handleNext}
        summaryText={summaryText}
        getDraftSnapshot={() => ({
          contributionType: "percentage",
          contributionAmount: contributionPct,
          sourceAllocation: state.sourceAllocation,
        })}
      />
    </EnrollmentPageContent>
  );
};

/* ── Helper sub-component ── */

function PaycheckCell({ label, value, colorVar }: { label: string; value: string; colorVar: string }) {
  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{
        background: `rgb(var(${colorVar}) / 0.06)`,
        border: `1px solid rgb(var(${colorVar}) / 0.12)`,
      }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>{label}</p>
      <p className="text-lg font-bold mt-1" style={{ color: `rgb(var(${colorVar}))` }}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Projection Line Chart (unchanged logic)
   ═══════════════════════════════════════════════════════════════ */

const formatTooltipCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

function ProjectionLineChart({ baseline }: { baseline: ProjectionDataPoint[] }) {
  const [tooltip, setTooltip] = useState<{ index: number; x: number; y: number } | null>(null);
  const points = baseline.length;
  if (points === 0) return <div className="flex items-center justify-center min-h-[160px] text-sm" style={{ color: "var(--enroll-text-muted)" }}>No data</div>;

  const maxBalance = Math.max(...baseline.map((p) => p.balance));
  const yTicks = getYAxisTicks(maxBalance);
  const yMax = yTicks[yTicks.length - 1] ?? maxBalance;
  const minBalance = 0;
  const range = yMax - minBalance || 1;
  const w = 400;
  const h = 200;
  const padding = { top: 20, right: 12, bottom: 32, left: 56 };

  const xScale = (i: number) => padding.left + (i / Math.max(0, points - 1)) * (w - padding.left - padding.right);
  const yScale = (v: number) => h - padding.bottom - ((v - minBalance) / range) * (h - padding.top - padding.bottom);

  const chartWidth = w - padding.left - padding.right;
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * w;
    const index = Math.max(0, Math.min(points - 1, Math.round(((svgX - padding.left) / chartWidth) * (points - 1))));
    setTooltip({ index, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const path = baseline
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p.balance)}`)
    .join(" ");

  const areaPath = `${path} L ${xScale(points - 1)} ${h - padding.bottom} L ${padding.left} ${h - padding.bottom} Z`;
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="contrib-chart block w-full"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="contrib-chart-gradient-baseline" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--enroll-brand)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--enroll-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((v, i) => (
          <line key={i} x1={padding.left} y1={yScale(v)} x2={w - padding.right} y2={yScale(v)} className="contrib-chart-grid-line" strokeDasharray="3 3" strokeWidth="1" />
        ))}

        <g fill="currentColor" className="contrib-chart-axis-text">
          {yTicks.map((v, i) => (
            <text key={i} x={padding.left - 8} y={yScale(v)} textAnchor="end" dominantBaseline="middle" fontSize="10">{formatYAxisLabel(v)}</text>
          ))}
        </g>

        <g fill="currentColor" className="contrib-chart-axis-text">
          <text x={xScale(0)} y={h - 10} textAnchor="start" fontSize="10">{currentYear}</text>
          <text x={xScale(baseline.length - 1)} y={h - 10} textAnchor="end" fontSize="10">{currentYear + baseline[baseline.length - 1].year}</text>
        </g>

        <path d={areaPath} fill="url(#contrib-chart-gradient-baseline)" />
        <path d={path} fill="none" stroke="var(--enroll-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg px-3 py-2 text-sm"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            transform: "translate(0, -50%)",
            background: "var(--enroll-card-bg)",
            border: "1px solid var(--enroll-card-border)",
            boxShadow: "var(--enroll-elevation-2)",
          }}
        >
          <div className="font-medium" style={{ color: "var(--enroll-text-primary)" }}>
            Year {new Date().getFullYear() + baseline[tooltip.index].year}
          </div>
          <div className="font-semibold" style={{ color: "var(--enroll-brand)" }}>
            {formatTooltipCurrency(baseline[tooltip.index].balance)}
          </div>
        </div>
      )}
    </div>
  );
}

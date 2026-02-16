import { useMemo, useState, useCallback } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useEnrollment } from "../../enrollment/context/EnrollmentContext";
import { EnrollmentFooter } from "../../components/enrollment/EnrollmentFooter";
import { InvestmentProfileWizard } from "../../components/enrollment/InvestmentProfileWizard";
import {
  PAYCHECKS_PER_YEAR,
  percentageToAnnualAmount,
  annualAmountToPercentage,
  deriveContribution,
} from "../../enrollment/logic/contributionCalculator";
import { calculateProjection } from "../../enrollment/logic/projectionCalculator";
import type { ProjectionDataPoint } from "../../enrollment/logic/types";
import { formatYAxisLabel, getYAxisTicks } from "../../utils/projectionChartAxis";
import type { IncrementCycle } from "../../enrollment/logic/types";

/**
 * Auto Increase — Figma 551-722
 * Two-column layout: left = config, right = Paycheck Impact + Projection Chart.
 */
export const FutureContributions = () => {
  const navigate = useNavigate();
  const { state, setAutoIncrease, setContributionAmount } = useEnrollment();
  const [increaseViewMode, setIncreaseViewMode] = useState<"percent" | "dollar">("percent");

  const salary = state.salary || 75000;
  const currentAge = state.currentAge || 40;
  const retirementAge = state.retirementAge || 67;
  const currentBalance = state.currentBalance || 0;
  const contributionPct =
    state.contributionType === "percentage"
      ? state.contributionAmount
      : salary > 0
        ? annualAmountToPercentage(salary, state.contributionAmount * PAYCHECKS_PER_YEAR)
        : 0;

  const contributionDollarPerPaycheck =
    salary > 0 && contributionPct > 0
      ? percentageToAnnualAmount(salary, contributionPct) / PAYCHECKS_PER_YEAR
      : 0;

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
    [
      contributionPct,
      salary,
      state.employerMatchEnabled,
      state.assumptions.employerMatchCap,
      state.assumptions.employerMatchPercentage,
      currentAge,
      retirementAge,
    ]
  );

  const projectionBaseline = useMemo(
    () =>
      calculateProjection({
        currentAge,
        retirementAge,
        currentBalance,
        monthlyContribution: derived.monthlyContribution ?? 0,
        employerMatch: state.employerMatchEnabled ? derived.employerMatchMonthly : 0,
        annualReturnRate: state.assumptions.annualReturnRate,
        inflationRate: state.assumptions.inflationRate,
      }),
    [
      currentAge,
      retirementAge,
      currentBalance,
      derived.monthlyContribution,
      derived.employerMatchMonthly,
      state.employerMatchEnabled,
      state.assumptions.annualReturnRate,
      state.assumptions.inflationRate,
    ]
  );

  const projectionWithAuto = useMemo(() => {
    if (!state.autoIncrease.enabled) return null;
    const pct = state.autoIncrease.percentage;
    return calculateProjection({
      currentAge,
      retirementAge,
      currentBalance,
      monthlyContribution: derived.monthlyContribution ?? 0,
      employerMatch: state.employerMatchEnabled ? derived.employerMatchMonthly : 0,
      annualReturnRate: state.assumptions.annualReturnRate,
      inflationRate: state.assumptions.inflationRate,
      autoIncrease: {
        enabled: true,
        initialPercentage: contributionPct,
        increasePercentage: pct,
        maxPercentage: state.autoIncrease.maxPercentage,
        salary,
        contributionType: "percentage",
        assumptions: state.assumptions,
      },
    });
  }, [
    state.autoIncrease.enabled,
    state.autoIncrease.percentage,
    state.autoIncrease.maxPercentage,
    contributionPct,
    salary,
    currentAge,
    retirementAge,
    currentBalance,
    derived.monthlyContribution,
    derived.employerMatchMonthly,
    state.employerMatchEnabled,
    state.assumptions,
  ]);

  const perPaycheck =
    salary > 0 && contributionPct > 0
      ? percentageToAnnualAmount(salary, contributionPct) / PAYCHECKS_PER_YEAR
      : 0;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number.isFinite(n) && n >= 0 ? n : 0);

  const [showInvestmentWizard, setShowInvestmentWizard] = useState(false);

  const handleContinue = useCallback(() => {
    if (state.investmentProfileCompleted) {
      navigate("/enrollment/investments");
    } else {
      setShowInvestmentWizard(true);
    }
  }, [state.investmentProfileCompleted, navigate]);

  const handleWizardComplete = useCallback(() => {
    setShowInvestmentWizard(false);
  }, []);

  const handleContributionPctChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    const pct = e.target.value === "" ? 0 : Math.min(100, Math.max(0, isNaN(v) ? 0 : v));
    setContributionAmount(pct);
  };

  const handleContributionDollarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (salary > 0 && !isNaN(v) && v >= 0) {
      const annual = v * PAYCHECKS_PER_YEAR;
      const pct = (annual / salary) * 100;
      setContributionAmount(Math.min(100, Math.max(0, pct)));
    } else if (e.target.value === "") {
      setContributionAmount(0);
    }
  };

  const handleIncreaseChange = (source: "preTax" | "roth" | "afterTax", value: number) => {
    setAutoIncrease({
      preTaxIncrease: source === "preTax" ? value : state.autoIncrease.preTaxIncrease,
      rothIncrease: source === "roth" ? value : state.autoIncrease.rothIncrease,
      afterTaxIncrease: source === "afterTax" ? value : state.autoIncrease.afterTaxIncrease,
      percentage: value,
    });
  };

  const ai = state.autoIncrease;

  if (contributionPct <= 0) {
    return <Navigate to="/enrollment/contribution" replace />;
  }

  return (
    <>
      <div className="future-contributions">
        <div className="future-contributions__grid">
          {/* Left: Auto-Increase Configuration — Figma 551-722 */}
          <div className="future-contributions__left">
            <article className="future-contributions__card">
              {/* Enable Auto-Increase: heading + toggle on same line */}
              <div className="future-contributions__enable-row">
                <div>
                  <h3 className="future-contributions__enable-title">Enable Auto-Increase</h3>
                  <p className="future-contributions__enable-desc">
                    Your contribution will increase slightly once per year. You can change this anytime.
                  </p>
                </div>
                <label className="future-contributions__toggle">
                  <input
                    type="checkbox"
                    checked={ai.enabled}
                    onChange={(e) => setAutoIncrease({ enabled: e.target.checked })}
                    className="future-contributions__toggle-input"
                  />
                  <span className="future-contributions__toggle-track" />
                </label>
              </div>

              {/* Contribution inputs: % and $ side-by-side */}
              <div className="future-contributions__contribution-inputs">
                <div className="future-contributions__input-wrap">
                  <input
                    type="number"
                    value={contributionPct > 0 ? Math.round(contributionPct) : ""}
                    onChange={handleContributionPctChange}
                    min="0"
                    max="100"
                    className="future-contributions__input"
                    aria-label="Contribution percentage"
                  />
                  <span className="future-contributions__input-suffix">%</span>
                </div>
                <div className="future-contributions__input-wrap">
                  <input
                    type="number"
                    value={contributionDollarPerPaycheck > 0 ? Math.round(contributionDollarPerPaycheck) : ""}
                    onChange={handleContributionDollarChange}
                    min="0"
                    className="future-contributions__input"
                    aria-label="Contribution per paycheck (dollar)"
                  />
                  <span className="future-contributions__input-suffix">$</span>
                </div>
              </div>

              {/* Automatic Annual Increase info card */}
              <div className="future-contributions__info-card">
                <h4 className="future-contributions__info-title">Automatic Annual Increase</h4>
                <p className="future-contributions__info-text">
                  Small increases are designed to feel manageable and often align with pay raises.
                </p>
              </div>

              {/* Increment cycle pills */}
              <div className="future-contributions__increment-row">
                <span className="future-contributions__increment-label">Increment cycle :</span>
                <div className="future-contributions__increment-pills">
                  {(["calendar_year", "plan_enroll_date", "plan_year"] as IncrementCycle[]).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                        ai.incrementCycle === cycle
                          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
                      }`}
                      onClick={() => setAutoIncrease({ incrementCycle: cycle })}
                    >
                      {cycle === "calendar_year" && "Calendar Year"}
                      {cycle === "plan_enroll_date" && "Plan Enroll Date"}
                      {cycle === "plan_year" && "Plan Year"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contribution type rows with %/$ toggle */}
              <div className="future-contributions__increase-section">
                <div className="future-contributions__view-mode">
                  <button
                    type="button"
                    className={`future-contributions__view-btn ${increaseViewMode === "percent" ? "future-contributions__view-btn--active" : ""}`}
                    onClick={() => setIncreaseViewMode("percent")}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    className={`future-contributions__view-btn ${increaseViewMode === "dollar" ? "future-contributions__view-btn--active" : ""}`}
                    onClick={() => setIncreaseViewMode("dollar")}
                  >
                    $
                  </button>
                </div>

                {[
                  { key: "preTax" as const, label: "Pre-tax (default)", value: ai.preTaxIncrease ?? 0 },
                  { key: "roth" as const, label: "Roth (after-tax, tax-free growth)", value: ai.rothIncrease ?? 0 },
                  { key: "afterTax" as const, label: "After-tax (non-Roth)", value: ai.afterTaxIncrease ?? 0 },
                ].map(({ key, label, value }) => {
                  const dollarPerPaycheck =
                    increaseViewMode === "dollar" && salary > 0 && value > 0
                      ? (salary * (value / 100)) / PAYCHECKS_PER_YEAR
                      : 0;
                  const displayValue =
                    increaseViewMode === "percent"
                      ? value > 0 ? value : ""
                      : value > 0 ? Math.round(dollarPerPaycheck) : "";
                  return (
                    <div key={key} className="future-contributions__source-row">
                      <label className="future-contributions__source-checkbox">
                        <input type="checkbox" defaultChecked />
                        <span className="future-contributions__checkbox-box" aria-hidden />
                      </label>
                      <div className="future-contributions__source-content">
                        <span className="future-contributions__source-label">{label}</span>
                        <span className="future-contributions__source-range">Min 1% - Max 100%</span>
                      </div>
                      <div className="inline-flex w-28 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:focus-within:border-blue-400 dark:focus-within:ring-blue-500/30">
                        <input
                          type="number"
                          value={displayValue}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const num = raw === "" ? 0 : parseFloat(raw);
                            if (increaseViewMode === "percent") {
                              handleIncreaseChange(key, Number.isNaN(num) ? 0 : Math.min(100, Math.max(0, num)));
                            } else if (salary > 0 && !Number.isNaN(num) && num >= 0) {
                              const paycheckTotalVal = salary / PAYCHECKS_PER_YEAR;
                              const pct = paycheckTotalVal > 0 ? (num / paycheckTotalVal) * 100 : 0;
                              handleIncreaseChange(key, Math.min(100, Math.max(0, pct)));
                            } else if (raw === "") {
                              handleIncreaseChange(key, 0);
                            }
                          }}
                          min="0"
                          max={increaseViewMode === "percent" ? "100" : undefined}
                          step={increaseViewMode === "percent" ? "0.5" : "1"}
                          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-100 dark:placeholder-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label={`${label} increase ${increaseViewMode === "percent" ? "percentage" : "dollar amount"}`}
                        />
                        <span className="flex shrink-0 items-center bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                          {increaseViewMode === "percent" ? "%" : "$"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link to="/enrollment/contribution" className="future-contributions__link">
                Set up your future contributions →
              </Link>
            </article>
          </div>

          {/* Right: Paycheck Impact + Projection Chart */}
          <div className="future-contributions__right">
            {/* Paycheck Impact card */}
            <article className="future-contributions__card">
              <h3 className="future-contributions__card-title">Your Paycheck Impact</h3>
              <div className="future-contributions__metrics-row">
                <div className="future-contributions__metric-box">
                  <p className="future-contributions__metric-label">CONTRIBUTION RATE</p>
                  <p className="future-contributions__metric-value future-contributions__metric-value--blue">
                    {contributionPct}% of gross
                  </p>
                </div>
                <div className="future-contributions__metric-box">
                  <p className="future-contributions__metric-label">PER PAYCHECK (BI-WEEKLY)</p>
                  <p className="future-contributions__metric-value future-contributions__metric-value--blue">
                    {formatCurrency(perPaycheck)}
                  </p>
                </div>
              </div>
              <div className="future-contributions__disclaimer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>
                  Based on {formatCurrency(salary)} annual salary. Actual tax savings may reduce your take-home impact.
                </span>
              </div>
            </article>

            {/* Projection Chart card */}
            <article className="future-contributions__card">
              <h3 className="future-contributions__card-title">Projection Chart</h3>
              <div className="future-contributions__chart-wrap">
                <ProjectionChart
                  baseline={projectionBaseline.dataPoints}
                  withAutoIncrease={projectionWithAuto?.dataPoints ?? null}
                />
              </div>
              <div className="future-contributions__legend">
                <span className="future-contributions__legend-item">
                  <span className="future-contributions__legend-dot future-contributions__legend-dot--blue" />
                  Contribution only
                </span>
                <span className="future-contributions__legend-item">
                  <span className="future-contributions__legend-dot future-contributions__legend-dot--green" />
                  Contribution + Annual increase
                </span>
              </div>
              <p className="future-contributions__chart-disclaimer">
                Assumes {state.assumptions.annualReturnRate}% annual return. Actual results may vary.
              </p>
            </article>
          </div>
        </div>

        <EnrollmentFooter
          step={2}
          primaryLabel="Continue to Investment Election"
          onPrimary={handleContinue}
          summaryText={`Projected balance at age ${retirementAge}: ${formatCurrency(
            projectionWithAuto?.finalBalance ?? projectionBaseline.finalBalance
          )}`}
        />
      </div>

      {showInvestmentWizard && (
        <InvestmentProfileWizard
          isOpen={showInvestmentWizard}
          onClose={() => setShowInvestmentWizard(false)}
          onComplete={handleWizardComplete}
        />
      )}
    </>
  );
};

const formatTooltipCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

function ProjectionChart({
  baseline,
  withAutoIncrease,
}: {
  baseline: ProjectionDataPoint[];
  withAutoIncrease: ProjectionDataPoint[] | null;
}) {
  const [tooltip, setTooltip] = useState<{ index: number; x: number; y: number } | null>(null);

  if (baseline.length === 0) {
    return (
      <div className="future-contributions__chart-empty">
        No projection data
      </div>
    );
  }

  const maxBalance = Math.max(
    ...baseline.map((p) => p.balance),
    ...(withAutoIncrease ?? []).map((p) => p.balance)
  );
  const yTicks = getYAxisTicks(maxBalance);
  const yMax = yTicks[yTicks.length - 1] ?? maxBalance;

  const minBalance = 0;
  const range = yMax - minBalance || 1;
  const w = 480;
  const h = 260;
  const padding = { top: 20, right: 20, bottom: 36, left: 56 };

  const xScale = (i: number) =>
    padding.left + (i / Math.max(0, baseline.length - 1)) * (w - padding.left - padding.right);
  const yScale = (v: number) =>
    h - padding.bottom - ((v - minBalance) / range) * (h - padding.top - padding.bottom);

  const chartWidth = w - padding.left - padding.right;
  const points = baseline.length;
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * w;
    const index = Math.max(0, Math.min(points - 1, Math.round(((svgX - padding.left) / chartWidth) * (points - 1))));
    setTooltip({ index, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const baselinePath = baseline
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p.balance)}`)
    .join(" ");

  const autoPath =
    withAutoIncrease &&
    withAutoIncrease
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p.balance)}`)
      .join(" ");

  const areaPath = `${baselinePath} L ${xScale(baseline.length - 1)} ${h - padding.bottom} L ${padding.left} ${h - padding.bottom} Z`;

  const autoAreaPath =
    withAutoIncrease &&
    autoPath &&
    `${autoPath} L ${xScale((withAutoIncrease?.length ?? 1) - 1)} ${h - padding.bottom} L ${padding.left} ${h - padding.bottom} Z`;

  const xLabels = ["Now", "5 yrs", "10 yrs", "15 yrs", "20 yrs", "25 yrs", "30 yrs"];
  const maxIdx = Math.max(0, baseline.length - 1);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="future-contributions__chart-svg"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
      <defs>
        <linearGradient id="fc-chart-baseline" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fc-chart-auto" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {yTicks.map((v, i) => (
        <line
          key={`grid-${i}`}
          x1={padding.left}
          y1={yScale(v)}
          x2={w - padding.right}
          y2={yScale(v)}
          className="future-contributions__chart-grid"
          strokeDasharray="3 3"
          strokeWidth="1"
        />
      ))}

      {/* Y-axis labels */}
      <g fill="currentColor" className="future-contributions__chart-axis">
        {yTicks.map((v, i) => (
          <text key={i} x={padding.left - 8} y={yScale(v)} textAnchor="end" dominantBaseline="middle" fontSize="10">
            {formatYAxisLabel(v)}
          </text>
        ))}
      </g>

      {/* Axis labels */}
      <text x={padding.left - 8} y={14} textAnchor="end" fontSize="9" className="future-contributions__chart-axis-label">
        Projected Balance
      </text>
      <text x={(padding.left + w - padding.right) / 2} y={h - 4} textAnchor="middle" fontSize="9" className="future-contributions__chart-axis-label">
        Years
      </text>

      {/* X-axis labels */}
      <g fill="currentColor" className="future-contributions__chart-axis">
        {xLabels.map((label, i) => {
          const idx = maxIdx > 0 ? (i / (xLabels.length - 1)) * maxIdx : 0;
          const x = xScale(idx);
          return (
            <text key={i} x={x} y={h - 10} textAnchor="middle" fontSize="10">
              {label}
            </text>
          );
        })}
      </g>

      <path d={areaPath} fill="url(#fc-chart-baseline)" />
      <path
        d={baselinePath}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {withAutoIncrease && autoPath && (
        <>
          <path d={autoAreaPath} fill="url(#fc-chart-auto)" />
          <path
            d={autoPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {/* Data point markers at 5-year intervals */}
      {[0, 5, 10, 15, 20, 25, 30]
        .filter((year) => year < baseline.length)
        .map((idx) => {
          const pt = baseline[idx];
          return (
            <circle key={`b-${idx}`} cx={xScale(idx)} cy={yScale(pt.balance)} r="4" fill="#2563eb" />
          );
        })}
      {withAutoIncrease &&
        [0, 5, 10, 15, 20, 25, 30]
          .filter((year) => year < withAutoIncrease.length)
          .map((idx) => {
            const pt = withAutoIncrease[idx];
            return (
              <circle key={`a-${idx}`} cx={xScale(idx)} cy={yScale(pt.balance)} r="4" fill="#10b981" />
            );
          })}
      </svg>
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:shadow-black/50"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12, transform: "translate(0, -50%)" }}
        >
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {tooltip.index === 0 ? "Now" : `${tooltip.index} yrs`}
          </div>
          <div className="text-blue-600 dark:text-blue-400">
            {formatTooltipCurrency(baseline[tooltip.index].balance)}
          </div>
          {withAutoIncrease && tooltip.index < withAutoIncrease.length && (
            <div className="text-emerald-600 dark:text-emerald-400">
              w/ Auto: {formatTooltipCurrency(withAutoIncrease[tooltip.index].balance)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

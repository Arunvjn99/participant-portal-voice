import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { AllocationChart } from "../../components/investments/AllocationChart";
import { MOCK_ENROLLMENT_SUMMARY } from "../../data/enrollmentSummary";
import type { EnrollmentSummary, Transaction } from "../../data/enrollmentSummary";

/* ═══════════════════════════════════════════════════════
   SHARED STYLES & HOOKS
   ═══════════════════════════════════════════════════════ */

const cardStyle: React.CSSProperties = {
  background: "var(--enroll-card-bg)",
  border: "1px solid var(--enroll-card-border)",
  borderRadius: "var(--enroll-card-radius)",
  boxShadow: "var(--enroll-elevation-2)",
};

function useAnimatedValue(target: number, duration = 700): number {
  const [current, setCurrent] = useState(0);
  const raf = useRef(0);
  const startRef = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    startRef.current = current;
    startTime.current = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(startRef.current + (target - startRef.current) * eased);
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return current;
}

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number.isFinite(n) && n >= 0 ? n : 0);

const fmtDate = (d: string) => {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════ */

export const PostEnrollmentDashboard = () => {
  const navigate = useNavigate();
  const data: EnrollmentSummary = MOCK_ENROLLMENT_SUMMARY;

  const plan = data.planDetails;
  const goal = data.goalProgress;
  const banner = data.topBanner;
  const rateOfReturn = data.rateOfReturn;
  const onTrackPct = banner?.percentOnTrack ?? goal?.percentOnTrack ?? 0;
  const projectedBalance = goal?.projectedBalance ?? 0;
  const totalBalance = plan?.totalBalance ?? 0;
  const retirementAge = goal?.retirementAge ?? 65;
  const currentAge = goal?.currentAge ?? 40;
  const yearsToRetirement = retirementAge - currentAge;

  const allocationForChart = useMemo(
    () => data.investmentAllocations.map((r) => ({ fundId: r.fundId, percentage: r.allocationPct })),
    [data.investmentAllocations]
  );

  return (
    <DashboardLayout header={<DashboardHeader />}>
      <div
        className="w-full min-w-0 space-y-6"
        role="region"
        aria-label="Retirement dashboard"
        style={{ background: "var(--enroll-bg)" }}
      >
        {/* ═══ HERO SECTION ═══ */}
        <HeroSection
          onTrackPct={onTrackPct}
          totalBalance={totalBalance}
          projectedBalance={projectedBalance}
          ytdReturn={plan?.ytdReturn ?? 0}
          yearsToRetirement={yearsToRetirement}
          retirementAge={retirementAge}
          subText={banner?.subText ?? ""}
          actionRoute={banner?.actionRoute ?? "/enrollment/contribution"}
        />

        {/* ═══ MAIN GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── LEFT COLUMN (2 cols) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Plan Overview + Balances */}
            {plan && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="p-6"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--enroll-text-muted)" }}>Your Plan</p>
                    <p className="text-base font-bold mt-0.5" style={{ color: "var(--enroll-text-primary)" }}>{plan.planName}</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgb(var(--enroll-accent-rgb) / 0.08)", color: "var(--enroll-accent)" }}
                  >
                    {plan.employerMatchPct}% up to {plan.employerMatchCap}% match
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total Balance", value: fmtCurrency(plan.totalBalance), highlight: true },
                    { label: "YTD Return", value: `+${plan.ytdReturn}%`, highlight: false },
                    { label: "Contribution", value: `${plan.contributionRate}%`, highlight: false },
                    { label: "Enrolled", value: new Date(plan.enrolledAt + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" }), highlight: false },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="rounded-xl p-3" style={{ background: "var(--enroll-soft-bg)", border: "1px solid var(--enroll-card-border)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>{label}</p>
                      <p className="text-lg font-bold mt-1" style={{ color: highlight ? "var(--enroll-brand)" : "var(--enroll-text-primary)" }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Performance & Momentum */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Growth Chart */}
              <div className="p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--enroll-text-muted)" }}>Growth Trend</p>
                  {rateOfReturn && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--enroll-soft-bg)", color: "var(--enroll-text-muted)" }}>
                      {rateOfReturn.timeRange}
                    </span>
                  )}
                </div>
                <GrowthChart />
                <p className="text-[11px] mt-3" style={{ color: "var(--enroll-text-muted)" }}>
                  {rateOfReturn?.message ?? "Performance data based on your portfolio allocation."}
                </p>
              </div>

              {/* Confidence / Recent Activity */}
              <div className="p-6" style={cardStyle}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "var(--enroll-text-muted)" }}>Recent Activity</p>
                <div className="space-y-2">
                  {data.transactions.slice(0, 4).map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/transactions")}
                  className="text-[11px] font-semibold mt-3 border-none bg-transparent cursor-pointer p-0"
                  style={{ color: "var(--enroll-brand)" }}
                >
                  View all transactions →
                </button>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--enroll-text-muted)" }}>Quick Actions</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: "📊", label: "Change Contribution", desc: "Adjust your savings rate", route: "/enrollment/contribution" },
                  { icon: "🔄", label: "Rebalance Portfolio", desc: "Optimize allocations", route: "/enrollment/investments" },
                  { icon: "💰", label: "Request Loan", desc: "Borrow from your plan", route: "/transactions/applications/loan" },
                  { icon: "📋", label: "View Statements", desc: "Download documents", route: "/transactions" },
                ].map(({ icon, label, desc, route }) => (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={() => navigate(route)}
                    whileHover={{ y: -2, boxShadow: "var(--enroll-elevation-3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-none cursor-pointer text-center transition-colors"
                    style={{ ...cardStyle, boxShadow: "var(--enroll-elevation-1)" }}
                  >
                    <span className="text-2xl">{icon}</span>
                    <p className="text-xs font-bold" style={{ color: "var(--enroll-text-primary)" }}>{label}</p>
                    <p className="text-[10px]" style={{ color: "var(--enroll-text-muted)" }}>{desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Portfolio Table */}
            {data.investmentAllocations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 }}
                className="p-6"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold" style={{ color: "var(--enroll-text-primary)" }}>Investment Holdings</p>
                  <button
                    type="button"
                    onClick={() => navigate("/enrollment/investments")}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full border-none cursor-pointer"
                    style={{ background: "rgb(var(--enroll-brand-rgb) / 0.06)", color: "var(--enroll-brand)" }}
                  >
                    Manage
                  </button>
                </div>
                <div className="space-y-2">
                  {data.investmentAllocations.map((fund, idx) => (
                    <motion.div
                      key={fund.fundId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.05 * idx }}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "var(--enroll-soft-bg)", border: "1px solid var(--enroll-card-border)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono" style={{ background: "rgb(var(--enroll-brand-rgb) / 0.1)", color: "var(--enroll-brand)" }}>
                            {fund.ticker}
                          </span>
                          <span className="text-xs font-semibold truncate" style={{ color: "var(--enroll-text-primary)" }}>{fund.fundName}</span>
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--enroll-text-muted)" }}>
                          {fmtCurrency(fund.balance)} · {fund.allocationPct}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--enroll-card-border)" }}>
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${fund.allocationPct}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * idx }}
                            style={{ background: "var(--enroll-brand)" }}
                          />
                        </div>
                        <span
                          className="text-xs font-bold w-14 text-right"
                          style={{ color: fund.returnPct >= 0 ? "var(--enroll-accent)" : "var(--color-danger, #ef4444)" }}
                        >
                          {fund.returnPct >= 0 ? "+" : ""}{fund.returnPct}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT COLUMN (1 col, sticky) ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* Future Projection Focus */}
              <div
                className="p-6 relative overflow-hidden"
                style={{
                  ...cardStyle,
                  background: "linear-gradient(135deg, var(--enroll-card-bg) 0%, rgb(var(--enroll-brand-rgb) / 0.04) 100%)",
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--enroll-text-muted)" }}>
                  Projected at {retirementAge}
                </p>
                <AnimatedCurrencyDisplay value={projectedBalance} />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgb(var(--enroll-accent-rgb) / 0.06)", color: "var(--enroll-accent)" }}>
                    {yearsToRetirement} years
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--enroll-soft-bg)", color: "var(--enroll-text-muted)" }}>
                    ${goal?.monthlyContribution?.toLocaleString() ?? 0}/mo
                  </span>
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: "var(--enroll-text-secondary)" }}>
                  Based on your current contribution rate and portfolio allocation. Increase contributions to accelerate growth.
                </p>
              </div>

              {/* Allocation Summary */}
              {data.investmentAllocations.length > 0 && (
                <div className="p-6" style={cardStyle}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "var(--enroll-text-muted)" }}>
                    Portfolio Allocation
                  </p>
                  <AllocationChart allocations={allocationForChart} centerLabel="Allocated" showValidBadge={false} />
                  {data.allocationDescription && (
                    <div
                      className="flex items-start gap-2 mt-4 p-3 rounded-xl"
                      style={{ background: "rgb(var(--enroll-brand-rgb) / 0.04)", border: "1px solid rgb(var(--enroll-brand-rgb) / 0.08)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--enroll-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                        <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
                      </svg>
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--enroll-text-secondary)" }}>
                        {data.allocationDescription}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Confidence Meter */}
              {rateOfReturn && (
                <div className="p-5" style={cardStyle}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--enroll-text-muted)" }}>Portfolio Confidence</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--enroll-card-border)" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="40" fill="none"
                          stroke="var(--enroll-accent)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="251.2"
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 * (1 - rateOfReturn.confidencePct / 100) }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold" style={{ color: "var(--enroll-accent)" }}>{rateOfReturn.confidencePct}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--enroll-text-primary)" }}>Strong</p>
                      <p className="text-[11px]" style={{ color: "var(--enroll-text-muted)" }}>{rateOfReturn.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Inspirational */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center py-4"
              >
                <p className="text-sm italic" style={{ color: "var(--enroll-text-muted)", opacity: 0.7 }}>
                  "Time is your most powerful asset."
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ═══ NEED HELP ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="flex items-center justify-between gap-4 p-5"
          style={{
            ...cardStyle,
            background: "rgb(var(--enroll-brand-rgb) / 0.03)",
            border: "1px solid rgb(var(--enroll-brand-rgb) / 0.08)",
          }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--enroll-text-primary)" }}>Need help deciding?</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--enroll-text-muted)" }}>
              Our advisors are available to discuss which plan is right for your financial goals.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/investments")}
            className="text-xs font-semibold px-4 py-2 rounded-xl border-none cursor-pointer shrink-0"
            style={{ background: "var(--enroll-brand)", color: "white" }}
          >
            Schedule consultation
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

/* ═══════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════ */

function HeroSection({
  onTrackPct,
  totalBalance,
  projectedBalance,
  ytdReturn,
  yearsToRetirement,
  retirementAge,
  subText,
  actionRoute,
}: {
  onTrackPct: number;
  totalBalance: number;
  projectedBalance: number;
  ytdReturn: number;
  yearsToRetirement: number;
  retirementAge: number;
  subText: string;
  actionRoute: string;
}) {
  const navigate = useNavigate();
  const animatedPct = useAnimatedValue(onTrackPct);
  const animatedBalance = useAnimatedValue(totalBalance, 900);

  const arcRadius = 54;
  const circumference = 2 * Math.PI * arcRadius;
  const arcLength = circumference * 0.75;
  const arcOffset = arcLength * (1 - onTrackPct / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-8 relative overflow-hidden"
      style={{
        ...cardStyle,
        background: "linear-gradient(135deg, var(--enroll-card-bg) 0%, rgb(var(--enroll-brand-rgb) / 0.05) 50%, rgb(var(--enroll-accent-rgb) / 0.03) 100%)",
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(circle at 80% 20%, rgb(var(--enroll-brand-rgb) / 0.06) 0%, transparent 60%)" }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        {/* Progress Arc */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 mx-auto md:mx-0">
          <svg viewBox="0 0 120 120" className="w-full h-full" style={{ transform: "rotate(135deg)" }}>
            <circle
              cx="60" cy="60" r={arcRadius}
              fill="none"
              stroke="var(--enroll-card-border)"
              strokeWidth="9"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />
            <motion.circle
              cx="60" cy="60" r={arcRadius}
              fill="none"
              stroke="var(--enroll-brand)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
              initial={{ strokeDashoffset: arcLength }}
              animate={{ strokeDashoffset: arcOffset }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: "translateY(-4px)" }}>
            <span className="text-2xl md:text-3xl font-bold" style={{ color: "var(--enroll-text-primary)" }}>
              {Math.round(animatedPct)}%
            </span>
            <span className="text-[9px] font-semibold" style={{ color: "var(--enroll-text-muted)" }}>on track</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--enroll-text-muted)" }}>
            Your Retirement Progress
          </p>
          <h2 className="text-xl md:text-2xl font-bold leading-snug" style={{ color: "var(--enroll-text-primary)" }}>
            You're {onTrackPct}% on track for retirement.
          </h2>
          <p className="text-sm mt-1 mb-3" style={{ color: "var(--enroll-text-secondary)" }}>{subText}</p>

          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
            <div className="rounded-xl px-3 py-2" style={{ background: "var(--enroll-soft-bg)", border: "1px solid var(--enroll-card-border)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>Balance</p>
              <p className="text-base font-bold" style={{ color: "var(--enroll-brand)" }}>{fmtCurrency(animatedBalance)}</p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ background: "var(--enroll-soft-bg)", border: "1px solid var(--enroll-card-border)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--enroll-text-muted)" }}>YTD Return</p>
              <p className="text-base font-bold" style={{ color: "var(--enroll-accent)" }}>+{ytdReturn}%</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(actionRoute)}
              className="text-xs font-semibold px-4 py-2 rounded-xl border-none cursor-pointer transition-colors"
              style={{ background: "var(--enroll-brand)", color: "white", boxShadow: "0 4px 12px rgb(var(--enroll-brand-rgb) / 0.2)" }}
            >
              Take Action
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   ANIMATED CURRENCY DISPLAY
   ═══════════════════════════════════════════════════════ */

function AnimatedCurrencyDisplay({ value }: { value: number }) {
  const animatedVal = useAnimatedValue(value, 900);
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="text-3xl font-bold"
      style={{ color: "var(--enroll-text-primary)" }}
    >
      {fmtCurrency(animatedVal)}
    </motion.p>
  );
}

/* ═══════════════════════════════════════════════════════
   GROWTH CHART (Simple animated SVG)
   ═══════════════════════════════════════════════════════ */

function GrowthChart() {
  const points = [10, 14, 12, 18, 22, 20, 28, 32, 30, 38, 42, 48];
  const w = 300;
  const h = 120;
  const pad = { top: 8, right: 8, bottom: 8, left: 8 };
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const range = maxVal - minVal || 1;

  const xScale = (i: number) => pad.left + (i / (points.length - 1)) * (w - pad.left - pad.right);
  const yScale = (v: number) => h - pad.bottom - ((v - minVal) / range) * (h - pad.top - pad.bottom);

  const linePath = points.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`).join(" ");
  const areaPath = `${linePath} L ${xScale(points.length - 1)} ${h - pad.bottom} L ${pad.left} ${h - pad.bottom} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="dash-growth-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--enroll-accent)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--enroll-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#dash-growth-grad)" />
      <motion.path
        d={linePath}
        fill="none"
        stroke="var(--enroll-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
      />
      <circle cx={xScale(points.length - 1)} cy={yScale(points[points.length - 1])} r="3" fill="var(--enroll-accent)" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   TRANSACTION ROW
   ═══════════════════════════════════════════════════════ */

function TransactionRow({ tx }: { tx: Transaction }) {
  const iconMap: Record<string, string> = {
    contribution: "💰",
    "employer-match": "🤝",
    fee: "📋",
    dividend: "📈",
    "loan-repayment": "🔄",
  };

  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-xl"
      style={{ background: "var(--enroll-soft-bg)", border: "1px solid var(--enroll-card-border)" }}
    >
      <span className="text-base shrink-0">{iconMap[tx.type] ?? "💰"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: "var(--enroll-text-primary)" }}>{tx.description}</p>
        <p className="text-[10px]" style={{ color: "var(--enroll-text-muted)" }}>{fmtDate(tx.date)}</p>
      </div>
      <span
        className="text-xs font-bold shrink-0"
        style={{ color: tx.amount >= 0 ? "var(--enroll-accent)" : "var(--color-danger, #ef4444)" }}
      >
        {tx.amount >= 0 ? "+" : ""}{fmtCurrency(Math.abs(tx.amount))}
      </span>
    </div>
  );
}

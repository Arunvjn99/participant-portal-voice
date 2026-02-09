import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PostEnrollmentTopBanner } from "../../components/dashboard/PostEnrollmentTopBanner";
import { PlanOverviewCard } from "../../components/dashboard/PlanOverviewCard";
import { GoalSimulatorCard } from "../../components/dashboard/GoalSimulatorCard";
import { QuickActionsCard } from "../../components/dashboard/QuickActionsCard";
import { RecentTransactionsCard } from "../../components/dashboard/RecentTransactionsCard";
import { RateOfReturnCard } from "../../components/dashboard/RateOfReturnCard";
import { PortfolioTable } from "../../components/dashboard/PortfolioTable";
import { BottomActionCards } from "../../components/dashboard/BottomActionCards";
import { LearningHub } from "../../components/dashboard/LearningHub";
import { OnboardingProgressCard } from "../../components/dashboard/OnboardingProgressCard";
import { AllocationChart } from "../../components/investments/AllocationChart";
import { MOCK_ENROLLMENT_SUMMARY } from "../../data/enrollmentSummary";
import type { EnrollmentSummary } from "../../data/enrollmentSummary";

/**
 * Post-Enrollment Dashboard — Figma 595-1517
 *
 * Layout (SINGLE SOURCE OF TRUTH: Figma):
 * - Two-column grid: left ~65%, right ~35%
 * - Left: Plan Overview → Quick Actions → [Rate of Return | Recent Transactions] side-by-side
 *         → Contribution/Statements/Strategy (3 cards) → Portfolio
 * - Right: Goal Simulator → Current Allocation → Onboarding → Learning
 * - Full width: Need help section
 *
 * Reduced vertical scroll via side-by-side consolidation and tighter gaps.
 */
export const PostEnrollmentDashboard = () => {
  const navigate = useNavigate();
  const data: EnrollmentSummary = MOCK_ENROLLMENT_SUMMARY;

  const allocationForChart = data.investmentAllocations.map((r) => ({
    fundId: r.fundId,
    percentage: r.allocationPct,
  }));

  return (
    <DashboardLayout header={<DashboardHeader />}>
      <div
        className="w-full min-w-0"
        role="region"
        aria-label="Post-enrollment dashboard"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[65fr_35fr] lg:items-start lg:gap-5 xl:gap-6">
          {/* Banner — full width */}
          {data.topBanner && (
            <div className="min-w-0 w-full lg:col-span-2">
              <PostEnrollmentTopBanner
                percentOnTrack={data.topBanner.percentOnTrack}
                subText={data.topBanner.subText}
                actionRoute={data.topBanner.actionRoute}
              />
            </div>
          )}

          {/* Left column — Plan Overview */}
          {data.planDetails && data.balances && (
            <div className="min-w-0 lg:col-start-1">
              <PlanOverviewCard
                plan={data.planDetails}
                balances={data.balances}
                isWithdrawalRestricted={data.isWithdrawalRestricted}
              />
            </div>
          )}

          {/* Right column — Sidebar (sticky) */}
          <aside className="flex min-w-0 flex-col gap-4 lg:col-start-2 lg:row-start-2 lg:row-span-4 lg:sticky lg:top-6 lg:self-start xl:gap-5">
            {data.goalProgress && <GoalSimulatorCard data={data.goalProgress} />}
            {data.investmentAllocations.length > 0 && data.allocationDescription && (
              <article className="ped-current-allocation rounded-xl border border-border bg-card p-5 xl:p-6">
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="m-0 text-lg font-semibold text-foreground">Current Allocation</h2>
                  <button type="button" className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label="Info">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </button>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">{data.allocationDescription}</p>
                <div className="ped__allocation-chart-wrap">
                  <AllocationChart allocations={allocationForChart} centerLabel="Allocated" showValidBadge={false} />
                </div>
                <a href="/investments" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                  Read full analysis →
                </a>
              </article>
            )}
            {data.onboardingProgress && (
              <div className="hidden md:block">
                <OnboardingProgressCard
                  percentComplete={data.onboardingProgress.percentComplete}
                  badgesCompleted={data.onboardingProgress.badgesCompleted}
                  badgesTotal={data.onboardingProgress.badgesTotal}
                  message={data.onboardingProgress.message}
                />
              </div>
            )}
            {data.learningResources.length > 0 && (
              <LearningHub items={data.learningResources} />
            )}
          </aside>

          {/* Left — Quick Actions (Figma 595-1666) */}
          <QuickActionsCard />

          {/* Left — Rate of Return + Recent Transactions SIDE BY SIDE (Figma 595-1716) */}
          <div className="min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:col-start-1 xl:gap-5">
            {data.rateOfReturn && (
              <RateOfReturnCard
                confidencePct={data.rateOfReturn.confidencePct}
                message={data.rateOfReturn.message}
                timeRange={data.rateOfReturn.timeRange}
              />
            )}
            {data.transactions.length > 0 && (
              <RecentTransactionsCard transactions={data.transactions} />
            )}
          </div>

          {/* Left — Contribution, Statements, Strategy (3 cards) */}
          {data.planDetails && (
            <div className="min-w-0 lg:col-start-1">
              <BottomActionCards contributionPct={data.planDetails.contributionRate} />
            </div>
          )}

          {/* Full width — Portfolio + Need help */}
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-2 xl:gap-5">
            {data.investmentAllocations.length > 0 && (
              <PortfolioTable
                rows={data.investmentAllocations}
                employerMatchLabel={
                  data.planDetails?.employerMatchCap
                    ? `${data.planDetails.employerMatchPct}% up to ${data.planDetails.employerMatchCap}% Match`
                    : "100% up to 6% Match"
                }
              />
            )}
            <section className="flex min-h-fit flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 xl:p-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Need help deciding?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our advisors are available to discuss which plan is right for your financial goals.
                </p>
              </div>
              <button
                type="button"
                className="rounded-md border border-border px-5 py-2 font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                onClick={() => navigate("/investments")}
              >
                Schedule a consultation
              </button>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

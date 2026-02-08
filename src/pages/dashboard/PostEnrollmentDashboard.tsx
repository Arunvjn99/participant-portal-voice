import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PostEnrollmentTopBanner } from "../../components/dashboard/PostEnrollmentTopBanner";
import { PlanOverviewCard } from "../../components/dashboard/PlanOverviewCard";
import { GoalSimulatorCard } from "../../components/dashboard/GoalSimulatorCard";
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
 * Post-Enrollment Dashboard — Figma 519-4705
 *
 * Desktop (lg+): Fixed 2-column grid; left 8 cols, right 4 cols; explicit row alignment.
 * Mobile/Tablet (<1024px): Single column, DOM order unchanged.
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
        className="grid grid-cols-1 gap-6 max-w-7xl mx-auto min-w-0 w-full lg:grid-cols-12 lg:items-start"
        role="region"
        aria-label="Post-enrollment dashboard"
      >
        {/* 1. Progress / Nudge Banner — left col, row 1 */}
        {data.topBanner && (
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-1">
            <PostEnrollmentTopBanner
              percentOnTrack={data.topBanner.percentOnTrack}
              subText={data.topBanner.subText}
              actionRoute={data.topBanner.actionRoute}
            />
          </div>
        )}

        {/* 2. Plan Overview — left col, row 2 */}
        {data.planDetails && data.balances && (
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-2">
            <PlanOverviewCard
              plan={data.planDetails}
              balances={data.balances}
              isWithdrawalRestricted={data.isWithdrawalRestricted}
            />
          </div>
        )}

        {/* 3. Goal Simulator — right col, row 1 */}
        {data.goalProgress && (
          <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
            <GoalSimulatorCard data={data.goalProgress} />
          </div>
        )}

        {/* 4. Current Allocation — right col, row 2 */}
        {data.investmentAllocations.length > 0 && data.allocationDescription && (
          <article className="lg:col-span-4 lg:col-start-9 lg:row-start-2 bg-card rounded-xl border border-border p-6 min-h-fit">
            <h2 className="text-lg font-semibold text-foreground mb-2">Current Allocation</h2>
            <p className="text-sm text-muted-foreground mb-4">{data.allocationDescription}</p>
            <div className="w-full max-w-[280px] mx-auto aspect-square max-h-[280px]">
              <AllocationChart allocations={allocationForChart} centerLabel="Allocated" showValidBadge={false} />
            </div>
            <a href="/investments" className="inline-block mt-4 text-sm font-medium text-primary hover:underline">
              Read full analysis →
            </a>
          </article>
        )}

        {/* 5. Quick Actions — left col, row 3 */}
        <section className="lg:col-span-8 lg:col-start-1 lg:row-start-3 bg-card rounded-xl border border-border p-6 min-h-fit">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button type="button" className="ped-qa-btn" onClick={() => navigate("/enrollment/contribution")}>
              <span className="ped-qa-icon">¢</span>
              <span>Change Contribution</span>
            </button>
            <button type="button" className="ped-qa-btn" onClick={() => navigate("/transactions/transfer/start")}>
              <span className="ped-qa-icon">↔</span>
              <span>Transfer Funds</span>
            </button>
            <button type="button" className="ped-qa-btn" onClick={() => navigate("/transactions/rebalance/start")}>
              <span className="ped-qa-icon">⟳</span>
              <span>Rebalance</span>
            </button>
            <button type="button" className="ped-qa-btn" onClick={() => navigate("/transactions/rollover/start")}>
              <span className="ped-qa-icon">↪</span>
              <span>Start Rollover</span>
            </button>
            <button type="button" className="ped-qa-btn" onClick={() => navigate("/profile")}>
              <span className="ped-qa-icon">👤</span>
              <span>Update Profile</span>
            </button>
          </div>
        </section>

        {/* 6. Recent Transactions — left col, row 4 */}
        {data.transactions.length > 0 && (
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-4">
            <RecentTransactionsCard transactions={data.transactions} />
          </div>
        )}

        {/* 7. Rate of Return — left col, row 5 */}
        {data.rateOfReturn && (
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-5">
            <RateOfReturnCard
              confidencePct={data.rateOfReturn.confidencePct}
              message={data.rateOfReturn.message}
              timeRange={data.rateOfReturn.timeRange}
            />
          </div>
        )}

        {/* 8. Your Portfolio — left col, row 6 */}
        {data.investmentAllocations.length > 0 && (
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-6">
            <PortfolioTable rows={data.investmentAllocations} />
          </div>
        )}

        {/* 9. Contribution / Statements / Strategy — left col, row 7 */}
        {data.planDetails && (
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-7">
            <BottomActionCards contributionPct={data.planDetails.contributionRate} />
          </div>
        )}

        {/* 10. Onboarding Progress — right col, row 3 (desktop only) */}
        {data.onboardingProgress && (
          <div className="hidden lg:block lg:col-span-4 lg:col-start-9 lg:row-start-3">
            <OnboardingProgressCard
              percentComplete={data.onboardingProgress.percentComplete}
              badgesCompleted={data.onboardingProgress.badgesCompleted}
              badgesTotal={data.onboardingProgress.badgesTotal}
              message={data.onboardingProgress.message}
            />
          </div>
        )}

        {/* 11. Learning Resources — right col, row 4 */}
        {data.learningResources.length > 0 && (
          <div className="lg:col-span-4 lg:col-start-9 lg:row-start-4">
            <LearningHub items={data.learningResources} />
          </div>
        )}

        {/* 12. Advisor CTA — left col, row 8 */}
        <section className="lg:col-span-8 lg:col-start-1 lg:row-start-8 bg-card rounded-xl border border-border p-6 flex flex-wrap items-center justify-between gap-4 min-h-fit">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Need help deciding?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Our advisors are available to discuss which plan is right for your financial goals.
            </p>
          </div>
          <button
            type="button"
            className="px-5 py-2 rounded-md border border-border text-foreground font-medium hover:border-primary hover:text-primary transition-colors"
            onClick={() => navigate("/investments")}
          >
            Schedule a consultation
          </button>
        </section>
      </div>
    </DashboardLayout>
  );
};

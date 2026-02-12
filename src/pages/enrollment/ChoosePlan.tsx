import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { useEnrollment } from "../../enrollment/context/EnrollmentContext";
import { EnrollmentStepper } from "../../components/enrollment/EnrollmentStepper";
import { PlanSelectionCard } from "../../components/enrollment/PlanSelectionCard";
import { ProfileSummaryCard } from "../../components/enrollment/ProfileSummaryCard";
import { RecommendationInsightCard } from "../../components/enrollment/RecommendationInsightCard";
import Button from "../../components/ui/Button";
import { loadEnrollmentDraft, saveEnrollmentDraft } from "../../enrollment/enrollmentDraftStore";
import { EnrollmentFooter } from "../../components/enrollment/EnrollmentFooter";
import type { PlanRecommendation, PlanOption } from "../../types/enrollment";
import type { SelectedPlanId } from "../../enrollment/context/EnrollmentContext";

const normalizePlanId = (planId: string): SelectedPlanId => {
  const mapping: Record<string, SelectedPlanId> = {
    "traditional-401k": "traditional_401k",
    "roth-401k": "roth_401k",
    "roth-ira": "roth_ira",
  };
  return mapping[planId] || null;
};

const MOCK_RECOMMENDATION: PlanRecommendation = {
  recommendedPlanId: "roth-401k",
  fitScore: 85,
  rationale:
    "Based on your age and risk tolerance, a Roth 401(k) offers tax-free growth that aligns with your long-term retirement goals.",
  profileSnapshot: {
    age: 30,
    retirementAge: 65,
    salary: 75000,
    riskLevel: "Moderate",
  },
};

const MOCK_PLANS: PlanOption[] = [
  {
    id: "traditional-401k",
    title: "Traditional 401(k)",
    matchInfo: "Tax-deferred contributions",
    description:
      "Contributions are made with pre-tax dollars, reducing your taxable income now. You'll pay taxes when you withdraw in retirement.",
    benefits: ["Immediate tax savings", "Lower taxable income", "Employer match eligible"],
    isRecommended: false,
  },
  {
    id: "roth-401k",
    title: "Roth 401(k)",
    matchInfo: "Tax-free growth",
    description:
      "Contributions are made with after-tax dollars. Your investments grow tax-free, and qualified withdrawals in retirement are tax-free.",
    benefits: ["Tax-free withdrawals", "No RMDs before 59½", "Ideal for long-term growth"],
    isRecommended: true,
    fitScore: 85,
  },
  {
    id: "roth-ira",
    title: "Roth IRA",
    matchInfo: "Individual retirement account",
    description:
      "An individual retirement account with tax-free growth and withdrawals. Contribution limits apply based on income.",
    benefits: ["Flexible withdrawals", "No employer required", "Tax-free growth"],
    isRecommended: false,
  },
];

export const ChoosePlan = () => {
  const navigate = useNavigate();
  const { state, setSelectedPlan } = useEnrollment();
  const recommendation = MOCK_RECOMMENDATION;
  const plans = MOCK_PLANS.map((plan) => {
    const isRecommended = plan.id === recommendation.recommendedPlanId;
    return {
      ...plan,
      isRecommended,
      fitScore: isRecommended ? recommendation.fitScore : undefined,
    };
  });

  const selectedPlanId = state.selectedPlan;
  const recommendedPlan = plans.find((p) => p.isRecommended);
  const otherPlans = plans.filter((p) => !p.isRecommended);

  const handlePlanSelect = useCallback(
    (planId: string) => {
      setSelectedPlan(normalizePlanId(planId));
    },
    [setSelectedPlan]
  );

  const handleContinue = useCallback(() => {
    if (!selectedPlanId) return;
    navigate("/enrollment/contribution");
  }, [selectedPlanId, navigate]);


  const handleReadFullAnalysis = () => {
    // TODO: Handle read full analysis
  };

  return (
    <DashboardLayout header={<DashboardHeader />}>
      <div className="choose-plan">
        <div className="choose-plan__progress">
          <EnrollmentStepper currentStep={0} />
          <div className="choose-plan__header">
            <h1 className="choose-plan__title">Choose your plan</h1>
            <p className="choose-plan__subtitle">Based on your personalised information, we've recommended a plan that fits your needs. You have other eligible plans to choose from.</p>
          </div>
        </div>

        <div className="choose-plan__content">
          <div className="choose-plan__left">
            <div className="choose-plan__plans">
              {recommendedPlan && (
                <section className="choose-plan__section" aria-labelledby="best-fit-heading">
                  <h2 id="best-fit-heading" className="choose-plan__section-title">
                    <svg className="choose-plan__section-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                      <path d="M9 18h6" />
                      <path d="M10 22h4" />
                    </svg>
                    Best Fit for You
                  </h2>
                  <PlanSelectionCard
                    planId={recommendedPlan.id}
                    planName={recommendedPlan.title}
                    description={recommendedPlan.description}
                    matchInfo={recommendedPlan.matchInfo}
                    benefits={recommendedPlan.benefits.slice(0, 3)}
                    isRecommended
                    fitPercentage={recommendedPlan.fitScore}
                    isSelected={normalizePlanId(recommendedPlan.id) === selectedPlanId}
                    onSelect={() => handlePlanSelect(recommendedPlan.id)}
                  />
                </section>
              )}

              {otherPlans.length > 0 && (
                <section className="choose-plan__section" aria-labelledby="other-plans-heading">
                  <div className="choose-plan__section-header">
                    <h2 id="other-plans-heading" className="choose-plan__section-title">
                      Other Eligible Plans ({otherPlans.length})
                    </h2>
                    <button
                      type="button"
                      className="choose-plan__compare-link"
                      aria-label="Compare all plans"
                    >
                      Compare All Plans →
                    </button>
                  </div>
                  {otherPlans.map((plan) => (
                    <PlanSelectionCard
                      key={plan.id}
                      planId={plan.id}
                      planName={plan.title}
                      description={plan.description}
                      matchInfo={plan.matchInfo}
                      benefits={plan.benefits.slice(0, 3)}
                      isRecommended={false}
                      isSelected={normalizePlanId(plan.id) === selectedPlanId}
                      onSelect={() => handlePlanSelect(plan.id)}
                    />
                  ))}
                </section>
              )}

              <div className="choose-plan__advisory">
                Need help deciding? Our advisors are available to discuss which plan is right for your financial goals.{" "}
                <a href="#" className="choose-plan__advisory-link" onClick={(e) => { e.preventDefault(); }}>
                  Schedule a consultation
                </a>
              </div>
            </div>
          </div>

          <aside className="choose-plan__right" aria-label="Profile and recommendation">
            <ProfileSummaryCard
              age={recommendation.profileSnapshot.age}
              retirementAge={recommendation.profileSnapshot.retirementAge}
              salary={recommendation.profileSnapshot.salary}
              riskLevel={recommendation.profileSnapshot.riskLevel}
            />
            <RecommendationInsightCard
              recommendation={recommendation}
              onReadFullAnalysis={handleReadFullAnalysis}
            />
          </aside>
        </div>

        <EnrollmentFooter
          step={0}
          primaryLabel="Continue to Contributions"
          primaryDisabled={!selectedPlanId}
          onPrimary={handleContinue}
          getDraftSnapshot={() => ({ selectedPlanId: selectedPlanId ?? null })}
        />
      </div>
    </DashboardLayout>
  );
};

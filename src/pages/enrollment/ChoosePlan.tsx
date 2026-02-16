import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEnrollment } from "../../enrollment/context/EnrollmentContext";
import { PlanRail } from "../../components/enrollment/PlanRail";
import { PlanDetailsPanel } from "../../components/enrollment/PlanDetailsPanel";
import { EnrollmentFooter } from "../../components/enrollment/EnrollmentFooter";
import { EnrollmentPageContent } from "../../components/enrollment/EnrollmentPageContent";
import { loadEnrollmentDraft, saveEnrollmentDraft } from "../../enrollment/enrollmentDraftStore";
import { getPlanRecommendation } from "../../enrollment/logic/planRecommendationLogic";
import type { PlanOption, PlanRecommendation } from "../../types/enrollment";
import type { SelectedPlanId } from "../../enrollment/context/EnrollmentContext";

const normalizePlanId = (planId: string): SelectedPlanId => {
  const mapping: Record<string, SelectedPlanId> = {
    "traditional-401k": "traditional_401k",
    "roth-401k": "roth_401k",
    "roth-ira": "roth_ira",
    "safe-harbor-401k": "roth_ira",
  };
  return mapping[planId] ?? null;
};

const planIdToRaw = (id: SelectedPlanId): string | null => {
  if (!id) return null;
  const mapping: Record<SelectedPlanId, string> = {
    traditional_401k: "traditional-401k",
    roth_401k: "roth-401k",
    roth_ira: "roth-ira",
  };
  return mapping[id];
};

/** Fallback when no enrollment state (e.g. direct nav). */
const FALLBACK_AGE = 30;
const FALLBACK_RETIREMENT_AGE = 65;
const FALLBACK_SALARY = 50000;

function buildPlansFromRecommendation(recommendation: PlanRecommendation): PlanOption[] {
  const base: PlanOption[] = [
    {
      id: "traditional-401k",
      title: "Traditional 401(k)",
      matchInfo: "Tax-deferred contributions",
      description:
        "Contributions are made with pre-tax dollars, reducing your taxable income now. You'll pay taxes when you withdraw in retirement.",
      benefits: ["Immediate tax savings", "Lower taxable income", "Employer match eligible"],
      isRecommended: false,
      isEligible: true,
    },
    {
      id: "roth-401k",
      title: "Roth 401(k)",
      matchInfo: "100% up to 6% Match",
      description:
        "Contributions are after-tax. Withdrawals in retirement are tax-free.",
      benefits: ["Tax-free growth", "Tax-free withdrawal", "Employer Match"],
      isRecommended: true,
      fitScore: recommendation.fitScore,
      isEligible: true,
    },
    {
      id: "roth-ira",
      title: "Safe Harbor 401(k)",
      matchInfo: "100% up to 4% Match (Immediate Vesting)",
      description:
        "Employer contributions are immediately vested. No annual testing required.",
      benefits: ["Immediate vesting", "Guaranteed match", "No discrimination testing"],
      isRecommended: false,
      isEligible: true,
    },
  ];
  const withRecommendation = base.map((p) => ({
    ...p,
    isRecommended: p.id === recommendation.recommendedPlanId,
    fitScore: p.id === recommendation.recommendedPlanId ? recommendation.fitScore : p.fitScore,
  }));
  return [...withRecommendation].sort((a, b) => (a.isRecommended ? -1 : b.isRecommended ? 1 : 0));
}

export const ChoosePlan = () => {
  const navigate = useNavigate();
  const { state, setSelectedPlan } = useEnrollment();
  const draft = loadEnrollmentDraft();

  const recommendation: PlanRecommendation = getPlanRecommendation({
    currentAge: (state.currentAge || draft?.currentAge) ?? FALLBACK_AGE,
    retirementAge: (state.retirementAge || draft?.retirementAge) ?? FALLBACK_RETIREMENT_AGE,
    salary: (state.salary || draft?.annualSalary) ?? FALLBACK_SALARY,
    currentBalance: state.currentBalance ?? (draft?.otherSavings?.amount ?? 0),
  });

  const plans = buildPlansFromRecommendation(recommendation);
  const recommendedId = plans.find((p) => p.isRecommended)?.id ?? plans[0]?.id;
  const selectedPlanIdRaw = planIdToRaw(state.selectedPlan) ?? recommendedId;
  const selectedPlan = plans.find((p) => p.id === selectedPlanIdRaw) ?? plans[0];
  const selectedPlanId = selectedPlanIdRaw ?? recommendedId;

  useEffect(() => {
    if (state.selectedPlan != null || !recommendedId) return;
    setSelectedPlan(normalizePlanId(recommendedId));
  }, [state.selectedPlan, recommendedId, setSelectedPlan]);

  const handlePlanSelect = useCallback(
    (planId: string) => {
      const normalized = normalizePlanId(planId);
      setSelectedPlan(normalized);
      const draft = loadEnrollmentDraft();
      if (draft) {
        saveEnrollmentDraft({ ...draft, selectedPlanId: normalized });
      }
    },
    [setSelectedPlan]
  );

  const handleContinue = useCallback(() => {
    if (!state.selectedPlan) return;
    navigate("/enrollment/contribution");
  }, [state.selectedPlan, navigate]);

  const yearsToRetire = Math.max(0, recommendation.profileSnapshot.retirementAge - recommendation.profileSnapshot.age);
  const userSnapshot = {
    age: recommendation.profileSnapshot.age,
    retirementAge: recommendation.profileSnapshot.retirementAge,
    salary: recommendation.profileSnapshot.salary,
    yearsToRetire,
    retirementLocation: draft?.retirementLocation,
    otherSavings: state.currentBalance ?? draft?.otherSavings?.amount ?? undefined,
  };

  const canContinue = state.selectedPlan != null && (selectedPlan?.isEligible !== false);

  return (
    <EnrollmentPageContent
      title="Select your retirement plan"
      subtitle="Choose an option to see how it affects your future savings."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          <PlanRail
            plans={plans}
            selectedId={selectedPlanId}
            onSelect={handlePlanSelect}
          />
          <div className="lg:hidden">
            <p className="text-sm" style={{ color: "var(--enroll-text-muted)" }}>
              Need help deciding? Our advisors are available to discuss which plan is right for your financial goals.{" "}
              <a href="#" className="underline" style={{ color: "var(--enroll-brand)" }} onClick={(e) => e.preventDefault()}>
                Schedule a consultation
              </a>
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="lg:sticky lg:top-24 transition-all duration-300">
            <PlanDetailsPanel plan={selectedPlan} user={userSnapshot} rationale={recommendation.rationale} />
          </div>
        </div>
      </div>

      <EnrollmentFooter
        step={0}
        primaryLabel="Continue to Contributions"
        primaryDisabled={!canContinue}
        onPrimary={handleContinue}
        getDraftSnapshot={() => ({ selectedPlanId: state.selectedPlan ?? null })}
      />
    </EnrollmentPageContent>
  );
};

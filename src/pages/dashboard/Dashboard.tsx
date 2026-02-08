import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { SaveToast } from "../../components/ui/SaveToast";
import { thumbnails } from "../../assets/learning";
import { advisorAvatars } from "../../assets/avatars";
import { HeroEnrollmentCard } from "../../components/dashboard/HeroEnrollmentCard";
import DashboardSection from "../../components/dashboard/DashboardSection";
import { LearningResourceCard } from "../../components/dashboard/LearningResourceCard";
import { LearningResourcesCarousel } from "../../components/dashboard/LearningResourcesCarousel";
import { PersonalizedScoreCard } from "../../components/dashboard/PersonalizedScoreCard";
import { AdvisorList } from "../../components/dashboard/AdvisorList";
import { AdvisorCard } from "../../components/dashboard/AdvisorCard";
import { ValuePropGrid } from "../../components/dashboard/ValuePropGrid";
import { ValuePropCard } from "../../components/dashboard/ValuePropCard";

export const Dashboard = () => {
  return (
    <DashboardLayout header={<DashboardHeader />}>
      <SaveToast />
      <HeroEnrollmentCard />

      {/* Learning Resources (left) + Personalized Score (right) - Figma layout */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        {/* Section 1: Learning Resources - Figma: white rounded container, title left, carousel inside */}
        <div className="relative min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8">
          <h2 className="mb-5 text-left text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
            Learning Resources
          </h2>
          <LearningResourcesCarousel>
            <LearningResourceCard
              title="Understanding 401(k) Basics"
              subtitle="Retirement Education Hub"
              imageSrc={thumbnails.learning401k}
              badge="Video"
              index={0}
            />
            <LearningResourceCard
              title="Investment Strategies for Retirement"
              subtitle="Financial Planning Institute"
              imageSrc={thumbnails.learningInvestment}
              badge="Article"
              index={1}
            />
            <LearningResourceCard
              title="Maximizing Your Employer Match"
              subtitle="Retirement Education Hub"
              imageSrc={thumbnails.learningMatch}
              badge="Video"
              index={2}
            />
            <LearningResourceCard
              title="Roth vs Traditional: Which is Right?"
              subtitle="Financial Planning Institute"
              imageSrc={thumbnails.learningInvestment}
              badge="Article"
              index={3}
            />
          </LearningResourcesCarousel>
        </div>

        {/* Section 2: Goal Simulator - fixed width on desktop, height matches Learning Resources */}
        <div className="flex min-h-[320px] lg:w-[340px] lg:shrink-0">
          <PersonalizedScoreCard />
        </div>
      </section>

      <DashboardSection title="Want help choosing a plan? Meet our advisors.">
        <AdvisorList>
          <AdvisorCard
            name="Alex Morgan"
            role="Retirement Advisor"
            description="Helping employees make confident retirement decisions with simple, personalized guidance."
            avatarSrc={advisorAvatars.alex}
          />
          <AdvisorCard
            name="Maya Patel"
            role="Certified Planner"
            description="Experienced CFP providing clear recommendations tailored for busy professionals."
            avatarSrc={advisorAvatars.maya}
          />
        </AdvisorList>
      </DashboardSection>
      <DashboardSection title="Why Choose Our Plan">
        <ValuePropGrid>
          <ValuePropCard
            icon="dollar"
            title="Employer Match"
            description="Get free money. We match 100% up to 6% of your salary."
          />
          <ValuePropCard
            icon="shield"
            title="Tax Advantages"
            description="Lower your taxable income now or enjoy tax-free withdrawals later."
          />
          <ValuePropCard
            icon="chart"
            title="Compound Growth"
            description="Start early. Even small contributions grow significantly over time."
          />
        </ValuePropGrid>
      </DashboardSection>
    </DashboardLayout>
  );
};

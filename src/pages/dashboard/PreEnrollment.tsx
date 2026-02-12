import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { HeroSection, LearningSection, AdvisorSection } from "../../components/pre-enrollment";

export const PreEnrollment = () => {
  return (
    <DashboardLayout header={<DashboardHeader />}>
      <HeroSection />
      <LearningSection />
      <AdvisorSection />
    </DashboardLayout>
  );
};

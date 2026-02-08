import type { ReactNode } from "react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { AllocationSummary } from "../../components/investments/AllocationSummary";
import { InvestmentsFooter } from "../../components/investments/InvestmentsFooter";

interface InvestmentsLayoutProps {
  children: ReactNode;
}

/**
 * InvestmentsLayout - Two-column responsive layout with footer
 * Left: strategy-specific content
 * Right: sticky AllocationSummary
 * Footer: Cancel, Save & Exit, Continue
 */
export default function InvestmentsLayout({ children }: InvestmentsLayoutProps) {
  return (
    <DashboardLayout header={<DashboardHeader />}>
      <div className="investments-layout">
        <div className="investments-layout__content">
          <div className="investments-layout__left">
            {children}
          </div>
          <div className="investments-layout__right">
            <AllocationSummary />
          </div>
        </div>
        <InvestmentsFooter />
      </div>
    </DashboardLayout>
  );
}

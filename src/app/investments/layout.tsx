import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { EnrollmentStepper } from "../../components/enrollment/EnrollmentStepper";
import { AllocationSummary } from "../../components/investments/AllocationSummary";
import { InvestmentsFooter } from "../../components/investments/InvestmentsFooter";

interface InvestmentsLayoutProps {
  children: ReactNode;
}

export default function InvestmentsLayout({ children }: InvestmentsLayoutProps) {
  const { pathname } = useLocation();
  const isEnrollmentFlow = pathname === "/enrollment/investments" || pathname.startsWith("/enrollment/investments/");

  const content = (
    <div style={{ background: "var(--enroll-bg)" }} className="w-full min-h-screen pb-28">
      {!isEnrollmentFlow && (
        <div className="enrollment-stepper-section investments-layout__stepper">
          <EnrollmentStepper currentStep={3} title="Investment Elections" subtitle="Choose how your contributions are invested." />
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* ── Hero Header ── */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1
            className="text-[28px] md:text-[32px] font-bold leading-tight"
            style={{ color: "var(--enroll-text-primary)" }}
          >
            Build Your Investment Strategy
          </h1>
          <p
            className="mt-1.5 text-base"
            style={{ color: "var(--enroll-text-secondary)" }}
          >
            Balance growth and stability based on your risk comfort.
          </p>
        </motion.header>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">{children}</div>
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <AllocationSummary variant="enrollment" />
            </div>
          </div>
        </div>
      </div>

      <InvestmentsFooter />
    </div>
  );

  if (isEnrollmentFlow) {
    return content;
  }
  return (
    <DashboardLayout header={<DashboardHeader />}>
      {content}
    </DashboardLayout>
  );
}

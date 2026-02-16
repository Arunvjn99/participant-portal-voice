import { useState, useEffect } from "react";
import { EnrollmentStepper } from "./EnrollmentStepper";

export interface EnrollmentHeaderWithStepperProps {
  /** Current step index (0-based). Plan=0, Contribution=1, Auto Increase=2, Investment=3, Review=4 */
  activeStep: number;
}

function useCompactStepper() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return compact;
}

function useDesktopStepper() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

/**
 * Enrollment stepper bar — designed to be used as a `subHeader` slot in DashboardLayout.
 * The global DashboardHeader is rendered separately as the main `header`.
 * This component only renders the stepper progress bar.
 */
export function EnrollmentHeaderWithStepper({ activeStep }: EnrollmentHeaderWithStepperProps) {
  const compact = useCompactStepper();
  const desktop = useDesktopStepper();

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EnrollmentStepper
          currentStep={activeStep}
          stepLabels={["Plan", "Contribution", "Auto Increase", "Investment", "Review"]}
          compact={!desktop && compact}
        />
      </div>
    </div>
  );
}

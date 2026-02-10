import { CustomStepper } from "./CustomStepper";

const ENROLLMENT_STEPS = ["Enroll", "Contributions", "Auto Increase", "Investments", "Review", "Complete"];

export interface EnrollmentStepperProps {
  /** Current step index (0-based). Controlled externally. */
  currentStep: number;
  /** Optional page title (unused; kept for API compatibility). */
  title?: string;
  /** Optional page subtitle (unused; kept for API compatibility). */
  subtitle?: string;
}

/**
 * Enrollment stepper – custom lightweight stepper (display only).
 * activeStep is controlled via currentStep prop; step labels from ENROLLMENT_STEPS.
 */
export function EnrollmentStepper({ currentStep }: EnrollmentStepperProps) {
  return (
    <CustomStepper steps={ENROLLMENT_STEPS} activeStep={currentStep} />
  );
}

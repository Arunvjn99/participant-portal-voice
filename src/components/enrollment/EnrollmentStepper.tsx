interface EnrollmentStepperProps {
  currentStep: number;
}

const STEPS = [
  { label: "Plan", step: 0 },
  { label: "Contribution", step: 1 },
  { label: "Investments", step: 2 },
  { label: "Review", step: 3 },
];

/**
 * EnrollmentStepper - Figma-aligned enrollment progress
 * Horizontally centered, responsive. Shows completed / active / upcoming states.
 */
export const EnrollmentStepper = ({ currentStep }: EnrollmentStepperProps) => {
  const getStepStatus = (stepIndex: number): "completed" | "active" | "upcoming" => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "active";
    return "upcoming";
  };

  const progressPercentage = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div
      className="enrollment-stepper"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={STEPS.length}
      aria-label={`Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep]?.label}`}
    >
      <div className="enrollment-stepper__steps">
        {STEPS.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <div
              key={index}
              className={`enrollment-stepper__step enrollment-stepper__step--${status}`}
              aria-current={status === "active" ? "step" : undefined}
            >
              <div className="enrollment-stepper__step-indicator">
                {status === "completed" && (
                  <span className="enrollment-stepper__checkmark" aria-hidden="true">
                    ✓
                  </span>
                )}
                {(status === "active" || status === "upcoming") && (
                  <span className="enrollment-stepper__step-number">{index + 1}</span>
                )}
              </div>
              <span className="enrollment-stepper__step-label">{step.label}</span>
            </div>
          );
        })}
        <div
          className="enrollment-stepper__progress-fill"
          style={{ width: `${progressPercentage}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

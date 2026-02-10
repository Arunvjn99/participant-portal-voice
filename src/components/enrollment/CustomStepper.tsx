import * as React from "react";

const GREEN = "#4CAF50";
const GREY_LINE = "#e0e0e0";
const GREY_LABEL = "#9e9e9e";
const GREY_LABEL_ACTIVE = "#424242";

export interface CustomStepperProps {
  steps: string[];
  activeStep: number;
}

function ProgressLine({
  completed,
  isLast,
}: {
  completed: boolean;
  isLast: boolean;
}) {
  if (isLast) return null;
  return (
    <div
      className="custom-stepper__connector"
      style={{
        flex: "1 1 0",
        minWidth: "8px",
        maxWidth: "40px",
        height: "2px",
        backgroundColor: completed ? GREEN : GREY_LINE,
      }}
      aria-hidden
    />
  );
}

function StepItem({
  label,
  stepIndex,
  status,
}: {
  label: string;
  stepIndex: number;
  status: "completed" | "active" | "upcoming";
}) {
  const isCompleted = status === "completed";
  const isActive = status === "active";

  return (
    <div className="custom-stepper__step">
      <div
        className="custom-stepper__node"
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...(isCompleted && {
            backgroundColor: GREEN,
            color: "#fff",
          }),
          ...(isActive && {
            backgroundColor: "#fff",
            border: `2px solid ${GREEN}`,
            color: GREEN,
          }),
          ...(status === "upcoming" && {
            backgroundColor: "#fff",
            border: `1px solid ${GREY_LINE}`,
            color: GREY_LABEL,
          }),
        }}
        aria-hidden
      >
        {isCompleted ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{stepIndex + 1}</span>
        )}
      </div>
      <span
        className="custom-stepper__label"
        style={{
          fontSize: "0.75rem",
          color: isActive ? GREY_LABEL_ACTIVE : GREY_LABEL,
          fontWeight: isActive ? 600 : 400,
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Lightweight horizontal stepper. Display only, non-clickable.
 * Matches reference: small circles, thin connector, completed=green+check, active=outline+number, upcoming=grey.
 */
export function CustomStepper({ steps, activeStep }: CustomStepperProps) {
  const safeActive = Math.min(Math.max(activeStep, 0), steps.length - 1);

  return (
    <div
      className="custom-stepper"
      role="progressbar"
      aria-valuenow={safeActive + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Step ${safeActive + 1} of ${steps.length}`}
    >
      <div className="custom-stepper__track">
        {steps.map((label, index) => {
          const status =
            index < safeActive ? "completed" : index === safeActive ? "active" : "upcoming";
          return (
            <React.Fragment key={label}>
              <StepItem
                label={label}
                stepIndex={index}
                status={status}
              />
              <ProgressLine
                completed={index < safeActive}
                isLast={index === steps.length - 1}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

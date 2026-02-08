import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import {
  loadEnrollmentDraft,
  saveEnrollmentDraft,
  ENROLLMENT_SAVED_TOAST_KEY,
} from "../../enrollment/enrollmentDraftStore";

export type EnrollmentStep = 0 | 1 | 2 | 3;

interface EnrollmentFooterProps {
  step: EnrollmentStep;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  summaryText?: string;
  /** When true, summary text uses error styling */
  summaryError?: boolean;
  getDraftSnapshot?: () => Record<string, unknown>;
}

/**
 * EnrollmentFooter - Reusable sticky footer for all enrollment steps.
 * Left: Back (disabled on step 0)
 * Center: Optional contextual summary
 * Right: Save & Exit + Primary CTA
 */
export const EnrollmentFooter = ({
  step,
  primaryLabel,
  primaryDisabled = false,
  onPrimary,
  summaryText,
  summaryError = false,
  getDraftSnapshot,
}: EnrollmentFooterProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    switch (step) {
      case 0:
        return; // disabled
      case 1:
        navigate("/enrollment/choose-plan");
        break;
      case 2:
        navigate("/enrollment/contribution");
        break;
      case 3:
        navigate("/enrollment/investments");
        break;
    }
  };

  const handleSaveAndExit = () => {
    const draft = loadEnrollmentDraft();
    if (draft) {
      const snapshot = getDraftSnapshot?.();
      saveEnrollmentDraft(snapshot ? { ...draft, ...snapshot } : draft);
      sessionStorage.setItem(ENROLLMENT_SAVED_TOAST_KEY, "1");
    }
    navigate("/dashboard");
  };

  const isFirstStep = step === 0;

  return (
    <footer
      className="enrollment-footer"
      role="contentinfo"
      aria-label="Enrollment step actions"
    >
      <div className="enrollment-footer__inner">
        <div className="enrollment-footer__left">
          <Button
            type="button"
            onClick={handleBack}
            disabled={isFirstStep}
            className="enrollment-footer__back"
            aria-label={isFirstStep ? "Back (disabled on first step)" : "Back to previous step"}
          >
            Back
          </Button>
        </div>
        <div className="enrollment-footer__center" aria-live="polite">
          {summaryText && (
            <span className={`enrollment-footer__summary ${summaryError ? "enrollment-footer__summary--error" : ""}`}>
              {summaryText}
            </span>
          )}
        </div>
        <div className="enrollment-footer__right">
          <Button
            type="button"
            onClick={handleSaveAndExit}
            className="enrollment-footer__save-exit"
          >
            Save & Exit
          </Button>
          <Button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="enrollment-footer__primary"
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </footer>
  );
};


import { EnrollmentStepper } from "../../components/enrollment/EnrollmentStepper";
import { ManualBuilder } from "../../components/investments/ManualBuilder";

/**
 * InvestmentsPage - Main content component (must be inside InvestmentProvider)
 */
export default function InvestmentsPage() {
  return (
    <div className="investments-page">
      <div className="investments-page__stepper">
        <EnrollmentStepper currentStep={2} />
        <div className="choose-plan__header mt-4">
          <h1 className="choose-plan__title">Investment Elections</h1>
          <p className="choose-plan__subtitle">Choose how your contributions are invested.</p>
        </div>
      </div>

      <div className="investments-page__builder">
        <ManualBuilder />
      </div>
    </div>
  );
}

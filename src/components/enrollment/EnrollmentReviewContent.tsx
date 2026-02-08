import { InvestmentProvider } from "../../context/InvestmentContext";
import { useEnrollment } from "../../enrollment/context/EnrollmentContext";
import { Review } from "../../pages/enrollment/Review";

/**
 * Wraps Review with InvestmentProvider, passing sourceAllocation from enrollment.
 * Investment allocation is hydrated from draft (saved on Confirm from Investments step).
 */
export const EnrollmentReviewContent = () => {
  const { state } = useEnrollment();
  const { preTax, roth, afterTax } = state.sourceAllocation;
  const hasPreTaxOrRoth = preTax > 0 || roth > 0;
  const hasAfterTax = afterTax > 0;
  const sourceAllocation = { preTax, roth, afterTax };

  return (
    <InvestmentProvider
      sourceAllocation={sourceAllocation}
      hasPreTaxOrRoth={hasPreTaxOrRoth}
      hasAfterTax={hasAfterTax}
    >
      <Review />
    </InvestmentProvider>
  );
};

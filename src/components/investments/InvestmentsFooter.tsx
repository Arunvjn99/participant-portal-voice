import { useNavigate, useLocation } from "react-router-dom";
import { useInvestment } from "../../context/InvestmentContext";
import { loadEnrollmentDraft, saveEnrollmentDraft } from "../../enrollment/enrollmentDraftStore";
import { EnrollmentFooter } from "../enrollment/EnrollmentFooter";
import { useState } from "react";
import { ConfirmAllocationModal } from "./ConfirmAllocationModal";

/**
 * InvestmentsFooter - Renders EnrollmentFooter for enrollment flow.
 * Primary action shows ConfirmAllocationModal before navigating to Review.
 */
export const InvestmentsFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canConfirmAllocation, confirmAllocation, getInvestmentSnapshot } = useInvestment();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isEnrollmentFlow = location.pathname === "/enrollment/investments";

  const handleContinue = () => {
    if (!canConfirmAllocation) return;
    setShowConfirmModal(true);
  };

  const handleConfirmAllocation = () => {
    if (!canConfirmAllocation) return;
    confirmAllocation();
    const draft = loadEnrollmentDraft();
    if (draft) {
      saveEnrollmentDraft({
        ...draft,
        investment: getInvestmentSnapshot(),
      });
    }
    setShowConfirmModal(false);
    navigate("/enrollment/review");
  };

  if (!isEnrollmentFlow) return null;

  const summaryText = canConfirmAllocation
    ? "Allocation: 100% valid"
    : "Allocation must total 100%";

  return (
    <>
      <EnrollmentFooter
        step={2}
        primaryLabel="Continue to Review"
        primaryDisabled={!canConfirmAllocation}
        onPrimary={handleContinue}
        summaryText={summaryText}
        getDraftSnapshot={() => ({ investment: getInvestmentSnapshot() })}
      />

      {showConfirmModal && (
        <ConfirmAllocationModal
          onConfirm={handleConfirmAllocation}
          onCancel={() => setShowConfirmModal(false)}
          canConfirm={canConfirmAllocation}
        />
      )}
    </>
  );
};

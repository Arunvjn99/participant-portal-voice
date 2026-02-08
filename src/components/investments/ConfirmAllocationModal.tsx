import { Modal } from "../ui/Modal";
import Button from "../ui/Button";
import { useInvestment } from "../../context/InvestmentContext";
import { getFundById } from "../../data/mockFunds";

interface ConfirmAllocationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  canConfirm: boolean;
}

/**
 * ConfirmAllocationModal - Review and confirm allocation
 */
export const ConfirmAllocationModal = ({ onConfirm, onCancel, canConfirm }: ConfirmAllocationModalProps) => {
  const { chartAllocations, weightedSummary } = useInvestment();

  const formatPercentage = (value: number) => {
    return value.toFixed(1);
  };

  return (
    <Modal isOpen={true} onClose={onCancel}>
      <div className="confirm-allocation-modal">
        <h2 className="confirm-allocation-modal__title">Confirm Allocation Changes</h2>
        <p className="confirm-allocation-modal__description">
          Review your allocation before confirming. This will update your investment portfolio.
        </p>

        <div className="confirm-allocation-modal__comparison">
          <div className="confirm-allocation-modal__column">
            <h3 className="confirm-allocation-modal__column-title">Your Allocation</h3>
            <div className="confirm-allocation-modal__funds">
              {chartAllocations
                .filter((a) => a.percentage > 0)
                .sort((a, b) => b.percentage - a.percentage)
                .map(({ fundId, percentage }) => {
                  const fund = getFundById(fundId);
                  if (!fund) return null;
                  return (
                    <div key={fundId} className="confirm-allocation-modal__fund-item">
                      <span className="confirm-allocation-modal__fund-name">{fund.name}</span>
                      <span className="confirm-allocation-modal__fund-value">
                        {formatPercentage(percentage)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="confirm-allocation-modal__summary">
          <div className="confirm-allocation-modal__summary-item">
            <span className="confirm-allocation-modal__summary-label">Expected Return</span>
            <span className="confirm-allocation-modal__summary-value">
              {weightedSummary.expectedReturn.toFixed(2)}%
            </span>
          </div>
          <div className="confirm-allocation-modal__summary-item">
            <span className="confirm-allocation-modal__summary-label">Total Fees</span>
            <span className="confirm-allocation-modal__summary-value">
              {weightedSummary.totalFees.toFixed(2)}%
            </span>
          </div>
          <div className="confirm-allocation-modal__summary-item">
            <span className="confirm-allocation-modal__summary-label">Risk Level</span>
            <span className="confirm-allocation-modal__summary-value">
              {weightedSummary.riskLevel.toFixed(1)}/10
            </span>
          </div>
        </div>

        <div className="confirm-allocation-modal__actions">
          <Button
            onClick={onCancel}
            className="confirm-allocation-modal__button confirm-allocation-modal__button--secondary"
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="confirm-allocation-modal__button confirm-allocation-modal__button--primary"
            type="button"
          >
            Confirm Allocation
          </Button>
        </div>
      </div>
    </Modal>
  );
};

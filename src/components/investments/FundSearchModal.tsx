import { useState, useMemo } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import Button from "../ui/Button";
import { MOCK_FUNDS } from "../../data/mockFunds";

interface FundSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fundId: string) => void;
  /** Fund IDs already in this source - exclude from available */
  excludedFundIds: string[];
}

/**
 * Fund search modal - used when adding a fund to a source.
 * Excludes funds already allocated in that source.
 */
export const FundSearchModal = ({
  isOpen,
  onClose,
  onSelect,
  excludedFundIds,
}: FundSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const availableFunds = useMemo(() => {
    const excluded = new Set(excludedFundIds);
    let list = MOCK_FUNDS.filter((f) => !excluded.has(f.id));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.ticker.toLowerCase().includes(q) ||
          f.assetClass.toLowerCase().includes(q)
      );
    }
    return list;
  }, [excludedFundIds, searchQuery]);

  const handleSelect = (fundId: string) => {
    onSelect(fundId);
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="fund-search-modal">
        <h2 className="fund-search-modal__title">Add Investment</h2>
        <p className="fund-search-modal__description">
          Search and select a fund to add. You will assign allocation after adding.
        </p>
        <div className="fund-search-modal__search">
          <Input
            label="Search funds"
            type="text"
            name="fund-search-modal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ticker, or asset class"
          />
        </div>
        <div className="fund-search-modal__list">
          {availableFunds.length === 0 ? (
            <p className="fund-search-modal__empty">
              {searchQuery.trim()
                ? `No funds found matching "${searchQuery}"`
                : "All funds are already in your allocation."}
            </p>
          ) : (
            availableFunds.map((fund) => (
              <div
                key={fund.id}
                className="fund-search-modal__item"
              >
                <div className="fund-search-modal__item-info">
                  <span className="fund-search-modal__item-name">{fund.name}</span>
                  <span className="fund-search-modal__item-ticker">
                    {fund.ticker}
                  </span>
                  <span className="fund-search-modal__item-details">
                    {fund.assetClass} · {fund.expenseRatio.toFixed(2)}% fee ·
                    Risk {fund.riskLevel}/10
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => handleSelect(fund.id)}
                  className="fund-search-modal__add-btn"
                >
                  Add
                </Button>
              </div>
            ))
          )}
        </div>
        <div className="fund-search-modal__footer">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

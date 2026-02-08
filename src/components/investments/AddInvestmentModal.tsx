import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { MOCK_FUNDS } from "../../data/mockFunds";
import type { Fund } from "../../types/investment";

const DEBOUNCE_MS = 300;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debouncedValue;
}

/** Search icon */
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export type TaxSourceKey = "preTax" | "roth" | "afterTax";

interface AddInvestmentModalProps {
  open: boolean;
  onClose: () => void;
  activeTaxSource: TaxSourceKey;
  existingFundIds: string[];
  onAdd: (fundId: string) => void;
  /** Called after a fund is added, so parent can focus allocation input */
  onAddComplete?: (fundId: string) => void;
}

export const AddInvestmentModal = ({
  open,
  onClose,
  activeTaxSource,
  existingFundIds,
  onAdd,
  onAddComplete,
}: AddInvestmentModalProps) => {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), DEBOUNCE_MS);
  const searchInputId = useRef(`add-investment-search-${activeTaxSource}`).current;

  const displayedFunds = useMemo(() => {
    let list = MOCK_FUNDS;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.ticker.toLowerCase().includes(q) ||
          f.assetClass.toLowerCase().includes(q)
      );
    }
    return list;
  }, [debouncedSearch]);

  const handleAdd = useCallback(
    (fundId: string) => {
      if (existingFundIds.includes(fundId)) return;
      onAdd(fundId);
      onAddComplete?.(fundId);
      setSearchInput("");
      onClose();
    },
    [existingFundIds, onAdd, onAddComplete, onClose]
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setSearchInput("");
        onClose();
      }
    },
    [onClose]
  );

  const isAdded = useCallback(
    (fundId: string) => existingFundIds.includes(fundId),
    [existingFundIds]
  );

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm dark:bg-black/50" />
        <Dialog.Content
          className="add-investment-modal fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[90vw] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-border bg-background shadow-xl focus:outline-none dark:border-slate-700 dark:bg-slate-900"
          aria-labelledby="add-investment-title"
          aria-describedby="add-investment-description"
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
        >
          {/* Sticky Header */}
          <header className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b border-border bg-background px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div>
              <Dialog.Title
                id="add-investment-title"
                className="text-xl font-semibold text-foreground dark:text-slate-100"
              >
                Add Investment
              </Dialog.Title>
              <Dialog.Description
                id="add-investment-description"
                className="mt-1 text-sm text-muted-foreground dark:text-slate-400"
              >
                Search and select a fund to add. You can assign allocation after adding.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background-secondary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </header>

          {/* Search Input */}
          <div className="shrink-0 px-6 pt-4">
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              >
                <SearchIcon />
              </span>
              <input
                id={searchInputId}
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by fund name, ticker, or asset class"
                autoComplete="off"
                className="w-full rounded-lg border border-border bg-surface py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                aria-label="Search funds"
              />
            </div>
          </div>

          {/* Fund List */}
          <div
            className="min-h-0 flex-1 overflow-y-auto px-6 py-4"
            style={{ maxHeight: "60vh" }}
            role="listbox"
            aria-label="Available funds"
          >
            {displayedFunds.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground dark:text-slate-400" role="status">
                {debouncedSearch
                  ? `No funds found matching "${debouncedSearch}"`
                  : "No funds available."}
              </p>
            ) : (
              <ul className="flex flex-col gap-2" role="none">
                {displayedFunds.map((fund) => (
                  <FundRow
                    key={fund.id}
                    fund={fund}
                    isAdded={isAdded(fund.id)}
                    onAdd={() => handleAdd(fund.id)}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Sticky Footer */}
          <footer className="sticky bottom-0 flex shrink-0 justify-end border-t border-border bg-background px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[100px] rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

interface FundRowProps {
  fund: Fund;
  isAdded: boolean;
  onAdd: () => void;
}

function FundRow({ fund, isAdded, onAdd }: FundRowProps) {
  return (
    <li
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:border-slate-700 dark:bg-slate-800"
      role="option"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground dark:text-slate-100">{fund.name}</span>
          <span className="rounded bg-background-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-slate-700 dark:text-slate-400">
            {fund.ticker}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
          {fund.assetClass} · {fund.expenseRatio.toFixed(2)}% exp · Risk {fund.riskLevel}/10
        </p>
      </div>
      <div className="flex shrink-0">
        <button
          type="button"
          onClick={onAdd}
          disabled={isAdded}
          className="min-h-[44px] min-w-[80px] rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isAdded ? "Added" : "Add"}
        </button>
      </div>
    </li>
  );
}

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FundAllocationRow } from "./FundAllocationRow";
import { AddInvestmentModal } from "./AddInvestmentModal";
import { useInvestment } from "../../context/InvestmentContext";
import { getFundById } from "../../data/mockFunds";
import { getSourceTotal, isSourceValid } from "../../utils/investmentAllocationHelpers";

type SourceKey = "preTax" | "roth" | "afterTax";

const SOURCE_LABELS: Record<SourceKey, string> = {
  preTax: "Pre-tax",
  roth: "Roth",
  afterTax: "After-tax",
};

const cardStyle: React.CSSProperties = {
  background: "var(--enroll-card-bg)",
  border: "1px solid var(--enroll-card-border)",
  borderRadius: "var(--enroll-card-radius)",
  boxShadow: "var(--enroll-elevation-2)",
};

function AllocationBadge({ total }: { total: number }) {
  const isValid = Math.abs(total - 100) < 0.01;
  const isOver = total > 100;

  return (
    <span
      className="text-xs font-bold px-2.5 py-0.5 rounded-full"
      style={{
        background: isValid
          ? "rgb(var(--enroll-accent-rgb) / 0.08)"
          : isOver
            ? "rgb(var(--color-danger-rgb) / 0.08)"
            : "rgb(var(--color-warning-rgb) / 0.08)",
        color: isValid
          ? "var(--enroll-accent)"
          : isOver
            ? "var(--color-danger)"
            : "var(--color-warning)",
      }}
    >
      {total.toFixed(1)}%
    </span>
  );
}

interface AllocationSubsectionProps {
  source: SourceKey;
  defaultExpanded: boolean;
}

function AllocationSubsection({ source, defaultExpanded }: AllocationSubsectionProps) {
  const {
    getFundsForSource,
    updateSourceAllocation,
    addFundToSource,
    removeFundFromSource,
    editAllocationEnabled,
  } = useInvestment();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showFundSearch, setShowFundSearch] = useState(false);
  const lastAddedFundIdRef = useRef<string | null>(null);

  const funds = getFundsForSource(source);
  const total = getSourceTotal(funds);
  const allocatedFundIds = funds.map((f) => f.fundId);

  const handleAddComplete = (fundId: string) => {
    lastAddedFundIdRef.current = fundId;
  };

  useEffect(() => {
    const fundId = lastAddedFundIdRef.current;
    if (!fundId) return;
    lastAddedFundIdRef.current = null;
    const input = document.querySelector<HTMLInputElement>(`[name="allocation-${fundId}"]`);
    if (input) {
      requestAnimationFrame(() => input.focus());
    }
  }, [funds]);

  return (
    <div>
      {/* Section trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded((x) => !x)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl transition-colors duration-200"
        style={{
          background: isExpanded ? "rgb(var(--enroll-brand-rgb) / 0.04)" : "var(--enroll-soft-bg)",
          border: isExpanded ? "1px solid rgb(var(--enroll-brand-rgb) / 0.1)" : "1px solid transparent",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold" style={{ color: "var(--enroll-text-primary)" }}>
            {SOURCE_LABELS[source]}
          </span>
          <span className="text-xs" style={{ color: "var(--enroll-text-muted)" }}>
            {funds.length} fund{funds.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <AllocationBadge total={total} />
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
              color: "var(--enroll-text-muted)",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2 space-y-3">
              <p className="text-xs px-1" style={{ color: "var(--enroll-text-muted)" }}>
                Allocate your {SOURCE_LABELS[source].toLowerCase()} contributions. Total must equal 100%.
              </p>

              {editAllocationEnabled && (
                <button
                  type="button"
                  onClick={() => setShowFundSearch(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    color: "var(--enroll-brand)",
                    background: "rgb(var(--enroll-brand-rgb) / 0.06)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v10M3 8h10" strokeLinecap="round" /></svg>
                  Add Investment
                </button>
              )}

              <div className="space-y-2">
                {funds.map((fa) => {
                  const fund = getFundById(fa.fundId);
                  if (!fund) return null;
                  return (
                    <FundAllocationRow
                      key={fa.fundId}
                      fund={fund}
                      allocation={{ fundId: fa.fundId, percentage: fa.allocationPercent }}
                      disabled={!editAllocationEnabled}
                      onAllocationChange={(pct) => updateSourceAllocation(source, fa.fundId, pct)}
                      onRemove={editAllocationEnabled ? () => removeFundFromSource(source, fa.fundId) : undefined}
                    />
                  );
                })}
              </div>

              {/* Total line */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{
                  background: isSourceValid(funds) ? "rgb(var(--enroll-accent-rgb) / 0.06)" : "rgb(var(--color-warning-rgb) / 0.06)",
                  border: isSourceValid(funds) ? "1px solid rgb(var(--enroll-accent-rgb) / 0.15)" : "1px solid rgb(var(--color-warning-rgb) / 0.15)",
                }}
              >
                <span className="text-xs font-semibold" style={{ color: "var(--enroll-text-secondary)" }}>
                  Total Allocation
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: isSourceValid(funds) ? "var(--enroll-accent)" : "var(--color-warning)" }}
                >
                  {total.toFixed(1)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddInvestmentModal
        open={showFundSearch}
        onClose={() => setShowFundSearch(false)}
        activeTaxSource={source}
        existingFundIds={allocatedFundIds}
        onAdd={(fundId) => addFundToSource(source, fundId)}
        onAddComplete={handleAddComplete}
      />
    </div>
  );
}

export function FundAllocationSection() {
  const {
    activeSources,
    editAllocationEnabled,
    setEditAllocationEnabled,
    hasPreTaxOrRoth,
    hasAfterTax,
    getFundsForSource,
    canConfirmAllocation,
  } = useInvestment();

  if (!hasPreTaxOrRoth && !hasAfterTax) return null;

  const anyOver = activeSources.some((src) => getSourceTotal(getFundsForSource(src)) > 100.01);
  const globalStatus: "error" | "warning" | "success" = canConfirmAllocation
    ? "success"
    : anyOver
      ? "error"
      : "warning";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      aria-labelledby="fund-allocation-heading"
    >
      <h2
        id="fund-allocation-heading"
        className="text-[10px] font-bold uppercase tracking-widest mb-4"
        style={{ color: "var(--enroll-text-muted)" }}
      >
        Fund Allocation
      </h2>

      <div className="p-5 space-y-5" style={cardStyle}>
        {/* Edit toggle */}
        <div
          className="flex items-center justify-between gap-3 p-4 rounded-xl"
          style={{ background: "var(--enroll-soft-bg)", border: "1px solid var(--enroll-card-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
              style={{ background: "rgb(var(--enroll-brand-rgb) / 0.1)", color: "var(--enroll-brand)" }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="4" y="8" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="2" />
                <path d="M6 8V5a4 4 0 118 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--enroll-text-primary)" }}>
                Edit allocation
              </p>
              <p className="text-[11px]" style={{ color: "var(--enroll-text-muted)" }}>
                Customize recommended allocations
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={editAllocationEnabled}
            onClick={() => setEditAllocationEnabled(!editAllocationEnabled)}
            className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{
              background: editAllocationEnabled ? "var(--enroll-brand)" : "var(--enroll-card-border)",
              borderColor: editAllocationEnabled ? "var(--enroll-brand)" : "var(--enroll-card-border)",
            }}
          >
            <span
              className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: editAllocationEnabled ? "translateX(20px)" : "translateX(2px)" }}
            />
          </button>
        </div>

        {/* Source subsections */}
        <div className="space-y-3">
          {activeSources.map((source, index) => (
            <AllocationSubsection key={source} source={source} defaultExpanded={index === 0} />
          ))}
        </div>

        {/* Global status */}
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{
            background: globalStatus === "success"
              ? "rgb(var(--enroll-accent-rgb) / 0.06)"
              : globalStatus === "error"
                ? "rgb(var(--color-danger-rgb) / 0.06)"
                : "rgb(var(--color-warning-rgb) / 0.06)",
            border: globalStatus === "success"
              ? "1px solid rgb(var(--enroll-accent-rgb) / 0.15)"
              : globalStatus === "error"
                ? "1px solid rgb(var(--color-danger-rgb) / 0.15)"
                : "1px solid rgb(var(--color-warning-rgb) / 0.15)",
          }}
          role="status"
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
            style={{
              background: globalStatus === "success"
                ? "var(--enroll-accent)"
                : globalStatus === "error"
                  ? "var(--color-danger)"
                  : "var(--color-warning)",
            }}
          >
            {globalStatus === "success" ? "✓" : "!"}
          </span>
          <div>
            <p className="text-sm font-semibold" style={{
              color: globalStatus === "success"
                ? "var(--enroll-accent)"
                : globalStatus === "error"
                  ? "var(--color-danger)"
                  : "var(--color-warning)",
            }}>
              {globalStatus === "success" && "Total Allocation: 100%"}
              {globalStatus === "error" && "Over-allocated"}
              {globalStatus === "warning" && "Incomplete allocation"}
            </p>
            <p className="text-xs" style={{ color: "var(--enroll-text-muted)" }}>
              {globalStatus === "success" && "Your allocation is complete."}
              {globalStatus === "error" && "Reduce allocations so each source totals 100%."}
              {globalStatus === "warning" && "Each source must total exactly 100%."}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

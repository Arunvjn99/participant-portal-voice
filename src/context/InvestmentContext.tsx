import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  FundAllocation,
  InvestmentAllocation,
  ContributionSources,
} from "../types/investment";
import {
  buildInitialAllocation,
  getActiveSources,
  getSourceTotal,
  isSourceValid,
  redistributeOnRemove,
  computeWeightedAllocation,
  fundAllocationsToChartFormat,
} from "../utils/investmentAllocationHelpers";
import { loadEnrollmentDraft } from "../enrollment/enrollmentDraftStore";
import type { InvestmentDraftSnapshot } from "../enrollment/enrollmentDraftStore";
import type { InvestmentProfile } from "../enrollment/types/investmentProfile";
import { getFundById } from "../data/mockFunds";

type SourceKey = "preTax" | "roth" | "afterTax";

interface InvestmentContextValue {
  /** Contribution sources (preTax, roth, afterTax) - only active appear */
  sourceAllocation: ContributionSources;
  /** Per-source investment allocation */
  investmentAllocation: InvestmentAllocation;
  /** Edit toggle: OFF = disabled, use plan default; ON = editable */
  editAllocationEnabled: boolean;
  setEditAllocationEnabled: (enabled: boolean) => void;

  /** Get funds for a source */
  getFundsForSource: (source: SourceKey) => FundAllocation[];
  /** Update allocation percent for a fund in a source */
  updateSourceAllocation: (
    source: SourceKey,
    fundId: string,
    allocationPercent: number
  ) => void;
  /** Add fund to source (allocationPercent = 0) */
  addFundToSource: (source: SourceKey, fundId: string) => void;
  /** Remove fund from source; redistributes proportionally */
  removeFundFromSource: (source: SourceKey, fundId: string) => void;

  /** Weighted summary for chart and metrics */
  weightedSummary: ReturnType<typeof computeWeightedAllocation>;
  /** Chart-compatible allocations (fundId, percentage) */
  chartAllocations: { fundId: string; percentage: number }[];

  /** Can confirm: all active sources total exactly 100% */
  canConfirmAllocation: boolean;
  /** Persist and navigate - called on Confirm */
  confirmAllocation: () => void;
  /** Snapshot for draft persistence */
  getInvestmentSnapshot: () => InvestmentDraftSnapshot;

  /** Active source flags */
  hasPreTaxOrRoth: boolean;
  hasAfterTax: boolean;
  activeSources: SourceKey[];
}

const InvestmentContext = createContext<InvestmentContextValue | undefined>(
  undefined
);

const DEFAULT_SOURCE_ALLOCATION: ContributionSources = {
  preTax: 100,
  roth: 0,
  afterTax: 0,
};

interface InvestmentProviderProps {
  children: ReactNode;
  /** Contribution source percentages - drives which accordions appear */
  sourceAllocation?: ContributionSources;
  /** When true, pre-tax/roth allocation section is shown */
  hasPreTaxOrRoth?: boolean;
  /** When true, after-tax allocation section is shown */
  hasAfterTax?: boolean;
  /** AI Investment Profile - drives default edit toggle and portfolio type */
  investmentProfile?: InvestmentProfile | null;
}

function getDefaultEditEnabled(profile: InvestmentProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.investmentPreference === "adjust allocations" || profile.investmentPreference === "full manual";
}

export const InvestmentProvider = ({
  children,
  sourceAllocation: sourceAllocationProp,
  hasPreTaxOrRoth = true,
  hasAfterTax = false,
  investmentProfile,
}: InvestmentProviderProps) => {
  const sourceAllocation = sourceAllocationProp ?? DEFAULT_SOURCE_ALLOCATION;
  const [investmentAllocation, setInvestmentAllocation] =
    useState<InvestmentAllocation>(() =>
      buildInitialAllocation(sourceAllocation)
    );
  const [editAllocationEnabled, setEditAllocationEnabledState] = useState(
    () => getDefaultEditEnabled(investmentProfile)
  );

  const setEditAllocationEnabled = useCallback(
    (enabled: boolean) => {
      setEditAllocationEnabledState(enabled);
      if (!enabled) {
        // When turning OFF: reset to plan default
        setInvestmentAllocation(buildInitialAllocation(sourceAllocation));
      }
    },
    [sourceAllocation]
  );

  const activeSources = useMemo(
    () => getActiveSources(sourceAllocation),
    [sourceAllocation]
  );

  // Hydrate from enrollment draft when returning to Investments step
  useEffect(() => {
    const draft = loadEnrollmentDraft();
    const inv = draft?.investment;
    if (!inv?.sourceAllocation) return;
    setInvestmentAllocation(inv.sourceAllocation);
    setEditAllocationEnabled(inv.editAllocationEnabled ?? false);
  }, []);

  // When contribution sources change (e.g. user went back to Contribution), rebuild
  useEffect(() => {
    const prevKeys = Object.keys(investmentAllocation) as SourceKey[];
    const newKeys = activeSources;
    const removed = prevKeys.filter((k) => !newKeys.includes(k));
    if (removed.length === 0) return;

    setInvestmentAllocation((prev) => {
      const next = { ...prev };
      for (const k of removed) {
        delete next[k];
      }
      return next;
    });
  }, [activeSources]);

  // Initialize missing sources with plan default
  useEffect(() => {
    setInvestmentAllocation((prev) => {
      const next = { ...prev };
      const initial = buildInitialAllocation(sourceAllocation);
      let changed = false;
      for (const key of activeSources) {
        if (!next[key]?.funds?.length) {
          next[key] = initial[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [sourceAllocation, activeSources]);

  const getFundsForSource = useCallback(
    (source: SourceKey): FundAllocation[] => {
      const s = investmentAllocation[source];
      return s?.funds ?? [];
    },
    [investmentAllocation]
  );

  const updateSourceAllocation = useCallback(
    (source: SourceKey, fundId: string, allocationPercent: number) => {
      setInvestmentAllocation((prev) => {
        const s = prev[source];
        if (!s) return prev;
        const funds = s.funds.map((f) =>
          f.fundId === fundId
            ? { ...f, allocationPercent: Math.max(0, Math.min(100, allocationPercent)) }
            : f
        );
        return { ...prev, [source]: { funds } };
      });
    },
    []
  );

  const addFundToSource = useCallback((source: SourceKey, fundId: string) => {
    const fund = getFundById(fundId);
    if (!fund) return;
    const fa: FundAllocation = {
      fundId: fund.id,
      fundName: fund.name,
      assetClass: fund.assetClass,
      expenseRatio: fund.expenseRatio,
      riskScore: fund.riskLevel,
      allocationPercent: 0,
    };
    setInvestmentAllocation((prev) => {
      const s = prev[source];
      if (!s) return prev;
      if (s.funds.some((f) => f.fundId === fundId)) return prev;
      return {
        ...prev,
        [source]: { funds: [...s.funds, fa] },
      };
    });
  }, []);

  const removeFundFromSource = useCallback(
    (source: SourceKey, fundId: string) => {
      setInvestmentAllocation((prev) => {
        const s = prev[source];
        if (!s) return prev;
        const funds = redistributeOnRemove(s.funds, fundId);
        return { ...prev, [source]: { funds } };
      });
    },
    []
  );

  const weightedSummary = useMemo(
    () => computeWeightedAllocation(investmentAllocation, sourceAllocation),
    [investmentAllocation, sourceAllocation]
  );

  const chartAllocations = useMemo(
    () => fundAllocationsToChartFormat(weightedSummary.funds),
    [weightedSummary.funds]
  );

  const canConfirmAllocation = useMemo(() => {
    for (const key of activeSources) {
      const funds = investmentAllocation[key]?.funds ?? [];
      if (!isSourceValid(funds)) return false;
    }
    return true;
  }, [investmentAllocation, activeSources]);

  const confirmAllocation = useCallback(() => {
    if (!canConfirmAllocation) return;
    // Persistence happens in footer via getInvestmentSnapshot
  }, [canConfirmAllocation]);

  const getInvestmentSnapshot = useCallback((): InvestmentDraftSnapshot => ({
    sourceAllocation: JSON.parse(JSON.stringify(investmentAllocation)),
    editAllocationEnabled,
  }), [investmentAllocation, editAllocationEnabled]);

  const value: InvestmentContextValue = {
    sourceAllocation,
    investmentAllocation,
    editAllocationEnabled,
    setEditAllocationEnabled,
    getFundsForSource,
    updateSourceAllocation,
    addFundToSource,
    removeFundFromSource,
    weightedSummary,
    chartAllocations,
    canConfirmAllocation,
    confirmAllocation,
    getInvestmentSnapshot,
    hasPreTaxOrRoth,
    hasAfterTax,
    activeSources,
  };

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
};

export const useInvestment = (): InvestmentContextValue => {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error("useInvestment must be used within InvestmentProvider");
  }
  return context;
};

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import type {
  ContributionType,
  ContributionSource,
  MonthlyContribution,
  ContributionAssumptions,
  AutoIncreaseSettings,
} from "../logic/types";
import type { InvestmentProfile } from "../types/investmentProfile";
import { deriveContribution } from "../logic/contributionCalculator";

// Normalized plan IDs - stable enum values
export type SelectedPlanId = "traditional_401k" | "roth_401k" | "roth_ira" | null;

interface EnrollmentState {
  // Plan selection
  selectedPlan: SelectedPlanId;
  isInitialized: boolean;
  
  // Contribution inputs
  salary: number;
  contributionType: ContributionType;
  contributionAmount: number;
  contributionSource: ContributionSource[];
  employerMatchEnabled: boolean;
  employerMatchIsCustom: boolean;
  
  // Assumptions
  assumptions: ContributionAssumptions;
  
  // Contribution source allocation (preTax + roth + afterTax = 100)
  sourceAllocation: { preTax: number; roth: number; afterTax: number };
  
  // UI: sources edit mode
  sourcesEditMode: boolean;
  // UI: sources view mode - percent or dollar
  sourcesViewMode: "percent" | "dollar";
  
  // Auto-increase
  autoIncrease: AutoIncreaseSettings;
  
  // Profile data (from previous steps)
  currentAge: number;
  retirementAge: number;
  currentBalance: number;

  // AI Investment Profile (from wizard before Investments step)
  investmentProfile: InvestmentProfile | null;
  investmentProfileCompleted: boolean;
}

interface EnrollmentContextValue {
  // State
  state: EnrollmentState;
  
  // Setters
  setSelectedPlan: (planId: SelectedPlanId) => void;
  setSalary: (salary: number) => void;
  setContributionType: (type: ContributionType) => void;
  setContributionAmount: (amount: number) => void;
  setCurrentAge: (age: number) => void;
  setRetirementAge: (age: number) => void;
  setEmployerMatchEnabled: (enabled: boolean) => void;
  setEmployerMatchIsCustom: (isCustom: boolean) => void;
  setAssumptions: (assumptions: ContributionAssumptions) => void;
  setSourceAllocation: (alloc: { preTax: number; roth: number; afterTax: number }) => void;
  setSourcesEditMode: (enabled: boolean) => void;
  setSourcesViewMode: (mode: "percent" | "dollar") => void;
  setAutoIncrease: (settings: AutoIncreaseSettings) => void;
  setInvestmentProfile: (profile: InvestmentProfile) => void;
  setInvestmentProfileCompleted: (completed: boolean) => void;

  // Derived values
  monthlyContribution: MonthlyContribution;
  estimatedRetirementBalance: number;
  perPaycheck: number;
}

const EnrollmentContext = createContext<EnrollmentContextValue | undefined>(undefined);

interface EnrollmentProviderProps {
  children: ReactNode;
  initialSalary?: number;
  initialContributionType?: ContributionType;
  initialContributionAmount?: number;
  initialSourceAllocation?: { preTax: number; roth: number; afterTax: number };
  initialAge?: number;
  initialRetirementAge?: number;
  initialBalance?: number;
  initialSelectedPlan?: SelectedPlanId;
  initialInvestmentProfile?: InvestmentProfile;
  initialInvestmentProfileCompleted?: boolean;
}

const DEFAULT_SOURCE_ALLOCATION = { preTax: 100, roth: 0, afterTax: 0 };

export const EnrollmentProvider = ({
  children,
  initialSalary = 0,
  initialContributionType = "percentage",
  initialContributionAmount = 0,
  initialSourceAllocation,
  initialAge = 30,
  initialRetirementAge = 65,
  initialBalance = 0,
  initialSelectedPlan = null,
  initialInvestmentProfile,
  initialInvestmentProfileCompleted = false,
}: EnrollmentProviderProps) => {
  const [state, setState] = useState<EnrollmentState>({
    selectedPlan: initialSelectedPlan,
    isInitialized: true, // Mark as initialized after first render
    salary: initialSalary,
    contributionType: initialContributionType,
    contributionAmount: initialContributionAmount,
    contributionSource: ["preTax"],
    employerMatchEnabled: true,
    employerMatchIsCustom: false,
    sourceAllocation: initialSourceAllocation ?? DEFAULT_SOURCE_ALLOCATION,
    sourcesEditMode: true,
    sourcesViewMode: "percent",
    autoIncrease: {
      enabled: false,
      percentage: 1,
      maxPercentage: 15,
    },
    assumptions: {
      employerMatchPercentage: 100,
      employerMatchCap: 6,
      annualReturnRate: 7,
      inflationRate: 2.5,
    },
    currentAge: initialAge,
    retirementAge: initialRetirementAge,
    currentBalance: initialBalance,
    investmentProfile: initialInvestmentProfile ?? null,
    investmentProfileCompleted: initialInvestmentProfileCompleted,
  });

  // Derived values - single source of truth per Figma spec
  const { monthlyContribution, estimatedRetirementBalance, perPaycheck } = useMemo(() => {
    const derived = deriveContribution({
      contributionType: state.contributionType,
      contributionValue: state.contributionAmount,
      annualSalary: state.salary,
      paychecksPerYear: 26,
      employerMatchEnabled: state.employerMatchEnabled,
      employerMatchCap: state.assumptions.employerMatchCap,
      employerMatchPercentage: state.assumptions.employerMatchPercentage,
      currentAge: state.currentAge,
      retirementAge: state.retirementAge,
    });
    return {
      monthlyContribution: {
        employee: derived.monthlyContribution,
        employer: derived.employerMatchMonthly,
        total: derived.totalMonthlyInvestment,
      } as MonthlyContribution,
      estimatedRetirementBalance: derived.estimatedRetirementBalance,
      perPaycheck: derived.perPaycheck,
    };
  }, [
    state.contributionType,
    state.contributionAmount,
    state.salary,
    state.employerMatchEnabled,
    state.assumptions.employerMatchCap,
    state.assumptions.employerMatchPercentage,
    state.currentAge,
    state.retirementAge,
  ]);

  const value: EnrollmentContextValue = {
    state,
    setSelectedPlan: (planId) => setState((prev) => ({ ...prev, selectedPlan: planId })),
    setSalary: (salary) => setState((prev) => ({ ...prev, salary })),
    setContributionType: (type) => setState((prev) => ({ ...prev, contributionType: type })),
    setContributionAmount: (amount) => setState((prev) => ({ ...prev, contributionAmount: amount })),
    setCurrentAge: (age) => setState((prev) => ({ ...prev, currentAge: age })),
    setRetirementAge: (age) => setState((prev) => ({ ...prev, retirementAge: age })),
    setEmployerMatchEnabled: (enabled) => setState((prev) => ({ ...prev, employerMatchEnabled: enabled })),
    setEmployerMatchIsCustom: (isCustom) => setState((prev) => ({ ...prev, employerMatchIsCustom: isCustom })),
    setAssumptions: (assumptions) => setState((prev) => ({ ...prev, assumptions })),
    setSourceAllocation: (alloc) => setState((prev) => ({ ...prev, sourceAllocation: alloc })),
    setSourcesEditMode: (enabled) => setState((prev) => ({ ...prev, sourcesEditMode: enabled })),
    setSourcesViewMode: (mode) => setState((prev) => ({ ...prev, sourcesViewMode: mode })),
    setAutoIncrease: (settings) => setState((prev) => ({ ...prev, autoIncrease: settings })),
    setInvestmentProfile: (profile) => setState((prev) => ({ ...prev, investmentProfile: profile })),
    setInvestmentProfileCompleted: (completed) =>
      setState((prev) => ({ ...prev, investmentProfileCompleted: completed })),
    monthlyContribution,
    estimatedRetirementBalance,
    perPaycheck,
  };

  return <EnrollmentContext.Provider value={value}>{children}</EnrollmentContext.Provider>;
};

export const useEnrollment = (): EnrollmentContextValue => {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error("useEnrollment must be used within EnrollmentProvider");
  }
  return context;
};

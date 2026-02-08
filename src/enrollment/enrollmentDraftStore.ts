import type { SelectedPlanId } from "./context/EnrollmentContext";
import type { ContributionType } from "./logic/types";
import type { InvestmentAllocation } from "../types/investment";
import type { InvestmentProfile } from "./types/investmentProfile";

/**
 * Investment draft snapshot for persistence
 */
export interface InvestmentDraftSnapshot {
  /** Per-source allocation; only keys with active sources present */
  sourceAllocation: InvestmentAllocation;
  /** Edit toggle: when OFF, use plan default; when ON, user edits apply */
  editAllocationEnabled: boolean;
}

/**
 * Enrollment draft - single source of truth for wizard data.
 * Persisted to sessionStorage for reuse across wizard → plans flow.
 */
export interface EnrollmentDraft {
  currentAge: number;
  retirementAge: number;
  yearsToRetire: number;
  annualSalary: number;
  retirementLocation: string;
  otherSavings?: {
    type: string | null;
    amount: number | null;
  };
  /** Selected plan on plans page - persisted on Save & Exit */
  selectedPlanId?: SelectedPlanId | null;
  /** Contribution settings - persisted on Save & Exit from Contribution step */
  contributionType?: ContributionType;
  contributionAmount?: number;
  /** Source allocation (preTax + roth + afterTax = 100) - drives Investment accordions */
  sourceAllocation?: { preTax: number; roth: number; afterTax: number };
  /** AI Investment Profile - completed before Investments step */
  investmentProfile?: InvestmentProfile;
  investmentProfileCompleted?: boolean;
  /** Investment elections - persisted on Save & Exit from Investments step */
  investment?: InvestmentDraftSnapshot;
}

const STORAGE_KEY = "enrollment-draft";

/** Used by Save & Exit to trigger toast on Dashboard */
export const ENROLLMENT_SAVED_TOAST_KEY = "enrollment-saved-toast";

export function loadEnrollmentDraft(): EnrollmentDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EnrollmentDraft;
  } catch {
    return null;
  }
}

export function saveEnrollmentDraft(draft: EnrollmentDraft): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearEnrollmentDraft(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

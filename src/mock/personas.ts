/* ─────────────────────────────────────────────────────────────────────────
   Persona-Based Demo Login System
   For demonstration purposes only — no real authentication.
   ───────────────────────────────────────────────────────────────────────── */

export type PersonaType =
  | "pre_enrollment"
  | "new_enrollee"
  | "young_accumulator"
  | "mid_career"
  | "pre_retiree"
  | "at_risk"
  | "loan_active"
  | "retired";

export interface PersonaProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  balance: number;
  contributionRate: number;
  employerMatchRate: number;
  retirementScore: number;
  enrollmentStatus: "not_enrolled" | "enrolled" | "retired";
  scenario: PersonaType;
  flags: {
    autoEnrollment?: boolean;
    loanActive?: boolean;
    lowContribution?: boolean;
    lifeEvent?: "marriage" | "child" | "home" | null;
  };
}

/** Scenario display labels for UI badges and switcher. */
export const SCENARIO_LABELS: Record<PersonaType, string> = {
  pre_enrollment: "Pre-Enrollment",
  new_enrollee: "New Enrollee",
  young_accumulator: "Young Accumulator",
  mid_career: "Mid-Career",
  pre_retiree: "Pre-Retiree",
  at_risk: "At Risk",
  loan_active: "Loan Active",
  retired: "Retired",
};

export const personas: PersonaProfile[] = [
  {
    id: "demo_pre",
    email: "pre@demo.com",
    name: "Sarah",
    age: 25,
    balance: 0,
    contributionRate: 0,
    employerMatchRate: 6,
    retirementScore: 0,
    enrollmentStatus: "not_enrolled",
    scenario: "pre_enrollment",
    flags: { autoEnrollment: true },
  },
  {
    id: "demo_young",
    email: "young@demo.com",
    name: "Alex",
    age: 29,
    balance: 18450,
    contributionRate: 6,
    employerMatchRate: 6,
    retirementScore: 72,
    enrollmentStatus: "enrolled",
    scenario: "young_accumulator",
    flags: {},
  },
  {
    id: "demo_mid",
    email: "mid@demo.com",
    name: "John",
    age: 42,
    balance: 125000,
    contributionRate: 6,
    employerMatchRate: 6,
    retirementScore: 72,
    enrollmentStatus: "enrolled",
    scenario: "mid_career",
    flags: {},
  },
  {
    id: "demo_risk",
    email: "risk@demo.com",
    name: "Mike",
    age: 37,
    balance: 9800,
    contributionRate: 2,
    employerMatchRate: 6,
    retirementScore: 48,
    enrollmentStatus: "enrolled",
    scenario: "at_risk",
    flags: { lowContribution: true },
  },
  {
    id: "demo_retire",
    email: "retire@demo.com",
    name: "Linda",
    age: 66,
    balance: 812450,
    contributionRate: 0,
    employerMatchRate: 0,
    retirementScore: 100,
    enrollmentStatus: "retired",
    scenario: "retired",
    flags: {},
  },
];

/** LocalStorage key for persisting the active demo user. */
export const DEMO_USER_KEY = "demoUser";

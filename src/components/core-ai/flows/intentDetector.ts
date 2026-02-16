/**
 * intentDetector.ts — Detects which scripted flow (if any) should handle user input.
 *
 * Priority:
 *  1. If a flow is already active → route to that flow
 *  2. If input matches a known intent → start that flow
 *  3. Otherwise → fall through to LLM / general AI
 *
 * This module is pure logic — no React, no UI, no side effects.
 */

export type FlowType = "enrollment" | "loan" | "withdrawal" | "vesting";

export interface IntentResult {
  /** Which flow the input belongs to, or null for general AI */
  flow: FlowType | null;
  /** Whether this is a direct match (user explicitly asked) vs indirect */
  isDirect: boolean;
}

/* ── Pattern matchers ── */

const ENROLLMENT_PATTERNS = [
  /\benroll/i,
  /start enrollment/i,
  /begin enrollment/i,
  /sign up/i,
  /join the plan/i,
  /new enrollment/i,
  /i want to enroll/i,
  /start my enrollment/i,
];

const LOAN_DIRECT_PATTERNS = [
  /apply for (?:a )?loan/i,
  /start (?:a )?loan/i,
  /loan application/i,
  /want to borrow/i,
  /need a loan/i,
  /get a loan/i,
  /i want a loan/i,
  /i need a loan/i,
  /i want to apply for a loan/i,
];

const LOAN_INDIRECT_PATTERNS = [
  /borrow from (?:my )?retirement/i,
  /access my 401k/i,
  /need cash urgently/i,
  /borrow from 401k/i,
  /get money from (?:my )?401k/i,
  /take money from (?:my )?401k/i,
  /use my 401k/i,
  /access retirement/i,
];

const WITHDRAWAL_PATTERNS = [
  /how much can i withdraw/i,
  /withdraw from (?:my )?401k?/i,
  /withdrawal (?:info|rules|options)/i,
  /(?:can i |may i )?withdraw/i,
  /(?:what are|tell me about) (?:the )?withdrawal/i,
];

const VESTING_PATTERNS = [
  /vested balance/i,
  /vesting schedule/i,
  /how much (?:is|do i have) vested/i,
  /my vesting/i,
];

function matchesAny(input: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(input));
}

/**
 * Detect intent from raw user input.
 * Does NOT check active flow state — that's the router's job.
 */
export function detectIntent(input: string): IntentResult {
  const text = input.trim();

  if (matchesAny(text, ENROLLMENT_PATTERNS)) {
    return { flow: "enrollment", isDirect: true };
  }

  if (matchesAny(text, LOAN_DIRECT_PATTERNS)) {
    return { flow: "loan", isDirect: true };
  }

  if (matchesAny(text, LOAN_INDIRECT_PATTERNS)) {
    return { flow: "loan", isDirect: false };
  }

  if (matchesAny(text, WITHDRAWAL_PATTERNS)) {
    return { flow: "withdrawal", isDirect: true };
  }

  if (matchesAny(text, VESTING_PATTERNS)) {
    return { flow: "vesting", isDirect: true };
  }

  return { flow: null, isDirect: false };
}

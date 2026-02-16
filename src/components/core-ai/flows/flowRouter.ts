/**
 * flowRouter.ts — Orchestrates all scripted flows for CoreAssistantModal.
 *
 * Decision logic:
 *  1. If an active flow exists → route message to that flow
 *  2. If input matches a known intent → start that flow
 *  3. Otherwise → return null (caller falls through to general AI)
 *
 * The `respond` callback allows interactive components to inject messages
 * directly into the flow without going through the text input.
 */

import { detectIntent, type FlowType } from "./intentDetector";
import {
  startEnrollmentFlow,
  handleEnrollmentIntent,
  type EnrollmentFlowState,
} from "./enrollmentFlow";
import {
  startLoanFlow,
  handleLoanIntent,
  type LoanFlowState,
} from "./loanFlow";
import {
  startWithdrawalFlow,
  handleWithdrawalIntent,
  type WithdrawalFlowState,
} from "./withdrawalFlow";
import {
  startVestingFlow,
  handleVestingIntent,
  type VestingFlowState,
} from "./vestingFlow";
import type { ChatMessage } from "../MessageBubble";

/* ── Combined flow state ── */
export interface ActiveFlowState {
  type: FlowType;
  enrollment?: EnrollmentFlowState;
  loan?: LoanFlowState;
  withdrawal?: WithdrawalFlowState;
  vesting?: VestingFlowState;
}

export interface FlowRouterResult {
  /** Messages to append to the conversation */
  messages: ChatMessage[];
  /** Updated flow state (null = flow ended, return to general AI) */
  flowState: ActiveFlowState | null;
}

/**
 * Route a user message through the scripted flow system.
 *
 * @param input - The user's message text
 * @param activeFlow - The currently active flow (null if none)
 * @param respond - Callback to inject a message back into the flow (for interactive components)
 * @returns FlowRouterResult if handled, or null if the message should go to general AI
 */
export function routeMessage(
  input: string,
  activeFlow: ActiveFlowState | null,
  respond: (text: string) => void,
): FlowRouterResult | null {
  const text = input.trim();

  /* ── 1. Active flow: route to the active handler ── */
  if (activeFlow) {
    /* Allow user to explicitly break out to a different flow */
    const intent = detectIntent(text);
    if (intent.flow && intent.flow !== activeFlow.type && intent.isDirect) {
      return startFlow(intent.flow, respond);
    }

    return continueFlow(text, activeFlow, respond);
  }

  /* ── 2. No active flow: detect intent ── */
  const intent = detectIntent(text);
  if (intent.flow) {
    return startFlow(intent.flow, respond);
  }

  /* ── 3. No match: fall through to general AI ── */
  return null;
}

/* ── Internal helpers ── */

function startFlow(type: FlowType, respond: (text: string) => void): FlowRouterResult {
  switch (type) {
    case "enrollment": {
      const result = startEnrollmentFlow();
      return {
        messages: result.nextMessages,
        flowState: result.nextState
          ? { type: "enrollment", enrollment: result.nextState }
          : null,
      };
    }
    case "loan": {
      const result = startLoanFlow();
      return {
        messages: result.nextMessages,
        flowState: result.nextState
          ? { type: "loan", loan: result.nextState }
          : null,
      };
    }
    case "withdrawal": {
      const result = startWithdrawalFlow();
      return {
        messages: result.nextMessages,
        flowState: result.nextState
          ? { type: "withdrawal", withdrawal: result.nextState }
          : null,
      };
    }
    case "vesting": {
      const result = startVestingFlow();
      return {
        messages: result.nextMessages,
        flowState: result.nextState
          ? { type: "vesting", vesting: result.nextState }
          : null,
      };
    }
  }
}

function continueFlow(
  input: string,
  activeFlow: ActiveFlowState,
  respond: (text: string) => void,
): FlowRouterResult {
  switch (activeFlow.type) {
    case "enrollment": {
      if (!activeFlow.enrollment) return startFlow("enrollment", respond);
      const result = handleEnrollmentIntent(input, activeFlow.enrollment, respond);
      return {
        messages: result.nextMessages,
        flowState: result.nextState
          ? { type: "enrollment", enrollment: result.nextState }
          : null,
      };
    }
    case "loan": {
      if (!activeFlow.loan) return startFlow("loan", respond);
      const result = handleLoanIntent(input, activeFlow.loan, respond);
      return {
        messages: result.nextMessages,
        flowState: result.nextState
          ? { type: "loan", loan: result.nextState }
          : null,
      };
    }
    case "withdrawal": {
      if (!activeFlow.withdrawal) return startFlow("withdrawal", respond);
      const result = handleWithdrawalIntent(input, activeFlow.withdrawal, respond);
      return {
        messages: result.nextMessages,
        flowState: result.nextState
          ? { type: "withdrawal", withdrawal: result.nextState }
          : null,
      };
    }
    case "vesting": {
      if (!activeFlow.vesting) return startFlow("vesting", respond);
      const result = handleVestingIntent(input, activeFlow.vesting, respond);
      return {
        messages: result.nextMessages,
        flowState: result.nextState
          ? { type: "vesting", vesting: result.nextState }
          : null,
      };
    }
  }
}

/**
 * vestingFlow.tsx — Wraps vestingInfoAgent for CoreAssistantModal.
 *
 * Returns interactive summary card for vesting info.
 */

import {
  createInitialVestingState,
  getVestingResponse,
  type VestingState,
} from "../../../bella/agents/vestingInfoAgent";
import type { ChatMessage } from "../MessageBubble";
import { SummaryCard, type SummaryRow } from "../interactive";

export interface VestingFlowState {
  agentState: VestingState;
}

export interface FlowResult {
  nextMessages: ChatMessage[];
  nextState: VestingFlowState | null;
  isComplete: boolean;
}

let counter = 0;
const nextId = () => `vesting-${++counter}-${Date.now()}`;

function buildStepComponent(
  step: string,
  agentState: VestingState,
  respond: (text: string) => void,
): React.ReactNode | null {
  if (step === "FOLLOWUP") {
    const rows: SummaryRow[] = [
      { label: "Your contributions", value: "Always 100% vested", accent: "success" },
      { label: "Employer contributions", value: "Vests over time", accent: "info" },
    ];
    if (agentState.planData?.scheduleType) {
      rows.push({
        label: "Vesting schedule",
        value: agentState.planData.scheduleType === "cliff" ? "Cliff vesting" : "Graded vesting",
      });
    }
    if (typeof agentState.planData?.currentVestingPct === "number") {
      rows.push({
        label: "Current vesting",
        value: `${agentState.planData.currentVestingPct}%`,
        accent: agentState.planData.currentVestingPct >= 100 ? "success" : "warning",
      });
    }

    return (
      <SummaryCard
        title="Vesting overview"
        rows={rows}
        actions={[
          { label: "View vesting schedule", variant: "primary", onClick: () => respond("View vesting schedule") },
          { label: "Can I withdraw?", variant: "secondary", onClick: () => respond("Can I withdraw from this?") },
          { label: "Can I take a loan?", variant: "secondary", onClick: () => respond("Can I take a loan?") },
        ]}
      />
    );
  }

  return null;
}

export function startVestingFlow(): FlowResult {
  const agentState = createInitialVestingState();
  const response = getVestingResponse(agentState, "start");

  /* Vesting starts with text and may immediately go to FOLLOWUP */
  const msgs: ChatMessage[] = [{
    id: nextId(),
    role: "assistant",
    content: response.message,
    timestamp: new Date(),
  }];

  /* If the agent went to FOLLOWUP, add the component */
  if (response.nextState.step === "FOLLOWUP") {
    const component = buildStepComponent("FOLLOWUP", response.nextState, () => {});
    if (component) {
      msgs.push({
        id: nextId(),
        role: "assistant",
        type: "component",
        content: "[Vesting: FOLLOWUP]",
        timestamp: new Date(),
        component,
      });
    }
  }

  return {
    nextMessages: msgs,
    nextState: { agentState: response.nextState },
    isComplete: response.isComplete,
  };
}

export function handleVestingIntent(
  message: string,
  currentState: VestingFlowState,
  respond: (text: string) => void,
): FlowResult {
  const response = getVestingResponse(currentState.agentState, message);
  const step = response.nextState.step;

  const component = buildStepComponent(step, response.nextState, respond);

  if (component) {
    const msgs: ChatMessage[] = [];

    if (response.message) {
      msgs.push({
        id: nextId(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      });
    }

    msgs.push({
      id: nextId(),
      role: "assistant",
      type: "component",
      content: `[Vesting: ${step}]`,
      timestamp: new Date(),
      component,
    });

    return {
      nextMessages: msgs,
      nextState: response.isComplete ? null : { agentState: response.nextState },
      isComplete: response.isComplete,
    };
  }

  const assistantMsg: ChatMessage = {
    id: nextId(),
    role: "assistant",
    content: response.message,
    timestamp: new Date(),
    suggestions: response.isComplete ? undefined : getSuggestions(step),
  };

  return {
    nextMessages: [assistantMsg],
    nextState: response.isComplete ? null : { agentState: response.nextState },
    isComplete: response.isComplete,
  };
}

function getSuggestions(step: string): string[] | undefined {
  switch (step) {
    case "START": return ["View vesting schedule", "How does vesting affect withdrawals?"];
    default: return undefined;
  }
}

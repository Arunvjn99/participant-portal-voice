/**
 * withdrawalFlow.tsx — Wraps withdrawalInfoAgent for CoreAssistantModal.
 *
 * Returns interactive components for eligibility checks and summaries.
 */

import {
  createInitialWithdrawalState,
  getWithdrawalResponse,
  type WithdrawalState,
} from "../../../bella/agents/withdrawalInfoAgent";
import type { ChatMessage } from "../MessageBubble";
import { InteractiveCard, InteractiveOption, SummaryCard, type SummaryRow } from "../interactive";

export interface WithdrawalFlowState {
  agentState: WithdrawalState;
}

export interface FlowResult {
  nextMessages: ChatMessage[];
  nextState: WithdrawalFlowState | null;
  isComplete: boolean;
}

let counter = 0;
const nextId = () => `withdraw-${++counter}-${Date.now()}`;

function buildStepComponent(
  step: string,
  agentState: WithdrawalState,
  respond: (text: string) => void,
): React.ReactNode | null {
  switch (step) {
    case "AGE_CHECK":
      return (
        <InteractiveCard title="Age verification" subtitle="This helps determine your withdrawal options">
          <div className="space-y-2">
            <InteractiveOption
              label="I'm 59½ or older"
              hint="May qualify for penalty-free withdrawals"
              onClick={() => respond("I'm 59.5 or older")}
              index={0}
            />
            <InteractiveOption
              label="I'm younger than 59½"
              hint="Early withdrawal rules may apply"
              onClick={() => respond("I'm younger than 59.5")}
              index={1}
            />
          </div>
        </InteractiveCard>
      );

    case "EMPLOYMENT_CHECK":
      return (
        <InteractiveCard title="Employment status" subtitle="Current employment affects your withdrawal options">
          <div className="space-y-2">
            <InteractiveOption
              label="Currently employed"
              hint="In-service withdrawal rules apply"
              onClick={() => respond("Currently employed")}
              index={0}
            />
            <InteractiveOption
              label="No longer employed"
              hint="Post-employment distribution options"
              onClick={() => respond("No longer employed")}
              index={1}
            />
          </div>
        </InteractiveCard>
      );

    case "ELIGIBILITY_SUMMARY": {
      const rows: SummaryRow[] = [];
      if (agentState.is59OrOlder !== undefined) {
        rows.push({
          label: "Age",
          value: agentState.is59OrOlder ? "59½ or older" : "Under 59½",
          accent: agentState.is59OrOlder ? "success" : "warning",
        });
      }
      if (agentState.isEmployed !== undefined) {
        rows.push({
          label: "Employment",
          value: agentState.isEmployed ? "Currently employed" : "No longer employed",
        });
      }
      rows.push({
        label: "In-service withdrawals",
        value: agentState.is59OrOlder ? "Available" : "Limited",
        accent: agentState.is59OrOlder ? "success" : "warning",
      });
      rows.push({
        label: "Hardship withdrawals",
        value: "May be available",
        accent: "info",
      });

      return (
        <SummaryCard
          title="Withdrawal eligibility"
          status={{
            label: agentState.is59OrOlder ? "Eligible" : "Limited options",
            type: agentState.is59OrOlder ? "success" : "warning",
          }}
          rows={rows}
          actions={[
            { label: "What are my next steps?", variant: "primary", onClick: () => respond("What are my next steps?") },
            { label: "Start over", variant: "secondary", onClick: () => respond("Start over") },
          ]}
        />
      );
    }

    default:
      return null;
  }
}

export function startWithdrawalFlow(): FlowResult {
  const agentState = createInitialWithdrawalState();
  const response = getWithdrawalResponse(agentState, "start");

  return {
    nextMessages: [
      {
        id: nextId(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        suggestions: ["Continue", "Cancel"],
      },
    ],
    nextState: { agentState: response.nextState },
    isComplete: !!response.isComplete,
  };
}

export function handleWithdrawalIntent(
  message: string,
  currentState: WithdrawalFlowState,
  respond: (text: string) => void,
): FlowResult {
  const response = getWithdrawalResponse(currentState.agentState, message);
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
      content: `[Withdrawal: ${step}]`,
      timestamp: new Date(),
      component,
    });

    return {
      nextMessages: msgs,
      nextState: response.isComplete ? null : { agentState: response.nextState },
      isComplete: !!response.isComplete,
    };
  }

  const assistantMsg: ChatMessage = {
    id: nextId(),
    role: "assistant",
    content: response.message,
    timestamp: new Date(),
    suggestions: response.isComplete ? undefined : getSuggestions(step),
    disclaimer: "This is general information, not financial advice. Consult your plan administrator for specific details.",
  };

  return {
    nextMessages: [assistantMsg],
    nextState: response.isComplete ? null : { agentState: response.nextState },
    isComplete: !!response.isComplete,
  };
}

function getSuggestions(step: string): string[] | undefined {
  switch (step) {
    case "START": return ["Continue", "Cancel"];
    default: return undefined;
  }
}

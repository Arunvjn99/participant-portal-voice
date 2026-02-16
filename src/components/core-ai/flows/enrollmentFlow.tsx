/**
 * enrollmentFlow.tsx — Wraps planEnrollmentAgent for CoreAssistantModal.
 *
 * Returns interactive UI components (cards, options, sliders) for each step
 * instead of plain text, creating a guided enrollment experience inside chat.
 */

import {
  createInitialEnrollmentState,
  getEnrollmentResponse,
  type EnrollmentState,
} from "../../../bella/agents/planEnrollmentAgent";
import type { ChatMessage } from "../MessageBubble";
import {
  InteractiveCard,
  InteractiveOption,
  AmountSlider,
  SummaryCard,
  SuccessCard,
  type SummaryRow,
} from "../interactive";

export interface EnrollmentFlowState {
  agentState: EnrollmentState;
  /** Callback to send text back into the flow (set by CoreAssistantModal) */
  onRespond?: (text: string) => void;
}

export interface FlowResult {
  nextMessages: ChatMessage[];
  nextState: EnrollmentFlowState | null;
  isComplete: boolean;
}

let counter = 0;
const nextId = () => `enroll-${++counter}-${Date.now()}`;

/** Builds a component message with an onRespond callback injected at render time */
function componentMsg(
  content: string,
  buildComponent: (respond: (text: string) => void) => React.ReactNode,
): Omit<ChatMessage, "id" | "timestamp"> & { _buildComponent: typeof buildComponent } {
  return {
    role: "assistant",
    type: "component",
    content,
    _buildComponent: buildComponent,
  } as any;
}

/**
 * Build interactive component for a given enrollment step.
 * Returns null for steps that should use plain text only.
 */
function buildStepComponent(
  step: string,
  agentState: EnrollmentState,
  respond: (text: string) => void,
): React.ReactNode | null {
  switch (step) {
    case "PLAN_RECOMMENDATION":
      return (
        <InteractiveCard title="Choose your plan" subtitle="Select the plan that best fits your tax strategy">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InteractiveOption
              label="Traditional 401(k)"
              hint="Pre-tax now, taxable later"
              onClick={() => respond("traditional")}
              index={0}
            />
            <InteractiveOption
              label="Roth 401(k)"
              hint="After-tax now, tax-free later"
              badge="Popular"
              onClick={() => respond("roth")}
              index={1}
            />
          </div>
        </InteractiveCard>
      );

    case "CONTRIBUTION":
      return (
        <InteractiveCard title="Set your contribution" subtitle="What percentage of your salary would you like to contribute?">
          <AmountSlider
            label="Contribution percentage"
            min={1}
            max={75}
            step={1}
            defaultValue={6}
            unit="%"
            presets={[
              { label: "3%", value: "3" },
              { label: "6%", value: "6" },
              { label: "10%", value: "10" },
              { label: "15%", value: "15" },
            ]}
            onCommit={(v) => respond(`${v}%`)}
          />
        </InteractiveCard>
      );

    case "MONEY_HANDLING":
      return (
        <InteractiveCard title="Investment approach" subtitle="How would you like your contributions invested?">
          <div className="space-y-2">
            <InteractiveOption
              label="System-managed"
              hint="Automatic allocation adjusted over time"
              badge="Recommended"
              onClick={() => respond("default")}
              index={0}
            />
            <InteractiveOption
              label="I'll choose manually"
              hint="Pick your own funds and allocation"
              onClick={() => respond("manual")}
              index={1}
            />
            <InteractiveOption
              label="Work with an advisor"
              hint="Personalized guidance from a professional"
              onClick={() => respond("advisor")}
              index={2}
            />
          </div>
        </InteractiveCard>
      );

    case "MANUAL_RISK":
      return (
        <InteractiveCard title="Risk comfort level" subtitle="How much risk are you comfortable with?">
          <div className="grid grid-cols-2 gap-2">
            {(["conservative", "moderate", "growth", "aggressive"] as const).map((level, i) => (
              <InteractiveOption
                key={level}
                label={level.charAt(0).toUpperCase() + level.slice(1)}
                hint={
                  level === "conservative" ? "Less risk, steadier"
                  : level === "moderate" ? "Balanced approach"
                  : level === "growth" ? "More growth potential"
                  : "Highest growth potential"
                }
                onClick={() => respond(level)}
                index={i}
              />
            ))}
          </div>
        </InteractiveCard>
      );

    case "REVIEW": {
      const planType = agentState.planType ?? "401(k)";
      const contribPct = agentState.contributionPercentage ?? 6;
      const strategy = agentState.investmentStrategy ?? "DEFAULT";
      const strategyLabel = strategy === "DEFAULT" ? "System-managed"
        : strategy === "MANUAL" ? "Manual selection"
        : "Advisor-guided";

      const rows: SummaryRow[] = [
        { label: "Plan", value: planType },
        { label: "Contribution", value: `${contribPct}%`, accent: "success" },
        { label: "Investment strategy", value: strategyLabel },
      ];
      if (agentState.retirementAge) rows.push({ label: "Retirement age", value: String(agentState.retirementAge) });
      if (agentState.workCountry) rows.push({ label: "Location", value: agentState.workCountry });
      if (strategy === "MANUAL" && agentState.manualRiskLevel) {
        rows.push({ label: "Risk level", value: agentState.manualRiskLevel.charAt(0).toUpperCase() + agentState.manualRiskLevel.slice(1) });
      }

      return (
        <SummaryCard
          title="Enrollment summary"
          rows={rows}
          status={{ label: "Ready to submit", type: "info" }}
          actions={[
            { label: "Confirm enrollment", variant: "primary", onClick: () => respond("confirm") },
            { label: "Edit selections", variant: "secondary", onClick: () => respond("edit") },
          ]}
        />
      );
    }

    case "CONFIRMED":
      return (
        <SuccessCard
          title="Enrollment complete!"
          description="Your enrollment has been submitted successfully."
          timeline={[
            { label: "Enrollment recorded", detail: "Your plan selections have been saved" },
            { label: "First payroll deduction", detail: "Starts with your next paycheck cycle" },
            { label: "Investment allocation", detail: "Funds will be allocated per your selections" },
          ]}
          actionLabel="Done"
          onAction={() => respond("done")}
        />
      );

    default:
      return null;
  }
}

/**
 * Start the enrollment flow from scratch.
 */
export function startEnrollmentFlow(): FlowResult {
  const agentState = createInitialEnrollmentState({ isEligible: true });
  const response = getEnrollmentResponse(agentState, "start");

  return {
    nextMessages: [
      {
        id: nextId(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        suggestions: ["Start enrollment", "What does enrollment mean?"],
      },
    ],
    nextState: { agentState: response.nextState },
    isComplete: response.isComplete,
  };
}

/**
 * Handle a user message within an active enrollment flow.
 * Returns interactive components for decision steps, plain text for informational steps.
 */
export function handleEnrollmentIntent(
  message: string,
  currentState: EnrollmentFlowState,
  respond: (text: string) => void,
): FlowResult {
  const response = getEnrollmentResponse(currentState.agentState, message);
  const step = response.nextState.step;

  /* Try to build an interactive component for this step */
  const component = buildStepComponent(step, response.nextState, respond);

  if (component) {
    /* Component message: text explanation + interactive UI block */
    const msgs: ChatMessage[] = [];

    /* Add text framing message if the agent provided one */
    if (response.message) {
      msgs.push({
        id: nextId(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      });
    }

    /* Add the interactive component */
    msgs.push({
      id: nextId(),
      role: "assistant",
      type: "component",
      content: `[Enrollment: ${step}]`,
      timestamp: new Date(),
      component,
    });

    return {
      nextMessages: msgs,
      nextState: response.isComplete ? null : { agentState: response.nextState },
      isComplete: response.isComplete,
    };
  }

  /* Fallback: plain text message with suggestion chips */
  const assistantMsg: ChatMessage = {
    id: nextId(),
    role: "assistant",
    content: response.message,
    timestamp: new Date(),
    suggestions: response.isComplete ? undefined : getSuggestions(step),
  };

  if (response.isComplete) {
    assistantMsg.dataSnippet = "Enrollment complete";
    assistantMsg.disclaimer = "Your enrollment has been submitted. Changes may take 1-2 business days to process.";
  }

  return {
    nextMessages: [assistantMsg],
    nextState: response.isComplete ? null : { agentState: response.nextState },
    isComplete: response.isComplete,
  };
}

/** Suggestion chips for steps without interactive components */
function getSuggestions(step: string): string[] | undefined {
  switch (step) {
    case "INTENT": return ["Start enrollment", "What does enrollment mean?"];
    case "RETIREMENT_AGE": return ["65", "67", "I'm not sure yet"];
    case "LOCATION": return ["United States", "United Kingdom", "Canada"];
    case "CURRENT_AGE": return ["25", "30", "35", "40"];
    default: return undefined;
  }
}

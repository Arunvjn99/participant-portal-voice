/**
 * loanFlow.tsx — Wraps loanApplicationAgent for CoreAssistantModal.
 *
 * Returns interactive UI components for loan steps (amount slider, term options,
 * review summary, success card) within the chat stream.
 */

import {
  createInitialLoanState,
  getLoanResponse,
  type LoanState,
} from "../../../bella/agents/loanApplicationAgent";
import type { ChatMessage } from "../MessageBubble";
import {
  InteractiveCard,
  InteractiveOption,
  InteractiveChipGroup,
  AmountSlider,
  SummaryCard,
  SuccessCard,
  type SummaryRow,
} from "../interactive";

export interface LoanFlowState {
  agentState: LoanState;
}

export interface FlowResult {
  nextMessages: ChatMessage[];
  nextState: LoanFlowState | null;
  isComplete: boolean;
}

let counter = 0;
const nextId = () => `loan-${++counter}-${Date.now()}`;

const formatDollars = (v: number) => `$${v.toLocaleString()}`;

/**
 * Build interactive component for a loan step.
 */
function buildStepComponent(
  step: string,
  agentState: LoanState,
  respond: (text: string) => void,
): React.ReactNode | null {
  switch (step) {
    case "ELIGIBILITY":
      return (
        <SummaryCard
          title="Account snapshot"
          status={{ label: "Eligible", type: "success" }}
          rows={[
            { label: "Employment status", value: "Active" },
            { label: "Plan participation", value: "Active" },
            { label: "Vested balance", value: formatDollars(agentState.vestedBalance), accent: "success" },
            { label: "Max loan available", value: formatDollars(agentState.maxLoan), accent: "info" },
          ]}
          actions={[
            { label: "Continue with loan", variant: "primary", onClick: () => respond("continue") },
            { label: "Cancel", variant: "secondary", onClick: () => respond("cancel") },
          ]}
        />
      );

    case "AMOUNT":
      return (
        <InteractiveCard title="Loan amount" subtitle={`Available: up to ${formatDollars(agentState.maxLoan)}`}>
          <AmountSlider
            label="Select amount"
            min={1000}
            max={agentState.maxLoan}
            step={100}
            defaultValue={Math.min(5000, agentState.maxLoan)}
            formatValue={formatDollars}
            presets={[
              { label: "$1,000", value: "1000" },
              { label: "$5,000", value: "5000" },
              { label: "$10,000", value: "10000" },
              { label: `Max (${formatDollars(agentState.maxLoan)})`, value: String(agentState.maxLoan) },
            ]}
            onCommit={(v) => respond(`$${v}`)}
          />
        </InteractiveCard>
      );

    case "PURPOSE":
      return (
        <InteractiveCard title="Loan purpose" subtitle="Optional — helps us understand your needs">
          <div className="space-y-3">
            <InteractiveChipGroup
              chips={[
                { label: "Home repair", value: "Home repair" },
                { label: "Debt consolidation", value: "Debt" },
                { label: "Emergency", value: "Emergency" },
                { label: "Education", value: "Education" },
                { label: "Medical", value: "Medical" },
              ]}
              onSelect={(v) => respond(v)}
            />
            <button
              type="button"
              onClick={() => respond("skip")}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip this step
            </button>
          </div>
        </InteractiveCard>
      );

    case "TERM":
      return (
        <InteractiveCard title="Repayment term" subtitle="Shorter terms save on interest">
          <div className="space-y-2">
            <InteractiveOption
              label="1 year"
              hint="Higher monthly payments, less interest"
              onClick={() => respond("1 year")}
              index={0}
            />
            <InteractiveOption
              label="3 years"
              hint="Balanced payments and interest"
              badge="Common"
              onClick={() => respond("3 years")}
              index={1}
            />
            <InteractiveOption
              label="5 years"
              hint="Lower monthly payments, more interest"
              onClick={() => respond("5 years")}
              index={2}
            />
          </div>
        </InteractiveCard>
      );

    case "REVIEW": {
      const d = agentState.collectedData;
      const rows: SummaryRow[] = [
        { label: "Loan amount", value: formatDollars(d.loanAmount ?? 0), accent: "info" },
        { label: "Repayment term", value: d.repaymentTerm ? `${d.repaymentTerm} year${d.repaymentTerm > 1 ? "s" : ""}` : "—" },
      ];
      if (d.loanPurpose) rows.push({ label: "Purpose", value: d.loanPurpose });
      if (d.monthlyPayment) rows.push({ label: "Monthly payment", value: formatDollars(d.monthlyPayment), accent: "warning" });
      if (d.totalRepayment) rows.push({ label: "Total repayment", value: formatDollars(d.totalRepayment) });
      if (d.totalInterest) rows.push({ label: "Total interest", value: formatDollars(d.totalInterest), accent: "warning" });

      return (
        <SummaryCard
          title="Loan review"
          status={{ label: "Ready to submit", type: "info" }}
          rows={rows}
          actions={[
            { label: "Submit loan request", variant: "primary", onClick: () => respond("submit") },
            { label: "Change amount", variant: "secondary", onClick: () => respond("change amount") },
            { label: "Change term", variant: "secondary", onClick: () => respond("change term") },
          ]}
        />
      );
    }

    case "CONFIRMED":
      return (
        <SuccessCard
          title="Loan request submitted!"
          description="Your loan application is now being processed."
          timeline={[
            { label: "Application received", detail: "Your loan request has been recorded" },
            { label: "Processing", detail: "Review typically takes 1-2 business days" },
            { label: "Funds disbursed", detail: "Direct deposit within 3-5 business days" },
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
 * Start the loan flow.
 */
export function startLoanFlow(): FlowResult {
  const agentState = createInitialLoanState(85000);
  const response = getLoanResponse(agentState, "start");

  return {
    nextMessages: [
      {
        id: nextId(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        suggestions: ["Yes, start loan application", "No, just exploring"],
      },
    ],
    nextState: { agentState: response.nextState },
    isComplete: response.isComplete,
  };
}

/**
 * Handle a user message within an active loan flow.
 */
export function handleLoanIntent(
  message: string,
  currentState: LoanFlowState,
  respond: (text: string) => void,
): FlowResult {
  const response = getLoanResponse(currentState.agentState, message);
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
      content: `[Loan: ${step}]`,
      timestamp: new Date(),
      component,
    });

    return {
      nextMessages: msgs,
      nextState: response.isComplete ? null : { agentState: response.nextState },
      isComplete: response.isComplete,
    };
  }

  /* Fallback: plain text */
  const assistantMsg: ChatMessage = {
    id: nextId(),
    role: "assistant",
    content: response.message,
    timestamp: new Date(),
    suggestions: response.isComplete ? undefined : getSuggestions(step),
  };

  if (response.isComplete) {
    assistantMsg.dataSnippet = "Loan request submitted";
    assistantMsg.disclaimer = "Your loan request is being processed. Funds are typically disbursed within 3-5 business days.";
  }

  if ((response as any).isCancelled) {
    return { nextMessages: [assistantMsg], nextState: null, isComplete: true };
  }

  return {
    nextMessages: [assistantMsg],
    nextState: response.isComplete ? null : { agentState: response.nextState },
    isComplete: response.isComplete,
  };
}

function getSuggestions(step: string): string[] | undefined {
  switch (step) {
    case "START": return ["Yes, start loan application", "No, just exploring"];
    case "RULES": return ["Continue", "Cancel"];
    default: return undefined;
  }
}

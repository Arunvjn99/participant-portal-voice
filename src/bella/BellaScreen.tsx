import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import {
  createInitialEnrollmentState,
  getEnrollmentResponse,
} from "./agents/planEnrollmentAgent";
import type { EnrollmentState } from "./agents/planEnrollmentAgent";
import {
  EnrollmentDecisionBlock,
  EnrollmentReviewSummaryCard,
  ENROLLMENT_FRAMING,
} from "./ui/EnrollmentDecisionUI";
import { BellaScreenLayout, type BellaLayoutVariant } from "./ui/BellaScreenLayout";
import { ManualInvestmentBlock, MANUAL_FRAMING } from "./ui/ManualInvestmentUI";
import {
  createInitialLoanState,
  getLoanResponse,
} from "./agents/loanApplicationAgent";
import type { LoanState } from "./agents/loanApplicationAgent";
import {
  createInitialWithdrawalState,
  getWithdrawalResponse,
} from "./agents/withdrawalInfoAgent";
import type { WithdrawalState } from "./agents/withdrawalInfoAgent";
import {
  createInitialVestingState,
  getVestingResponse,
} from "./agents/vestingInfoAgent";
import type { VestingState } from "./agents/vestingInfoAgent";

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

/**
 * Resolve SpeechRecognition constructor. Use window.SpeechRecognition || window.webkitSpeechRecognition.
 * Not initialized on mount—only used inside startVoiceInput() on explicit user click.
 */
const getSpeechRecognition = (): typeof window.SpeechRecognition | null => {
  if (typeof window === 'undefined') return null;
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  return Ctor || null;
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Active Mode Type
 * 
 * Determines which mode the assistant is currently in:
 * - NONE: No active scripted flow, can use Gemini for general questions
 * - LOAN: Active loan application flow (deterministic, no Gemini)
 * - ENROLLMENT: Active enrollment flow (deterministic, no Gemini)
 * - WITHDRAWAL: Active withdrawal-info flow (deterministic, informational only, no Gemini)
 * 
 * Why scripted flows must remain deterministic:
 * - Enrollment and loan flows have strict regulatory requirements
 * - Must collect specific information in a fixed order
 * - Cannot allow AI to skip steps or modify workflow
 * - Ensures compliance and data accuracy
 */
type ActiveMode = 'NONE' | 'LOAN' | 'ENROLLMENT' | 'WITHDRAWAL' | 'VESTING';

type WithdrawalDemoStep =
  | 'INTENT'
  | 'SNAPSHOT'
  | 'ELIGIBILITY'
  | 'TYPE'
  | 'AMOUNT'
  | 'IMPACT'
  | 'REVIEW'
  | 'CONFIRMED';

type WithdrawalDemoType = 'IN_SERVICE' | 'HARDSHIP' | 'POST_EMPLOYMENT';

interface WithdrawalDemoState {
  step: WithdrawalDemoStep;
  withdrawalType?: WithdrawalDemoType;
  amount?: number;
}

export type { BellaLayoutVariant } from "./ui/BellaScreenLayout";

export interface BellaScreenProps {
  /** When provided, Close button calls this instead of only resetting state (e.g. close overlay back to dashboard). */
  onClose?: () => void;
  /** When provided (e.g. from portal dashboard), agent starts with this theme so it matches the page. */
  initialDarkMode?: boolean;
  /** fullpage: current /voice behavior (viewport scroll, fixed chrome). embedded: for constrained panel (panel scroll). Default fullpage. */
  variant?: BellaLayoutVariant;
}

export default function BellaScreen(props?: BellaScreenProps) {
  const { onClose, initialDarkMode, variant: variantProp } = props ?? {};
  const variant = variantProp ?? "fullpage";
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi, I'm your retirement assistant. How can I help you?",
      timestamp: new Date()
    }
  ]);
  const messagesRef = useRef<Message[]>(messages);
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode ?? false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggested questions (reduced to 4)
  const suggestedQuestions = [
    "I want to enroll",
    "I want to apply for a loan",
    "How much can I withdraw?",
    "What is my vested balance?"
  ];

  /** Current SpeechRecognition instance. Created only in startVoiceInput (user click), never on mount. */
  const recognitionRef = useRef<any>(null);
  const hasSpokenGreetingRef = useRef(false);
  const loanSpeakTimeoutRef = useRef<number | null>(null);
  const withdrawalSpeakTimeoutRef = useRef<number | null>(null);
  
  // Enrollment agent state
  const [enrollmentState, setEnrollmentState] = useState<EnrollmentState | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [planInfoOpen, setPlanInfoOpen] = useState<Record<string, boolean>>({});
  const [suggestedPlanWhyOpen, setSuggestedPlanWhyOpen] = useState<boolean>(false);
  const [enrollmentCompleteState, setEnrollmentCompleteState] = useState<EnrollmentState | null>(null);
  const [showEnrollmentCompleteDetails, setShowEnrollmentCompleteDetails] = useState(false);
  
  // Loan application agent state
  const [loanState, setLoanState] = useState<LoanState | null>(null);
  const [isApplyingForLoan, setIsApplyingForLoan] = useState(false);
  const [pendingLoanConfirmation, setPendingLoanConfirmation] = useState(false);
  const [loanCompleteState, setLoanCompleteState] = useState<LoanState | null>(null);
  const [showLoanCompleteDetails, setShowLoanCompleteDetails] = useState(false);
  const [loanAmountDraft, setLoanAmountDraft] = useState<number>(10_000);
  const [loanTermDraft, setLoanTermDraft] = useState<number>(5);
  
  // Withdrawal info agent state (informational only; no amounts or advice)
  const [withdrawalState, setWithdrawalState] = useState<WithdrawalState | null>(null);
  const [withdrawalDemoState, setWithdrawalDemoState] = useState<WithdrawalDemoState | null>(null);
  const [withdrawalCompleteState, setWithdrawalCompleteState] = useState<WithdrawalDemoState | null>(null);
  const [withdrawalAmountDraft, setWithdrawalAmountDraft] = useState<number>(2000);

  // Vesting info agent state (guided educational script)
  const [vestingState, setVestingState] = useState<VestingState | null>(null);
  const [vestingExplainerOpen, setVestingExplainerOpen] = useState(false);

  // Context-aware suggestion chips (UI-only)
  const [enrollmentIntentInfoOpen, setEnrollmentIntentInfoOpen] = useState(false);
  const [enrollmentAgeHelpOpen, setEnrollmentAgeHelpOpen] = useState<{ why: boolean; notSure: boolean }>({
    why: false,
    notSure: false,
  });
  const [planDiffOpen, setPlanDiffOpen] = useState(false);
  const [planChangeLaterOpen, setPlanChangeLaterOpen] = useState(false);
  const [moneyHandlingInfoOpen, setMoneyHandlingInfoOpen] = useState(false);

  const [loanWhyAskingOpen, setLoanWhyAskingOpen] = useState(false);
  const [loanAmountInfoOpen, setLoanAmountInfoOpen] = useState<{ max: boolean; repayment: boolean }>({ max: false, repayment: false });
  const [loanTermWhyShorterOpen, setLoanTermWhyShorterOpen] = useState(false);

  const demoParticipant = React.useMemo(() => {
    const vestedBalance = 80_000;
    const demoLoan = createInitialLoanState(vestedBalance);
    return {
      isDemo: true,
      employmentStatus: "Active",
      planParticipation: "Enrolled",
      vestedBalance,
      availableLoanAmount: demoLoan.maxLoan,
      currentLoanBalance: 3_500,
    };
  }, []);

  const demoEnrollmentParticipant = React.useMemo(() => {
    return {
      isDemo: true,
      currentAge: 34,
    };
  }, []);

  const formatCurrency = (n: number) => `$${Math.round(n).toLocaleString()}`;

  const demoWithdrawalParticipant = React.useMemo(() => {
    return {
      isDemo: true,
      currentAge: 34,
      employmentStatus: "Active" as const, // Active | Terminated (demo)
      vestedBalance: 80_000,
      amountAvailableForWithdrawal: 12_000,
      planRules: {
        inServiceWithdrawalAllowed: true,
        hardshipWithdrawalAllowed: true,
      },
    };
  }, []);

  const scheduleWithdrawalSpeak = (text: string, delayMs: number = 300) => {
    if (withdrawalSpeakTimeoutRef.current != null) {
      window.clearTimeout(withdrawalSpeakTimeoutRef.current);
      withdrawalSpeakTimeoutRef.current = null;
    }
    withdrawalSpeakTimeoutRef.current = window.setTimeout(() => {
      speak(text);
      withdrawalSpeakTimeoutRef.current = null;
    }, delayMs);
  };

  const getWithdrawalCanonicalMessage = React.useCallback((step: WithdrawalDemoStep) => {
    const a = demoWithdrawalParticipant.amountAvailableForWithdrawal;
    switch (step) {
      case 'INTENT':
        return "I can help you understand your withdrawal options. Let’s review a few details first.";
      case 'SNAPSHOT':
        return "Here’s a snapshot of your account details.";
      case 'ELIGIBILITY':
        return "Based on your account and plan rules, here’s what withdrawals may be available.";
      case 'TYPE':
        return "Which type of withdrawal do you want to request?";
      case 'AMOUNT':
        return `How much do you want to request? You may be able to request up to about ${formatCurrency(a)}.`;
      case 'IMPACT':
        return "Before you submit, here’s a quick reminder about the impact.";
      case 'REVIEW':
        return "Review your withdrawal request below. Do you want to submit it for processing?";
      case 'CONFIRMED':
        return "Withdrawal request submitted.";
      default:
        return "I can help you understand your withdrawal options.";
    }
  }, [demoWithdrawalParticipant.amountAvailableForWithdrawal, formatCurrency]);

  const getLoanCanonicalMessage = React.useCallback(
    (nextStep: LoanState["step"] | undefined, stateForCopy: LoanState | null, fallback: string) => {
      if (!nextStep) return fallback;
      switch (nextStep) {
        case "ELIGIBILITY":
          return "I can help you explore loan options based on your account.";
        case "RULES":
          return "Review these loan basics below.";
        case "AMOUNT":
          return "Choose a loan amount below.";
        case "PURPOSE":
          return "Select a purpose (optional).";
        case "TERM":
          return "Choose a repayment term.";
        case "REVIEW":
          return "Review and submit your loan request below.";
        case "CONFIRMED":
          return "Loan request submitted.";
        default:
          return fallback;
      }
    },
    []
  );

  const startWithdrawalBridgeFromVesting = () => {
    handleUserInput("How much can I withdraw?", "chip");
  };

  const startLoanBridgeFromVesting = () => {
    handleUserInput("I want to apply for a loan", "chip");
  };

  useEffect(() => {
    if (!loanState) return;
    if (loanState.step === "AMOUNT") {
      const max = loanState.maxLoan || demoParticipant.availableLoanAmount;
      const suggested = Math.min(10_000, max);
      setLoanAmountDraft(Math.max(1000, suggested));
    }
  }, [loanState?.step]);

  useEffect(() => {
    if (!loanState) return;
    if (loanState.step === "TERM") {
      setLoanTermDraft(loanState.repaymentTerm ?? 5);
    }
  }, [loanState?.step]);

  useEffect(() => {
    // Chips should disappear once the user progresses.
    setEnrollmentIntentInfoOpen(false);
    setEnrollmentAgeHelpOpen({ why: false, notSure: false });
    setPlanDiffOpen(false);
    setPlanChangeLaterOpen(false);
    setMoneyHandlingInfoOpen(false);
    setSuggestedPlanWhyOpen(false);
  }, [enrollmentState?.step]);

  useEffect(() => {
    setLoanWhyAskingOpen(false);
    setLoanAmountInfoOpen({ max: false, repayment: false });
    setLoanTermWhyShorterOpen(false);
  }, [loanState?.step]);

  useEffect(() => {
    if (!withdrawalDemoState) return;
    if (withdrawalDemoState.step === 'AMOUNT') {
      const max = demoWithdrawalParticipant.amountAvailableForWithdrawal;
      setWithdrawalAmountDraft(Math.min(2000, max));
    }
  }, [withdrawalDemoState?.step]);
  
  /**
   * Active Mode State
   * 
   * Tracks which deterministic flow is active (if any).
   * This ensures scripted flows always take priority over Gemini.
   * 
   * Why Gemini is fallback-only:
   * - Scripted flows (enrollment, loan) must remain deterministic
   * - Gemini cannot modify application state or skip steps
   * - Only use Gemini when no scripted flow is active
   */
  const getActiveMode = (): ActiveMode => {
    if (isApplyingForLoan) return 'LOAN';
    if (isEnrolling) return 'ENROLLMENT';
    if (withdrawalDemoState || withdrawalCompleteState) return 'WITHDRAWAL';
    if (withdrawalState) return 'WITHDRAWAL';
    if (vestingState) return 'VESTING';
    return 'NONE';
  };

  const getEnrollmentPhaseLabel = (step: string) => {
    const s = step.toUpperCase();
    if (["INTENT", "RETIREMENT_AGE", "LOCATION"].includes(s)) return "Enrollment · Retirement plans";
    if (["PLAN_RECOMMENDATION", "PLAN_SELECTION"].includes(s)) return "Enrollment · Plan selection";
    if (["CONTRIBUTION", "MONEY_HANDLING", "INVESTMENT", "MANUAL_RISK", "MANUAL_FUNDS", "MANUAL_ALLOCATION"].includes(s)) return "Enrollment · Investments";
    if (["REVIEW"].includes(s)) return "Enrollment · Review & submit";
    return "Enrollment · In progress";
  };

  const getWithdrawalPhaseLabel = (step: string) => {
    const s = step.toUpperCase();
    if (["INTENT", "SNAPSHOT", "ELIGIBILITY", "TYPE", "AMOUNT", "IMPACT"].includes(s)) return "Withdrawal · Withdrawal options";
    if (["REVIEW"].includes(s)) return "Withdrawal · Review & submit";
    if (["CONFIRMED"].includes(s)) return "Withdrawal · Submitted";
    return "Withdrawal · In progress";
  };

  // NOTE: Vested balance flow is started via handleUserInput() only.

  const speak = (text: string) => {
    console.log('🔊 speak() called with text:', text);
    
    if (!('speechSynthesis' in window)) {
      console.warn('❌ Speech synthesis not supported');
      return;
    }

    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Empty text provided to speak function');
      return;
    }

    try {
      console.log('🛑 Canceling any ongoing speech...');
      // Cancel any ongoing speech to prevent overlap
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      
      // Small delay to ensure cancellation is processed
      setTimeout(() => {
        try {
          console.log('⏳ Calling speakWithDelay...');
          speakWithDelay(text);
        } catch (error) {
          console.error('❌ Error in delayed speak:', error);
        }
      }, 100);
    } catch (error) {
      console.error('❌ Error canceling speech:', error);
    }
  };

  const ContextChips = (props: { chips: Array<{ label: string; onClick: () => void }>; ariaLabel: string }) => {
    const { chips, ariaLabel } = props;
    if (!chips.length) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={c.onClick}
            className={isDarkMode
              ? "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
              : "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
          >
            {c.label}
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  type UserInputSource = 'text' | 'voice' | 'chip';

  type DemoWithdrawalAgentResponse = {
    nextState: WithdrawalDemoState | null;
    message: string;
    isComplete?: boolean;
  };

  const getWithdrawalDemoResponse = (
    state: WithdrawalDemoState | null,
    userInput: string
  ): DemoWithdrawalAgentResponse => {
    const input = userInput.trim().toLowerCase();
    const max = demoWithdrawalParticipant.amountAvailableForWithdrawal;

    // Global cancel/exit for the demo flow
    if (/(^|\b)(cancel|exit|stop|never mind|nevermind)\b/i.test(input)) {
      return {
        nextState: null,
        message: "Okay — no changes were made. You can come back anytime.",
        isComplete: true,
      };
    }

    const s: WithdrawalDemoState = state ?? { step: "INTENT" };

    // Start: go straight to SNAPSHOT with framing message (first actionable card appears immediately)
    if (!state && /(withdraw|withdrawal|how much can i withdraw|take out)/i.test(input)) {
      return {
        nextState: { step: "INTENT" },
        message: "I can help you understand your withdrawal options. Let’s review a few details first.",
      };
    }

    switch (s.step) {
      case "INTENT":
        if (/(continue|next|ok|okay|yes)/i.test(input)) {
          return { nextState: { ...s, step: "SNAPSHOT" }, message: "Here’s a snapshot of your account details." };
        }
        return { nextState: s, message: "Select Continue to review your account details." };

      case "SNAPSHOT":
        if (/(continue|next|ok|okay|yes)/i.test(input)) {
          return {
            nextState: { ...s, step: "ELIGIBILITY" },
            message: "Based on your account and plan rules, here’s what withdrawals may be available.",
          };
        }
        return { nextState: s, message: "Select Continue to review eligibility." };

      case "ELIGIBILITY":
        if (/(continue|next|ok|okay|yes)/i.test(input)) {
          return { nextState: { ...s, step: "TYPE" }, message: "Which type of withdrawal do you want to request?" };
        }
        return { nextState: s, message: "Select Continue to choose a withdrawal type." };

      case "TYPE": {
        const m = input.match(/type\s*:\s*(in_service|hardship|post_employment)/i);
        if (m) {
          const t = m[1].toUpperCase() as WithdrawalDemoType;
          return {
            nextState: { ...s, step: "AMOUNT", withdrawalType: t },
            message: `How much do you want to request? You may be able to request up to about ${formatCurrency(max)}.`,
          };
        }
        return { nextState: s, message: "Please select a withdrawal type." };
      }

      case "AMOUNT": {
        const m = input.match(/amount\s*:\s*(\d+)/i);
        if (m) {
          const amt = Math.max(0, Math.min(Number(m[1]), Math.floor(max)));
          return {
            nextState: { ...s, step: "IMPACT", amount: amt },
            message: "Before you submit, here’s a quick reminder about the impact.",
          };
        }
        return { nextState: s, message: "Please choose an amount using the slider or presets." };
      }

      case "IMPACT":
        if (/(continue|next|ok|okay|yes)/i.test(input)) {
          return { nextState: { ...s, step: "REVIEW" }, message: "Review your withdrawal request below. Do you want to submit it for processing?" };
        }
        return { nextState: s, message: "Select Continue to review your request." };

      case "REVIEW":
        if (/(submit|confirm|yes)/i.test(input)) {
          return { nextState: { ...s, step: "CONFIRMED" }, message: "Withdrawal request submitted.", isComplete: true };
        }
        if (/change amount/i.test(input)) return { nextState: { ...s, step: "AMOUNT" }, message: `How much do you want to request? You may be able to request up to about ${formatCurrency(max)}.` };
        if (/change type/i.test(input)) return { nextState: { ...s, step: "TYPE" }, message: "Which type of withdrawal do you want to request?" };
        return { nextState: s, message: "Select Submit to send your request for processing, or choose an edit option." };

      case "CONFIRMED":
        if (/(done|close|finish)/i.test(input)) {
          return { nextState: null, message: "Understood. No changes were made. You can come back anytime.", isComplete: true };
        }
        return { nextState: s, message: "Withdrawal request submitted.", isComplete: true };

      default:
        return { nextState: s, message: "Please continue using the options on screen." };
    }
  };

  const handleUserInput = async (rawInput: string, source: UserInputSource) => {
    const input = rawInput.trim();
    if (!input) return;

    // Append user message for text/voice (chips are UI-only suggestions)
    if (source === "text" || source === "voice") {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    // Clear typing buffer when text is submitted
    if (source === "text") setUserText("");

    let assistantText = "";

    // Pending loan confirmation (must be handled before other routing)
    if (pendingLoanConfirmation) {
      const normalizedInput = input.toLowerCase().trim();
      if (/^(yes|yeah|yep|sure|okay|ok|start|begin|go ahead|proceed|continue)/i.test(normalizedInput)) {
        setPendingLoanConfirmation(false);
        const initialState = createInitialLoanState(demoParticipant.vestedBalance);
        // UI-led loan start from known account state (no eligibility question)
        const startState: LoanState = { ...initialState, step: "RULES", isEligible: true };
        assistantText =
          "Based on your account, you may be able to borrow from your retirement plan. Here’s a quick snapshot of your account and loan availability.";
        // Append assistant message, then update state, then speak
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
        ]);
        setLoanCompleteState(null);
        setShowLoanCompleteDetails(false);
        setIsApplyingForLoan(true);
        setLoanState(startState);
        speak(assistantText);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }
      if (/^(no|nope|not|don't|cannot|never mind|forget it|not interested)/i.test(normalizedInput)) {
        setPendingLoanConfirmation(false);
        assistantText = "Understood. No changes were made. You can come back anytime.";
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
        ]);
        speak(assistantText);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }
      assistantText = "Would you like to start a loan application? Say 'yes' to continue or 'no' to cancel.";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
      ]);
      speak(assistantText);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      return;
    }

    let activeMode = getActiveMode();

    // Chip-based navigation: allow switching flows without UI-mutating state.
    // This does NOT skip steps; it simply starts the requested flow from its normal entry.
    if (source === "chip") {
      const loanIntent = checkLoanIntent(input);
      const isTopLevel =
        checkEnrollmentIntent(input) ||
        checkWithdrawalIntent(input) ||
        loanIntent.isDirect ||
        input.toLowerCase().includes("vested balance") ||
        input.toLowerCase().includes("vesting schedule");

      if (isTopLevel && activeMode !== "NONE") {
        setIsEnrolling(false);
        setEnrollmentState(null);
        setIsApplyingForLoan(false);
        setLoanState(null);
        setPendingLoanConfirmation(false);
        setWithdrawalState(null);
        setWithdrawalDemoState(null);
        setWithdrawalCompleteState(null);
        setVestingState(null);
        setVestingExplainerOpen(false);
        activeMode = "NONE";
      }
    }

    // Deterministic flows first
    if (activeMode === "ENROLLMENT" && enrollmentState) {
      const response = getEnrollmentResponse(enrollmentState, input);
      assistantText = response.message;
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
      ]);
      setEnrollmentState(response.nextState);
      if (response.isComplete) {
        if (response.nextState?.step === "CONFIRMED") {
          setEnrollmentCompleteState(response.nextState);
          setShowEnrollmentCompleteDetails(false);
        }
        setIsEnrolling(false);
        setEnrollmentState(null);
      }
      speak(assistantText);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      return;
    }

    if (activeMode === "LOAN" && loanState) {
      const response = getLoanResponse(loanState, input);
      // UI/voice should use the same on-screen message (short, card-first)
      assistantText = getLoanCanonicalMessage(response.nextState?.step, response.nextState, response.message);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
      ]);
      if (response.isCancelled) {
        setIsApplyingForLoan(false);
        setLoanState(null);
        setPendingLoanConfirmation(false);
        speak(assistantText);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }
      setLoanState(response.nextState);
      if (response.isComplete) {
        if (response.nextState?.step === "CONFIRMED") {
          setLoanCompleteState(response.nextState);
          setShowLoanCompleteDetails(false);
        }
        setIsApplyingForLoan(false);
        setLoanState(null);
      }
      speak(assistantText);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      return;
    }

    if (activeMode === "WITHDRAWAL" && withdrawalDemoState) {
      const demoResponse = getWithdrawalDemoResponse(withdrawalDemoState, input);
      assistantText = demoResponse.message;
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
      ]);
      setWithdrawalDemoState(demoResponse.nextState);
      // Keep confirmation tied to state.step; no separate UI-only completion state.
      setWithdrawalCompleteState(null);
      speak(assistantText);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      return;
    }

    if (activeMode === "WITHDRAWAL" && withdrawalState) {
      const response = getWithdrawalResponse(withdrawalState, input);
      assistantText = response.message;
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
      ]);
      setWithdrawalState(response.nextState);
      if (response.isComplete) setWithdrawalState(null);
      speak(assistantText);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      return;
    }

    if (activeMode === "VESTING" && vestingState) {
      const response = getVestingResponse(vestingState, input);
      assistantText = response.message;
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
      ]);
      setVestingState(response.nextState);
      if (response.isComplete) setVestingState(null);
      speak(assistantText);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      return;
    }

    // No active scripted flow: start flows or fall back to Gemini
    if (activeMode === "NONE") {
      // Vesting quick intent
      if (input.toLowerCase().includes("vested balance") || input.toLowerCase().includes("vesting schedule")) {
        const initial = createInitialVestingState(undefined);
        const response = getVestingResponse(initial, "start");
        assistantText = response.message;
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
        ]);
        setVestingState(response.nextState);
        speak(assistantText);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }

      const loanIntent = checkLoanIntent(input);
      if (loanIntent.isDirect) {
        const initialState = createInitialLoanState(demoParticipant.vestedBalance);
        // UI-led loan start from known account state (no eligibility question)
        const startState: LoanState = { ...initialState, step: "RULES", isEligible: true };
        assistantText =
          "Based on your account, you may be able to borrow from your retirement plan. Here’s a quick snapshot of your account and loan availability.";
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
        ]);
        setLoanCompleteState(null);
        setShowLoanCompleteDetails(false);
        setIsApplyingForLoan(true);
        setLoanState(startState);
        speak(assistantText);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }
      if (loanIntent.isIndirect) {
        setPendingLoanConfirmation(true);
        assistantText =
          "It sounds like you might want to borrow from your 401(k). Would you like to start a loan application? Say 'yes' to continue or 'no' to cancel.";
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
        ]);
        speak(assistantText);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }

      if (checkEnrollmentIntent(input)) {
        const initialState = createInitialEnrollmentState({ currentAge: demoEnrollmentParticipant.currentAge } as any);
        const response = getEnrollmentResponse(initialState, input);
        assistantText = response.message;
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
        ]);
        setEnrollmentCompleteState(null);
        setShowEnrollmentCompleteDetails(false);
        setIsEnrolling(true);
        setEnrollmentState(response.nextState);
        speak(assistantText);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }

      if (checkWithdrawalIntent(input)) {
        const resp = getWithdrawalDemoResponse(null, input);
        assistantText = resp.message;
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
        ]);
        setWithdrawalDemoState(resp.nextState);
        setWithdrawalCompleteState(null);
        speak(assistantText);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }

      try {
        const history = messagesRef.current;
        assistantText = await callGeminiAPI(input, history);
      } catch {
        assistantText = fallbackRetirementBrain(input, messagesRef.current);
      }
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: assistantText, timestamp: new Date() },
      ]);
      speak(assistantText);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      return;
    }
  };

  const scheduleLoanSpeak = (text: string, delayMs: number = 350) => {
    if (loanSpeakTimeoutRef.current != null) {
      window.clearTimeout(loanSpeakTimeoutRef.current);
      loanSpeakTimeoutRef.current = null;
    }
    loanSpeakTimeoutRef.current = window.setTimeout(() => {
      speak(text);
      loanSpeakTimeoutRef.current = null;
    }, delayMs);
  };

  const speakWithDelay = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.1; // Slightly higher pitch for female voice
    utterance.volume = 1;
    utterance.lang = "en-US";
    
    // Function to set voice and speak
    const speakWithVoice = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
      
      if (voices.length === 0) {
        // Wait for voices to load
        window.speechSynthesis.addEventListener('voiceschanged', speakWithVoice, { once: true });
        return;
      }
      
      // Prioritized list of female voice names (common across platforms)
      const femaleVoiceNames = [
        'samantha', 'karen', 'susan', 'victoria', 'zira', 'samantha premium',
        'karen premium', 'susan premium', 'victoria premium', 'zira premium',
        'samantha enhanced', 'karen enhanced', 'susan enhanced', 'victoria enhanced',
        'samantha (enhanced)', 'karen (enhanced)', 'susan (enhanced)', 'victoria (enhanced)',
        'samantha (premium)', 'karen (premium)', 'susan (premium)', 'victoria (premium)',
        'female', 'woman', 'alex', 'fiona', 'tessa', 'veena', 'nicole', 'linda'
      ];
      
      // Try to find a female voice with multiple strategies
      let femaleVoice = voices.find(voice => 
        femaleVoiceNames.some(name => voice.name.toLowerCase().includes(name.toLowerCase()))
      );
      
      // Fallback: check for gender property if available
      if (!femaleVoice) {
        femaleVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          ((voice as any).gender === 'female' || (voice as any).gender === 'Female')
        );
      }
      
      // Fallback: try to find English voices that sound more feminine
      // (typically voices with higher index numbers or specific names)
      if (!femaleVoice) {
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        // Try voices that are not the first/default one (often default is male)
        if (englishVoices.length > 1) {
          femaleVoice = englishVoices[1]; // Second voice is often female
        } else if (englishVoices.length > 0) {
          femaleVoice = englishVoices[0];
        }
      }
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('Using female voice:', femaleVoice.name);
      } else {
        console.warn('No female voice found, using default');
      }
      
      // Error handling
      utterance.onerror = (event: any) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        
        // Try to recover from common errors
        if (event.error === 'interrupted' || event.error === 'canceled') {
          console.log('Speech was interrupted or canceled, this is normal');
        } else if (event.error === 'synthesis-failed') {
          console.warn('Speech synthesis failed, but continuing...');
        } else {
          console.warn('Speech synthesis error:', event.error, '- continuing without voice');
        }
      };
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('Speech started successfully');
      };
      
      utterance.onend = () => {
        console.log('Speech ended successfully');
        setIsSpeaking(false);
      };
      
      try {
        console.log('🎤 Calling window.speechSynthesis.speak()...');
        console.log('Utterance text:', utterance.text);
        console.log('Utterance voice:', utterance.voice?.name || 'default');
        window.speechSynthesis.speak(utterance);
        console.log('✅ speak() called successfully');
      } catch (error) {
        console.error('❌ Failed to start speech synthesis:', error);
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error in speakWithVoice:', error);
      setIsSpeaking(false);
    }
    };
    
    // Start speaking
    speakWithVoice();
  };

  // Keep messages in view (no scrolling, just ensure visibility)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  // Check if user wants to start enrollment
  const checkEnrollmentIntent = (input: string): boolean => {
    const text = input.toLowerCase();
    return /enroll|start enrollment|begin enrollment|sign up|join the plan|new enrollment/i.test(text);
  };

  // Check if user wants withdrawal info ("How much can I withdraw?"). Informational only; no amounts or advice.
  const checkWithdrawalIntent = (input: string): boolean => {
    const text = input.toLowerCase().trim();
    return (
      /how much can i withdraw/i.test(text) ||
      /withdraw from (my )?401k?/i.test(text) ||
      /withdrawal (info|rules|options)/i.test(text) ||
      /(can i |may i )?withdraw/i.test(text) ||
      /(what are|tell me about) (the )?withdrawal/i.test(text)
    );
  };

  // Check if user wants to start loan application (direct or indirect).
  // Indirect phrases (e.g. "access my 401k money") still require explicit confirmation
  // Check if user wants to start loan application
  // Returns { isDirect: true } for explicit intents (can start immediately)
  // Returns { isIndirect: true } for indirect phrases (requires confirmation)
  // Indirect phrases like "borrow from my retirement" require explicit confirmation
  // before starting the loan flow to ensure user intent is clear.
  const checkLoanIntent = (input: string): { isDirect: boolean; isIndirect: boolean } => {
    const text = input.toLowerCase();
    const direct = /apply for loan|start loan|loan application|want to borrow|need a loan|get a loan|i want a loan|i need a loan|i want to apply for a loan/i;
    const indirect = /borrow from my retirement|access my 401k|access my 401k money|need cash urgently|borrow from 401k|get money from 401k|get money from my 401k|take money from my 401k|use my 401k|access retirement|borrow from retirement/i;
    return {
      isDirect: direct.test(text),
      isIndirect: indirect.test(text),
    };
  };

  /**
   * Call Gemini API - Fallback Only
   * 
   * This function is ONLY called when activeMode === 'NONE'.
   * It provides informational responses for general retirement questions.
   * 
   * Why Gemini is fallback-only:
   * - Scripted flows (enrollment, loan) must remain deterministic
   * - Gemini cannot modify application state or interfere with workflows
   * - Only use Gemini when no scripted flow is active
   * 
   * System prompt restrictions:
   * - No financial advice
   * - No transaction guidance
   * - Only high-level informational questions
   */
  const callGeminiAPI = async (input: string, conversationHistory: Message[]): Promise<string> => {
    // Use provided Gemini API key, with fallback to environment variable
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || 'AIzaSyD1DwNBYcgL8Yxw2_iV4LLX2WaURuXZiws';
    
    console.log('🤖 Calling Gemini API (fallback mode)');
    console.log('🔑 API key exists:', !!apiKey);
    
    // If no API key, use fallback
    if (!apiKey) {
      console.warn('⚠️ API key not found. Using fallback responses.');
      const fallback = fallbackRetirementBrain(input, conversationHistory);
      console.log('📝 Fallback response:', fallback);
      return fallback;
    }

    try {
      // Initialize Gemini AI
      const ai = new GoogleGenAI({ apiKey });
      const model = (import.meta as any).env?.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';

      // Build conversation history for Gemini
      const history = conversationHistory.slice(-6).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Strict system prompt - informational only, no advice or transactions
      const chat = ai.chats.create({
        model: model,
        config: {
          systemInstruction: `You are a retirement information assistant for a US 401(k) participant portal.

CRITICAL RESTRICTIONS:
- Do NOT provide financial advice
- Do NOT guide transactions or applications
- Answer ONLY high-level informational questions
- Do NOT modify application state
- Do NOT suggest skipping steps in any process

ALLOWED:
- Explain retirement concepts (401(k), Roth, vesting, etc.)
- Provide general information about IRS rules and limits
- Answer "what is" or "how does" questions
- Explain terminology

NOT ALLOWED:
- Financial advice ("should I", "is it good", "recommend")
- Transaction guidance ("apply now", "skip this step")
- Modifying workflows or processes
- Suggesting alternatives to required steps

Keep responses SHORT and CRISP: Maximum 2-3 sentences (under 50 words).
Focus ONLY on US retirement topics.`
        },
        history: history
      });

      // Send message and get response
      const result = await chat.sendMessage({ message: input });
      let aiResponse = result.text?.trim();
      
      // Ensure response is short and crisp (max 3 sentences, ~50 words)
      if (aiResponse) {
        const sentences = aiResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 3) {
          aiResponse = sentences.slice(0, 3).join('. ').trim() + '.';
        }
        // Limit to ~50 words
        const words = aiResponse.split(/\s+/);
        if (words.length > 50) {
          aiResponse = words.slice(0, 50).join(' ') + '...';
        }
      }

      if (aiResponse) {
        console.log('✅ Gemini API response received:', aiResponse);
        console.log('📏 Response length:', aiResponse.length, 'words:', aiResponse.split(/\s+/).length);
        return aiResponse;
      } else {
        throw new Error('No response from Gemini');
      }
    } catch (error: any) {
      console.error('❌ Error calling Gemini API:', error);
      console.log('🔄 Falling back to hardcoded responses');
      const fallback = fallbackRetirementBrain(input, conversationHistory);
      console.log('📝 Fallback response:', fallback);
      return fallback;
    }
  };

  /**
   * Get AI Response - Main Routing Function
   * 
   * Enforced Routing Priority:
   * a) Active loan flow → loan agent ONLY (no Gemini)
   * b) Active enrollment flow → enrollment agent ONLY (no Gemini)
   * c) No active flow → Gemini fallback
   * 
   * Why loan flows must be deterministic:
   * - Financial transactions require regulatory compliance
   * - Must collect specific information in a fixed order
   * - Cannot allow AI to skip steps or modify workflow
   * - Ensures data accuracy and auditability
   * 
   * Why Gemini is sandboxed as read-only fallback:
   * - Gemini responses are non-deterministic (same input ≠ same output)
   * - Cannot modify application state or interfere with workflows
   * - Only used when no scripted flow is active (activeMode === 'NONE')
   * - Provides informational answers only, never transactional guidance
   * 
   * State Safety:
   * - Gemini responses never modify application state
   * - Scripted flows always take priority over Gemini
   * - Unrelated questions during active flows handled by agents (not Gemini)
   */
  // Fallback retirement brain - returns short, crisp responses with suggestions when API fails
  const fallbackRetirementBrain = (input: string, conversationHistory: Message[]): string => {
    const text = input.toLowerCase();
    const lastMessage = conversationHistory[conversationHistory.length - 1];

    // Loan-related queries
    if (text.includes("loan")) {
      return "You can borrow up to 50% of your vested balance, max $50,000. Suggestion: Check your vested balance first, then apply through your plan portal.";
    }

    // Withdrawal-related queries
    if (text.includes("withdraw") || text.includes("withdrawal") || text.includes("take out")) {
      return "Withdraw penalty-free at 59½. Before that, 10% penalty plus taxes. Suggestion: Consider a loan instead—you pay it back with interest to yourself.";
    }

    // Contribution-related queries
    if (text.includes("contribution") || text.includes("contribute") || text.includes("contribute more") || text.includes("increase contribution")) {
      return "2024 limit is $23,000. If you're 50+, add $7,500 catch-up. Suggestion: Start with 6% to get full employer match, then increase 1% each quarter.";
    }

    // Enrollment-related queries
    if (text.includes("enroll") || text.includes("enrollment") || text.includes("sign up") || text.includes("join")) {
      return "Start with 6% to get full employer match. Suggestion: Enroll today and set up automatic increases each year.";
    }

    // Age-related queries
    if (text.includes("age") || text.match(/\b(25|30|35|40|45|50|55|60|65)\b/)) {
      const ageMatch = text.match(/\b(\d+)\b/);
      const age = ageMatch ? parseInt(ageMatch[1]) : null;
      
      if (age) {
        if (age < 30) {
          return `At ${age}, start with 6% to get full employer match. Suggestion: Increase to 10-15% over the next 2-3 years.`;
        } else if (age < 50) {
          return `At ${age}, aim for 10-15% total (including match). Suggestion: Review your investment mix and consider increasing contributions annually.`;
        } else if (age < 60) {
          return `At ${age}, maximize contributions ($23,000/year). Suggestion: Add catch-up contributions if eligible, and plan for penalty-free withdrawals at 59½.`;
        } else {
          return `At ${age}, you can withdraw penalty-free. Suggestion: Plan withdrawals to minimize taxes and ensure RMDs start at 73.`;
        }
      }
      return "Your age helps me recommend the best contribution rate. Suggestion: Share your age for personalized advice.";
    }

    // Balance-related queries
    if (text.includes("balance") || text.includes("how much") || text.includes("account balance")) {
      return "For loans, you can borrow up to 50% of your vested balance, max $50,000. Suggestion: Log into your account to check your exact vested balance.";
    }

    // Employer match queries
    if (text.includes("match") || text.includes("employer match") || text.includes("company match")) {
      return "Most plans match 50% up to 6% of salary. Contribute 6%, they add 3%—that's free money. Suggestion: Ensure you're contributing at least 6% to maximize the match.";
    }

    // Retirement age queries
    if (text.includes("retirement age") || text.includes("when can i retire") || text.includes("retire")) {
      return "Withdraw penalty-free at 59½. Many work longer to maximize savings. Suggestion: Use a retirement calculator to estimate your savings goal and timeline.";
    }

    // Tax-related queries
    if (text.includes("tax") || text.includes("taxes") || text.includes("taxable")) {
      return "Traditional 401(k): pay taxes when you withdraw. Roth 401(k): pay taxes now, withdraw tax-free after 59½. Suggestion: Consider splitting contributions between Traditional and Roth for tax flexibility.";
    }

    // Rollover queries
    if (text.includes("rollover") || text.includes("roll over") || text.includes("transfer")) {
      return "Rollovers move your 401(k) to an IRA or new employer's plan. Direct rollovers avoid taxes. Suggestion: Contact your plan administrator to initiate a direct rollover and avoid penalties.";
    }

    // Vesting queries
    if (text.includes("vest") || text.includes("vesting") || text.includes("vested")) {
      return "Your contributions are always 100% vested. Employer match typically vests over 3-6 years. Suggestion: Check your vesting schedule in your plan documents to see when you'll be fully vested.";
    }

    // General greeting or unclear query
    if (text.includes("hello") || text.includes("hi") || text.includes("help") || text.length < 5) {
      return "I can help with loans, withdrawals, contributions, and more. Suggestion: Ask about loans, withdrawals, or how to increase your contributions.";
    }

    // Default response for unrecognized queries
    return "I can help with US retirement topics: loans, withdrawals, contributions, rollovers, and more. Suggestion: Try asking about loans, contributions, or withdrawals.";
  };

  // Legacy handlers removed: all input must route through handleUserInput().
  const handleSubmit = async (text?: string) => {
    const input = (text ?? userText).trim();
    await handleUserInput(input, "text");
  };

  // UI event wrappers: no direct state mutation, no voice-only paths.
  const handleEnrollmentChoice = (agentInput: string, _label?: string) => {
    handleUserInput(agentInput, "chip");
  };
  const handleLoanChoice = (agentInput: string, _label?: string) => {
    handleUserInput(agentInput, "chip");
  };
  const startVestedBalanceFlow = () => {
    handleUserInput("What is my vested balance?", "chip");
  };

  // Auto-speak removed: greeting is displayed as text only.
  // Voice playback is user-controlled via play buttons on assistant messages.
  // Mic access must be user-initiated: browsers require a gesture (e.g. button click) for getUserMedia.

  /** Stop current speech recognition. Only runs when we have an active instance and are listening. */
  const stopListening = () => {
    if (recognitionRef.current && listening) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
      setListening(false);
    }
  };

  /**
   * Start voice input. Must be called only from explicit user interaction (e.g. mic button click).
   * Mic access must be user-initiated: browsers require a gesture for getUserMedia; otherwise
   * permission is denied or fails silently. Auto-start on load is blocked by this policy.
   */
  const startVoiceInput = async () => {
    if (listening) {
      stopListening();
      return;
    }

    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Microphone access is not available. Use a secure context (HTTPS) and a supported browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch (err: any) {
      const denied = err?.name === 'NotAllowedError' || /permission|denied/i.test(err?.message || '');
      if (denied) {
        alert(
          'Microphone access was denied. Voice input needs microphone permission. ' +
            'Please allow microphone access in your browser settings (or the site prompt) and try again.'
        );
      } else {
        alert('Could not access microphone. Check your device and browser settings, then try again.');
      }
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setListening(true);

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += t + ' ';
          else interimTranscript += t;
        }
        if (interimTranscript) setUserText(interimTranscript);
        if (finalTranscript) {
          const transcript = finalTranscript.trim();
          if (transcript) {
            setUserText(transcript);
            setListening(false);
            recognitionRef.current = null;
            setTimeout(() => handleUserInput(transcript, "voice"), 300);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setListening(false);
        recognitionRef.current = null;
        if (event.error === 'not-allowed') {
          alert(
            'Microphone access was denied. Voice input needs microphone permission. ' +
              'Please allow microphone access in your browser settings and try again.'
          );
        } else if (event.error === 'no-speech') {
          /* user said nothing; no alert */
        } else if (event.error === 'network') {
          alert('A network error occurred. Check your connection and try again.');
        } else if (event.error === 'audio-capture') {
          alert('No microphone found. Connect a microphone and try again.');
        }
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setListening(false);
      recognitionRef.current = null;
      const msg = err?.message || String(err);
      if (/not-allowed|permission|denied/i.test(msg)) {
        alert(
          'Microphone access was denied. Voice input needs microphone permission. ' +
            'Please allow microphone access in your browser settings and try again.'
        );
      } else {
        alert('Voice input could not be started. Please try again.');
      }
    }
  };

  /** Mic button click: start or stop voice input. Recognition runs only after explicit user click. */
  const handleVoiceClick = () => {
    if (listening) {
      stopListening();
    } else {
      startVoiceInput();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file attachment
      console.log('File selected:', file.name);
      // You can add file handling logic here
      // For now, just show an alert
      alert(`File "${file.name}" selected. File attachment feature can be implemented here.`);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Dark mode class applied to the wrapper div only (no body mutation when embedded)
  useEffect(() => {
    if (variant === "fullpage") {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, variant]);

  return (
    <div
      className={`
        flex flex-col w-full items-center p-2 sm:p-4 md:p-6 lg:p-8
        transition-colors duration-300 relative isolate overflow-x-hidden justify-start antialiased
        ${variant === "embedded" ? "h-full overflow-hidden" : "min-h-screen"}
        ${isDarkMode ? "text-[#e5e7eb]" : "text-slate-900"}
      `}
      style={
        isDarkMode
          ? {
              backgroundColor: "#0b1020", // solid dark base layer (no blur)
            }
          : undefined
      }
    >
      {/* Background layer (light): near-white base + extremely subtle depth */}
      {!isDarkMode && (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[#f8fafc]"
          style={{
            backgroundImage:
              "radial-gradient(900px 520px at 15% 10%, rgba(148,163,184,0.10) 0%, rgba(248,250,252,0) 60%)," +
              "radial-gradient(900px 520px at 85% 0%, rgba(196,181,253,0.10) 0%, rgba(248,250,252,0) 62%)," +
              "radial-gradient(1100px 700px at 50% 95%, rgba(186,230,253,0.12) 0%, rgba(248,250,252,0) 60%)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Background layer (dark): solid base + visible radial glow (no blur) */}
      {isDarkMode && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
          style={{
            backgroundColor: "#0b1020",
            backgroundImage:
              "radial-gradient(circle at top center, rgba(99,102,241,0.35), rgba(11,16,32,0.9) 55%)",
          }}
        />
      )}

      {/* Scrim layer: neutral overlay to control contrast */}
      <div
        className={`pointer-events-none absolute inset-0 z-0 ${isDarkMode ? 'bg-[#0b1020]/35' : 'bg-white/88'}`}
        aria-hidden="true"
      />

      <BellaScreenLayout
        variant={variant}
        header={
          <div className={variant === "fullpage" ? "fixed top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50" : "shrink-0 flex justify-end p-2 sm:p-3"}>
            <div
              className={`
                flex items-center gap-1 p-1 rounded-2xl shadow-lg backdrop-blur-xl
                ${isDarkMode ? "bg-slate-900/60 border border-slate-700/60" : "bg-white/70 border border-slate-200/70"}
              `}
          style={{
            backdropFilter: 'blur(18px) saturate(140%)',
            WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          }}
        >
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
              transition-all duration-200
              ${isDarkMode
                ? 'text-yellow-300 hover:bg-white/5 active:bg-white/10'
                : 'text-slate-800 hover:bg-slate-900/5 active:bg-slate-900/10'
              }
            `}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
          {isDarkMode ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
          </button>

          {/* Close Button */}
          <button
            onClick={() => {
              if (onClose) {
                onClose();
                return;
              }
              setMessages([{
                id: '1',
                role: 'assistant',
                content: "Hi, I'm your retirement assistant. How can I help you?",
                timestamp: new Date()
              }]);
              setUserText("");
              setIsEnrolling(false);
              setEnrollmentState(null);
              setIsApplyingForLoan(false);
              setLoanState(null);
              setPendingLoanConfirmation(false);
              setWithdrawalState(null);
              setWithdrawalDemoState(null);
              setWithdrawalCompleteState(null);
              setVestingState(null);
              setVestingExplainerOpen(false);
              window.speechSynthesis.cancel();
            }}
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
              transition-all duration-200
              ${isDarkMode
                ? 'text-slate-200 hover:bg-white/5 active:bg-white/10'
                : 'text-slate-800 hover:bg-slate-900/5 active:bg-slate-900/10'
              }
            `}
            aria-label="Close"
          >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          </button>
        </div>
          </div>
        }
        footer={
          <div
            className={variant === "fullpage"
              ? `pt-2 pb-2 sm:pb-3 md:pb-4 ${isDarkMode ? "bg-transparent border-t border-[rgba(148,163,184,0.08)]" : "bg-white/95 border-t border-slate-200"} backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.08)] fixed bottom-0 left-0 right-0 z-20 w-full`
              : `shrink-0 pt-2 pb-2 sm:pb-3 md:pb-4 ${isDarkMode ? "border-t border-slate-700/50 bg-slate-900/30" : "border-t border-slate-200 bg-white/95"} backdrop-blur-xl`}
          >
            {!userText && (
              <div className="w-full max-w-4xl mx-auto px-2 sm:px-3 md:px-4 pb-2">
                <div className="max-w-4xl w-full mx-auto">
                  <p className={`text-xs sm:text-sm mb-1 sm:mb-1.5 md:mb-2 text-center ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    Try asking:
                  </p>
                  <div className="flex flex-wrap justify-center gap-1 xs:gap-1.5 sm:gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (question.toLowerCase().includes("vested balance")) {
                            startVestedBalanceFlow();
                          } else {
                            handleUserInput(question, "chip");
                          }
                        }}
                        className={`
                          px-2.5 py-1 xs:px-3 xs:py-1.5 sm:px-3.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm rounded-full
                          ${isDarkMode ? "backdrop-blur-md" : ""}
                          transition-all duration-200 touch-manipulation
                          ${isDarkMode
                            ? "bg-slate-900/40 text-slate-200 border border-slate-700/50 hover:bg-slate-900/55 hover:border-slate-600/60 active:bg-slate-900/65"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 shadow-sm"}
                        `}
                        style={isDarkMode ? { backdropFilter: "blur(10px) saturate(180%)", WebkitBackdropFilter: "blur(10px) saturate(180%)", minHeight: "28px" } : { minHeight: "28px" }}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 md:pb-4">
              <div
                className={`
                  flex items-center gap-1 sm:gap-1.5 md:gap-2 rounded-2xl shadow-xl p-1.5 sm:p-2
                  ${isDarkMode ? "bg-[rgba(15,23,42,0.9)] border border-[rgba(148,163,184,0.15)]" : "bg-white border border-slate-200 shadow-md"}
                `}
                style={isDarkMode ? { boxShadow: "0 10px 30px rgba(0,0,0,0.45)" } : { backdropFilter: "blur(18px) saturate(140%)", WebkitBackdropFilter: "blur(18px) saturate(140%)" }}
              >
                <button
                  onClick={handleVoiceClick}
                  disabled={typeof window === "undefined" || !getSpeechRecognition()}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center
                    transition-all duration-200 flex-shrink-0 touch-manipulation
                    ${listening ? "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white animate-pulse ring-2 ring-red-300 ring-offset-2" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  aria-label={listening ? "Stop listening" : "Start voice input"}
                  title={listening ? "Click to stop listening" : "Click to start voice input (microphone permission required)"}
                >
                  {listening ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
                <input
                  type="text"
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  onKeyPress={(e) => { if (e.key === "Enter") handleSubmit(); }}
                  placeholder="Say or type your question..."
                  className={`flex-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-sm sm:text-base md:text-lg bg-transparent border-none outline-none ${isDarkMode ? "text-gray-100 placeholder-gray-400" : "text-gray-900 placeholder-gray-400"}`}
                />
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" className="hidden" aria-label="Attach file" />
                <button
                  onClick={handleAttachClick}
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 touch-manipulation ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-500" : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"}`}
                  aria-label="Attach file or image"
                  title="Attach file or image"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button
                  onClick={() => handleSubmit()}
                  disabled={!userText.trim()}
                  className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-sm sm:text-base md:text-lg rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 touch-manipulation min-w-[44px]"
                  aria-label="Send message"
                  title="Send message"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        }
      >
      {/* Mode indicators: fixed (fullpage) or relative (embedded) */}
      {isEnrolling && enrollmentState && (
        <div className={variant === "fullpage" ? "fixed top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-6 z-50" : "relative z-10 shrink-0"}>
          <div className={`px-3 py-2 rounded-full backdrop-blur-md text-sm font-medium ${isDarkMode ? "bg-blue-600/80 text-white border border-blue-500/30" : "bg-blue-600/80 text-white border border-blue-500/30"}`} style={{ backdropFilter: "blur(10px) saturate(180%)", WebkitBackdropFilter: "blur(10px) saturate(180%)" }}>
            {getEnrollmentPhaseLabel(enrollmentState.step)}
          </div>
        </div>
      )}
      {(withdrawalState || withdrawalDemoState || withdrawalCompleteState) && (
        <div className={variant === "fullpage" ? "fixed top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-6 z-50" : "relative z-10 shrink-0"}>
          <div className={`px-3 py-2 rounded-full backdrop-blur-md text-sm font-medium ${isDarkMode ? "bg-amber-600/80 text-white border border-amber-500/30" : "bg-amber-600/80 text-white border border-amber-500/30"}`} style={{ backdropFilter: "blur(10px) saturate(180%)", WebkitBackdropFilter: "blur(10px) saturate(180%)" }}>
            {getWithdrawalPhaseLabel((withdrawalDemoState?.step ?? withdrawalCompleteState?.step ?? withdrawalState?.step ?? "INTENT") as string)}
          </div>
        </div>
      )}
      {isApplyingForLoan && loanState && (
        <div className={variant === "fullpage" ? "fixed top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-6 z-50" : "relative z-10 shrink-0"}>
          <div className={`px-3 py-2 rounded-full backdrop-blur-md text-sm font-medium ${isDarkMode ? "bg-green-600/80 text-white border border-green-500/30" : "bg-green-600/80 text-white border border-green-500/30"}`} style={{ backdropFilter: "blur(10px) saturate(180%)", WebkitBackdropFilter: "blur(10px) saturate(180%)" }}>
            💰 Loan: {(() => { const step = loanState.step; if (step === "ELIGIBILITY" || step === "RULES") return "About your account"; if (step === "AMOUNT" || step === "PURPOSE" || step === "TERM") return "Loan details"; if (step === "REVIEW") return "Review & submit"; return "In progress"; })()}
          </div>
        </div>
      )}
      {/* Initial Screen - Show greeting with orb when only one message */}
      {messages.length === 1 ? (
        <div className={`flex flex-col items-center justify-center w-full relative z-10 px-2 sm:px-4 pb-44 sm:pb-48 ${variant === "embedded" ? "min-h-0 py-8" : "min-h-[70vh]"}`}>
          {/* AI Visual Representation */}
          <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-12 mt-8 sm:mt-12 md:mt-16 lg:mt-20">
            <div
              className={`
                w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full
                bg-gradient-to-br from-purple-400 via-indigo-400 to-blue-400
                blur-2xl opacity-70
                transition-all duration-500
                ${
                  listening
                    ? "scale-125 animate-pulse"
                    : isSpeaking
                    ? "scale-115 animate-pulse"
                    : "scale-110"
                }
              `}
            />
            {isSpeaking && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 mt-2 sm:mt-4">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>

          {/* Greeting Text */}
          <div className="max-w-[95%] sm:max-w-3xl mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4 text-center">
            <p
              className={`
                text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold leading-relaxed tracking-tight
                ${isDarkMode ? 'text-[#f8fafc]' : 'text-slate-950'}
              `}
              style={{
                textShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.35)' : 'none',
              }}
            >
              {messages[0].content}
            </p>
          </div>

        </div>
      ) : (
        /* Chat Conversation - grows naturally; page scrolls */
        <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-44 sm:pb-48 pt-8 sm:pt-12 md:pt-16 lg:pt-20 flex flex-col relative z-10">
          <div className="space-y-2 sm:space-y-3 md:space-y-4 flex flex-col">
            <div className="px-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2 sm:mb-3`}
                >
                  <div
                    className={`
                      max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 backdrop-blur-md
                      ${message.role === 'user'
                        ? isDarkMode
                          ? 'bg-blue-600/80 text-white rounded-br-md border border-blue-500/30'
                          : 'bg-blue-600/80 text-white rounded-br-md border border-blue-500/30'
                        : isDarkMode
                          ? 'bg-slate-900/55 text-slate-100 rounded-bl-md border border-slate-700/60'
                          : 'bg-white/75 text-slate-900 rounded-bl-md border border-slate-200/70'
                      }
                    `}
                    style={{
                      backdropFilter: 'blur(10px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                    }}
                  >
                    <p className="text-sm sm:text-base md:text-lg font-semibold leading-relaxed tracking-tight break-words">
                      {message.role === 'assistant' &&
                      isEnrolling &&
                      enrollmentState?.step === 'MONEY_HANDLING' &&
                      message.content.toLowerCase().startsWith('how do you want your money handled?')
                        ? "How would you like your investments to be managed?"
                        : message.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Enrollment contextual suggestion chips (UI-only; no step skipping) */}
              {isEnrolling && enrollmentState && enrollmentState.step === "INTENT" && (
                <div className="mt-3" aria-label="Enrollment suggestions">
                  {ContextChips({
                    ariaLabel: "Enrollment intent suggestions",
                    chips: [
                      {
                        label: "Start enrollment",
                        onClick: () => handleEnrollmentChoice("I want to enroll", "Start enrollment"),
                      },
                      {
                        label: "What does enrollment mean?",
                        onClick: () => setEnrollmentIntentInfoOpen((v) => !v),
                      },
                    ],
                  })}
                  {enrollmentIntentInfoOpen && (
                    <div
                      className={`
                        mt-2 rounded-xl border px-3 py-3 text-sm
                        ${isDarkMode ? "border-slate-700/60 bg-slate-950/20 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-800"}
                      `}
                      role="note"
                    >
                      Enrollment is the process of setting up your retirement plan selections—like your contribution amount and how your money is handled. You can review and update these later.
                    </div>
                  )}
                </div>
              )}

              {isEnrolling && enrollmentState && (enrollmentState.step === "CURRENT_AGE" || enrollmentState.step === "RETIREMENT_AGE") && (
                <div className="mt-3" aria-label="Age step suggestions">
                  {ContextChips({
                    ariaLabel: "Age step suggestions",
                    chips: [
                      { label: "Why do you need this?", onClick: () => setEnrollmentAgeHelpOpen((s) => ({ ...s, why: !s.why })) },
                      { label: "I’m not sure", onClick: () => setEnrollmentAgeHelpOpen((s) => ({ ...s, notSure: !s.notSure })) },
                    ],
                  })}
                  {(enrollmentAgeHelpOpen.why || enrollmentAgeHelpOpen.notSure) && (
                    <div
                      className={`
                        mt-2 rounded-xl border px-3 py-3 text-sm
                        ${isDarkMode ? "border-slate-700/60 bg-slate-950/20 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-800"}
                      `}
                      role="note"
                    >
                      {enrollmentAgeHelpOpen.why && (
                        <div>
                          We ask this to show the right plan options and a simple timeline. Just enter an age in years.
                        </div>
                      )}
                      {enrollmentAgeHelpOpen.notSure && (
                        <div className={enrollmentAgeHelpOpen.why ? "mt-2" : ""}>
                          If you’re not sure, use your best estimate. This doesn’t submit anything by itself.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Loan demo: context + structured UI (no business logic changes) */}
              {isApplyingForLoan && loanState && (
                <div className="mt-3 sm:mt-4 space-y-3" role="region" aria-label="Loan application">
                  {/* Account Snapshot Card (demo context) */}
                  {(loanState.step === 'ELIGIBILITY' || loanState.step === 'RULES' || loanState.step === 'AMOUNT') && (
                    <div
                      className={`
                        rounded-2xl border shadow-sm overflow-hidden
                        ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                      `}
                      aria-label="Account snapshot (demo)"
                    >
                      <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Account snapshot {demoParticipant.isDemo ? '(Demo)' : ''}
                        </div>
                        <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Read-only demo values for a guided walkthrough.
                        </div>
                      </div>
                      <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Employment status</div>
                          <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{demoParticipant.employmentStatus}</div>
                        </div>
                        <div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Plan participation</div>
                          <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{demoParticipant.planParticipation}</div>
                        </div>
                        <div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Vested balance</div>
                          <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{formatCurrency(demoParticipant.vestedBalance)}</div>
                        </div>
                        <div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Existing loan balance</div>
                          <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{formatCurrency(demoParticipant.currentLoanBalance)}</div>
                        </div>
                      </div>

                      {/* Loan availability statement (entry-point; UI-only, no guarantees) */}
                      <div
                        className={`
                          px-4 pb-4 text-sm
                          ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}
                        `}
                        role="note"
                      >
                        Based on this information, you may be able to borrow up to approximately {formatCurrency(loanState.maxLoan)}. This is an estimate.
                      </div>
                    </div>
                  )}

                  {/* Entry CTAs (system-led): Continue / Cancel + helper chip */}
                  {loanState.step === 'RULES' && (
                    <div>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Continue or cancel loan request">
                        <button
                          type="button"
                          onClick={() => handleUserInput("yes", "chip")}
                          className={isDarkMode
                            ? "px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                            : "px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"}
                        >
                          Continue
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUserInput("cancel", "chip")}
                          className={isDarkMode
                            ? "px-4 py-2 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                            : "px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                        >
                          Cancel loan request
                        </button>
                      </div>

                      {ContextChips({
                        ariaLabel: "Loan availability helper",
                        chips: [
                          { label: "How is this amount calculated?", onClick: () => setLoanAmountInfoOpen((s) => ({ ...s, max: !s.max })) },
                        ],
                      })}
                      {loanAmountInfoOpen.max && (
                        <div
                          className={`
                            mt-2 rounded-xl border px-3 py-3 text-sm
                            ${isDarkMode ? "border-slate-700/60 bg-slate-950/20 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-800"}
                          `}
                          role="note"
                        >
                          This estimate is based on your vested balance and plan limits. Availability is subject to plan rules and processing.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rules + “continue” card */}
                  {loanState.step === 'RULES' && (
                    <div
                      className={`
                        rounded-2xl border shadow-sm overflow-hidden
                        ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                      `}
                      aria-label="Loan basics"
                    >
                      <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Loan availability
                        </div>
                        <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Based on demo account info, you may be able to borrow up to about {formatCurrency(loanState.maxLoan)}. This is an estimate.
                        </div>
                      </div>
                      <div className="px-4 py-4">
                        <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          <li className="flex items-start gap-2">
                            <span className={`mt-[6px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-500' : 'bg-slate-400'}`} />
                            <span>Maximum is based on your vested balance.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className={`mt-[6px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-500' : 'bg-slate-400'}`} />
                            <span>Repayment is typically through payroll deductions.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className={`mt-[6px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-500' : 'bg-slate-400'}`} />
                            <span>Interest is paid back into your account.</span>
                          </li>
                        </ul>
                        {/* Continue handled above via system-led CTAs */}
                      </div>
                    </div>
                  )}

                  {/* Amount selection: availability + presets + slider */}
                  {loanState.step === 'AMOUNT' && (
                    <div className="space-y-3" aria-label="Loan amount selection">
                      <div
                        className={`
                          rounded-2xl border shadow-sm overflow-hidden
                          ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                        `}
                        aria-label="Loan availability"
                      >
                        <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                          <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            Loan availability
                          </div>
                          <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            Based on your account, you may be able to borrow up to about {formatCurrency(loanState.maxLoan)}. This is an estimate.
                          </div>
                        </div>
                        <div className="px-4 py-4 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {[1000, 5000, 10000].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => handleLoanChoice(formatCurrency(amt), formatCurrency(amt))}
                                className={isDarkMode
                                  ? "px-3 py-2 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                                  : "px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                              >
                                {formatCurrency(amt)}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleLoanChoice(formatCurrency(loanState.maxLoan), "Max")}
                              className={isDarkMode
                                ? "px-3 py-2 rounded-xl text-sm font-medium border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/10"
                                : "px-3 py-2 rounded-xl text-sm font-medium border border-blue-200 text-blue-700 hover:bg-blue-50"}
                            >
                              Max
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <label htmlFor="loan-amount-slider" className="sr-only">Loan amount</label>
                            <input
                              id="loan-amount-slider"
                              type="range"
                              min={1000}
                              max={Math.floor(loanState.maxLoan)}
                              step={100}
                              value={Math.min(Math.max(loanAmountDraft, 1000), Math.floor(loanState.maxLoan))}
                              onChange={(e) => setLoanAmountDraft(Number(e.target.value))}
                              onMouseUp={() => handleLoanChoice(formatCurrency(loanAmountDraft), formatCurrency(loanAmountDraft))}
                              onTouchEnd={() => handleLoanChoice(formatCurrency(loanAmountDraft), formatCurrency(loanAmountDraft))}
                              className={`flex-1 h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} accent-blue-600 cursor-pointer`}
                            />
                            <span className={`text-sm font-semibold tabular-nums ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                              {formatCurrency(loanAmountDraft)}
                            </span>
                          </div>

                          {/* Light, non-advisory guidance (inline; not spoken) */}
                          <div
                            className={`
                              rounded-xl border px-3 py-2.5 text-xs sm:text-sm
                              ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}
                            `}
                            role="note"
                          >
                            {loanAmountDraft >= loanState.maxLoan * 0.75 ? (
                              <span>
                                Higher loan amounts can be harder to repay and may reduce your retirement balance while the loan is outstanding.
                              </span>
                            ) : (
                              <span>
                                Your loan amount affects your monthly payment and how long the loan stays outstanding.
                              </span>
                            )}
                          </div>

                          {ContextChips({
                            ariaLabel: "Loan amount suggestions",
                            chips: [
                              { label: "What’s the maximum I can take?", onClick: () => setLoanAmountInfoOpen((s) => ({ ...s, max: !s.max })) },
                              { label: "How does repayment work?", onClick: () => setLoanAmountInfoOpen((s) => ({ ...s, repayment: !s.repayment })) },
                            ],
                          })}

                          {(loanAmountInfoOpen.max || loanAmountInfoOpen.repayment) && (
                            <div
                              className={`
                                mt-2 rounded-xl border px-3 py-3 text-sm
                                ${isDarkMode ? "border-slate-700/60 bg-slate-950/20 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-800"}
                              `}
                              role="note"
                            >
                              {loanAmountInfoOpen.max && (
                                <div>
                                  Your maximum is based on your account and plan rules. In this demo, that’s up to about {formatCurrency(loanState.maxLoan)} (estimate).
                                </div>
                              )}
                              {loanAmountInfoOpen.repayment && (
                                <div className={loanAmountInfoOpen.max ? "mt-2" : ""}>
                                  Repayment is typically through payroll deductions, and interest is paid back into your account. Exact terms depend on your plan.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Purpose: optional chips + skip */}
                  {loanState.step === 'PURPOSE' && (
                    <div
                      className={`
                        rounded-2xl border shadow-sm overflow-hidden
                        ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                      `}
                      aria-label="Loan purpose (optional)"
                    >
                      <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Loan purpose (optional)
                        </div>
                        <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          You can skip this if you prefer.
                        </div>
                      </div>
                      <div className="px-4 py-4 flex flex-wrap gap-2">
                        {["Home repair", "Debt", "Emergency", "Education"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleLoanChoice(p, p)}
                            className={isDarkMode
                              ? "px-3 py-2 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                              : "px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleLoanChoice("skip", "Skip")}
                          className={isDarkMode
                            ? "px-3 py-2 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                            : "px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Term: preset buttons */}
                  {loanState.step === 'TERM' && (
                    <div
                      className={`
                        rounded-2xl border shadow-sm overflow-hidden
                        ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                      `}
                      aria-label="Repayment term"
                    >
                      <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Repayment term
                        </div>
                        <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Choose 1 to 5 years.
                        </div>
                      </div>
                      <div className="px-4 py-4 space-y-3">
                        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Select a repayment term">
                          {[1, 3, 5].map((y) => {
                            const selected = loanTermDraft === y;
                            return (
                              <button
                                key={y}
                                type="button"
                                onClick={() => {
                                  setLoanTermDraft(y);
                                }}
                                className={`
                                  px-3 py-3 rounded-xl text-sm font-semibold border transition-colors
                                  ${selected
                                    ? isDarkMode
                                      ? 'border-indigo-400/60 bg-indigo-500/10 text-slate-50 ring-2 ring-indigo-400/30'
                                      : 'border-blue-300 bg-blue-50 text-slate-900 ring-2 ring-blue-200'
                                    : isDarkMode
                                      ? 'border-slate-700/60 text-slate-100 hover:bg-white/5'
                                      : 'border-slate-200 text-slate-900 hover:bg-slate-50'
                                  }
                                `}
                                aria-pressed={selected}
                              >
                                {y} {y === 1 ? 'year' : 'years'}
                              </button>
                            );
                          })}
                        </div>

                        <div
                          className={`
                            rounded-xl border px-3 py-3 text-sm
                            ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-800'}
                          `}
                          role="status"
                          aria-live="polite"
                        >
                          <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            You chose a {loanTermDraft}-year repayment term.
                          </div>
                          <div className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            Longer repayment terms usually mean lower monthly payments, but more interest paid over time.
                          </div>
                          {ContextChips({
                            ariaLabel: "Repayment term suggestions",
                            chips: [
                              { label: "Why is a shorter term better?", onClick: () => setLoanTermWhyShorterOpen((v) => !v) },
                            ],
                          })}
                          {loanTermWhyShorterOpen && (
                            <div className={`mt-2 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              Shorter terms typically reduce total interest over time, because the balance is paid down sooner. This doesn’t change your selection.
                            </div>
                          )}
                          <div className={`mt-2 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            You can change this later.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLoanChoice(`${loanTermDraft} years`, `${loanTermDraft} years`)}
                          className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Review: summary + submit/edit actions */}
                  {loanState.step === 'REVIEW' && (
                    <div
                      className={`
                        rounded-2xl border shadow-sm overflow-hidden
                        ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                      `}
                      aria-label="Review loan request"
                    >
                      <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Review & submit
                        </div>
                        <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Nothing is final yet. Review your details before submitting.
                        </div>
                      </div>
                      <div className="px-4 py-4 space-y-3 text-sm">
                        <div>
                          <div className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Your loan</div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Amount</div>
                            <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                              {loanState.collectedData.loanAmount != null ? formatCurrency(loanState.collectedData.loanAmount) : "—"}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Term</div>
                            <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                              {loanState.collectedData.repaymentTerm != null ? `${loanState.collectedData.repaymentTerm} years` : "—"}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Purpose</div>
                            <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                              {loanState.collectedData.loanPurpose ?? "Not specified"}
                            </div>
                          </div>
                          </div>
                        </div>

                        <div
                          className={`
                            rounded-xl border px-3 py-3
                            ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20' : 'border-slate-200 bg-slate-50'}
                          `}
                        >
                          <div className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Your account (Demo)</div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Vested balance</div>
                              <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{formatCurrency(demoParticipant.vestedBalance)}</div>
                            </div>
                            <div>
                              <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Available loan amount</div>
                              <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{formatCurrency(loanState.maxLoan)}</div>
                            </div>
                            <div>
                              <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Existing loan balance</div>
                              <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{formatCurrency(demoParticipant.currentLoanBalance)}</div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`
                            rounded-xl border px-3 py-3
                            ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}
                          `}
                        >
                          <div className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>What happens next</div>
                          <ul className="mt-2 space-y-1 text-xs sm:text-sm">
                            <li>Submitted → Your request is sent for processing.</li>
                            <li>Being processed → Your request is reviewed and set up.</li>
                            <li>Update → You’ll receive an update according to your plan’s process.</li>
                          </ul>
                          <div className="mt-2 text-xs sm:text-sm">You can change this later.</div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoanChoice('yes', 'Submit')}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Submit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoanChoice('change amount', 'Change amount')}
                            className={isDarkMode
                              ? "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                              : "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                          >
                            Change amount
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoanChoice('change term', 'Change term')}
                            className={isDarkMode
                              ? "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                              : "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                          >
                            Change term
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoanChoice('change purpose', 'Change purpose')}
                            className={isDarkMode
                              ? "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                              : "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                          >
                            Change purpose
                          </button>
                        </div>

                        {ContextChips({
                          ariaLabel: "Loan review suggestions",
                          chips: [
                            { label: "Edit amount", onClick: () => handleLoanChoice("change amount", "Change amount") },
                            { label: "Edit repayment term", onClick: () => handleLoanChoice("change term", "Change term") },
                          ],
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Withdrawal demo: guided, card-first flow (demo-only) */}
              {withdrawalDemoState && (
                <div className="mt-3 sm:mt-4 space-y-3" role="region" aria-label="Withdrawal flow">
                  {/* Step 2: Account snapshot card (demo context) */}
                  <div
                    className={`
                      rounded-2xl border shadow-sm overflow-hidden
                      ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                    `}
                    aria-label="Account snapshot (demo)"
                  >
                    <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                      <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        Account snapshot {demoWithdrawalParticipant.isDemo ? '(Demo)' : ''}
                      </div>
                      <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Read-only demo values for a guided walkthrough.
                      </div>
                    </div>
                    <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Age</div>
                        <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{demoWithdrawalParticipant.currentAge}</div>
                      </div>
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Employment status</div>
                        <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{demoWithdrawalParticipant.employmentStatus}</div>
                      </div>
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Vested balance</div>
                        <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{formatCurrency(demoWithdrawalParticipant.vestedBalance)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Step controls by demo step */}
                  {withdrawalDemoState.step === 'INTENT' && (
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Start withdrawal flow">
                      <button
                        type="button"
                        onClick={() => handleUserInput("continue", "chip")}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Continue
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleUserInput("cancel", "chip");
                        }}
                        className={isDarkMode
                          ? "px-4 py-2 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                          : "px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {withdrawalDemoState.step === 'SNAPSHOT' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleUserInput("continue", "chip")}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Continue
                      </button>
                    </div>
                  )}

                  {/* Step 3: Eligibility card (demo rules; neutral) */}
                  {withdrawalDemoState.step === 'ELIGIBILITY' && (
                    <div
                      className={`
                        rounded-2xl border shadow-sm overflow-hidden
                        ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                      `}
                      aria-label="Withdrawal eligibility (demo)"
                    >
                      <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Withdrawal eligibility (Demo)
                        </div>
                        <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Based on your account and plan rules (demo), some withdrawal types may be available. This does not guarantee approval.
                        </div>
                      </div>
                      <div className="px-4 py-4 space-y-2 text-sm">
                        <div className={`rounded-xl border px-3 py-2.5 ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                          In-service withdrawals: {demoWithdrawalParticipant.planRules.inServiceWithdrawalAllowed ? "May be available" : "Not available"}
                        </div>
                        <div className={`rounded-xl border px-3 py-2.5 ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                          Hardship withdrawals: {demoWithdrawalParticipant.planRules.hardshipWithdrawalAllowed ? "May be available" : "Not available"}
                        </div>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleUserInput("continue", "chip")}
                            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Withdrawal type selection */}
                  {withdrawalDemoState.step === 'TYPE' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3" role="group" aria-label="Withdrawal type">
                      {demoWithdrawalParticipant.planRules.inServiceWithdrawalAllowed && demoWithdrawalParticipant.employmentStatus === "Active" && (
                        <button
                          type="button"
                          onClick={() => handleUserInput("type:IN_SERVICE", "chip")}
                          className={isDarkMode
                            ? "text-left rounded-2xl border border-slate-700/60 bg-slate-900/50 px-4 py-4 hover:bg-slate-900/60"
                            : "text-left rounded-2xl border border-slate-200 bg-white px-4 py-4 hover:bg-slate-50"}
                        >
                          <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>In-service withdrawal</div>
                          <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Withdraw while still employed (if allowed)</div>
                        </button>
                      )}
                      {demoWithdrawalParticipant.planRules.hardshipWithdrawalAllowed && (
                        <button
                          type="button"
                          onClick={() => handleUserInput("type:HARDSHIP", "chip")}
                          className={isDarkMode
                            ? "text-left rounded-2xl border border-slate-700/60 bg-slate-900/50 px-4 py-4 hover:bg-slate-900/60"
                            : "text-left rounded-2xl border border-slate-200 bg-white px-4 py-4 hover:bg-slate-50"}
                        >
                          <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Hardship withdrawal</div>
                          <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>For qualifying hardship reasons (if allowed)</div>
                        </button>
                      )}
                      {demoWithdrawalParticipant.employmentStatus !== "Active" && (
                        <button
                          type="button"
                          onClick={() => handleUserInput("type:POST_EMPLOYMENT", "chip")}
                          className={isDarkMode
                            ? "text-left rounded-2xl border border-slate-700/60 bg-slate-900/50 px-4 py-4 hover:bg-slate-900/60"
                            : "text-left rounded-2xl border border-slate-200 bg-white px-4 py-4 hover:bg-slate-50"}
                        >
                          <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Post-employment withdrawal</div>
                          <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Withdraw after leaving employment</div>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Step 5: Amount selection */}
                  {withdrawalDemoState.step === 'AMOUNT' && (
                    <div
                      className={`
                        rounded-2xl border shadow-sm overflow-hidden
                        ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                      `}
                      aria-label="Withdrawal amount"
                    >
                      <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Withdrawal amount
                        </div>
                        <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Available to request (demo): up to about {formatCurrency(demoWithdrawalParticipant.amountAvailableForWithdrawal)}. This is an estimate.
                        </div>
                      </div>
                      <div className="px-4 py-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {[500, 2000, 5000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setWithdrawalAmountDraft(amt)}
                              className={isDarkMode
                                ? "px-3 py-2 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                                : "px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                            >
                              {formatCurrency(amt)}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setWithdrawalAmountDraft(demoWithdrawalParticipant.amountAvailableForWithdrawal)}
                            className={isDarkMode
                              ? "px-3 py-2 rounded-xl text-sm font-medium border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/10"
                              : "px-3 py-2 rounded-xl text-sm font-medium border border-blue-200 text-blue-700 hover:bg-blue-50"}
                          >
                            Max
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <label htmlFor="withdrawal-amount-slider" className="sr-only">Withdrawal amount</label>
                          <input
                            id="withdrawal-amount-slider"
                            type="range"
                            min={0}
                            max={Math.floor(demoWithdrawalParticipant.amountAvailableForWithdrawal)}
                            step={50}
                            value={Math.min(withdrawalAmountDraft, Math.floor(demoWithdrawalParticipant.amountAvailableForWithdrawal))}
                            onChange={(e) => setWithdrawalAmountDraft(Number(e.target.value))}
                            className={`flex-1 h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} accent-blue-600 cursor-pointer`}
                          />
                          <span className={`text-sm font-semibold tabular-nums ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            {formatCurrency(withdrawalAmountDraft)}
                          </span>
                        </div>
                        <div className={`
                          rounded-xl border px-3 py-2.5 text-xs sm:text-sm
                          ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}
                        `}>
                          Withdrawals are typically subject to taxes and possible penalties.
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUserInput(`amount:${Math.round(withdrawalAmountDraft)}`, "chip")}
                          className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Impact awareness (UI-only) */}
                  {withdrawalDemoState.step === 'IMPACT' && (
                    <div
                      className={`
                        rounded-2xl border shadow-sm overflow-hidden
                        ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                      `}
                      aria-label="Withdrawal impact"
                    >
                      <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Impact awareness
                        </div>
                      </div>
                      <div className="px-4 py-4 space-y-2 text-sm">
                        <div className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                          Withdrawing reduces your retirement savings.
                        </div>
                        <div className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                          You can change this later.
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUserInput("continue", "chip")}
                          className="w-full mt-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 7: Review & confirm */}
                  {withdrawalDemoState.step === 'REVIEW' && (
                    <div
                      className={`
                        rounded-2xl border shadow-sm overflow-hidden
                        ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                      `}
                      aria-label="Review withdrawal request"
                    >
                      <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3`}>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Review & confirm
                        </div>
                        <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          This will submit a withdrawal request for processing. This does not guarantee approval.
                        </div>
                      </div>
                      <div className="px-4 py-4 space-y-3 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Withdrawal type</div>
                            <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                              {withdrawalDemoState.withdrawalType === 'IN_SERVICE'
                                ? 'In-service withdrawal'
                                : withdrawalDemoState.withdrawalType === 'HARDSHIP'
                                ? 'Hardship withdrawal'
                                : 'Post-employment withdrawal'}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Amount</div>
                            <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                              {formatCurrency(withdrawalDemoState.amount ?? withdrawalAmountDraft)}
                            </div>
                          </div>
                        </div>
                        <div className={`
                          rounded-xl border px-3 py-3 text-xs sm:text-sm
                          ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}
                        `}>
                          Withdrawing reduces your retirement savings.
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleUserInput("submit", "chip");
                            }}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Submit withdrawal request
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUserInput("change amount", "chip")}
                            className={isDarkMode
                              ? "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                              : "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                          >
                            Change amount
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUserInput("change type", "chip")}
                            className={isDarkMode
                              ? "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                              : "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                          >
                            Change type
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 8: Completion & next steps (not chat) */}
              {withdrawalDemoState?.step === 'CONFIRMED' && (
                <div
                  className={`
                    mt-4 rounded-2xl border shadow-lg overflow-hidden
                    ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                  `}
                  role="region"
                  aria-label="Withdrawal request submitted"
                >
                  <div className={`px-4 sm:px-5 py-4 ${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl
                          ${isDarkMode ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}
                        `}
                        aria-hidden="true"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                          Withdrawal request submitted
                        </div>
                        <div className={`mt-1 text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Your withdrawal request has been submitted for processing. This does not guarantee approval.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 py-4 space-y-3">
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                      What happens next
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { title: "Submitted (Now)", desc: "Your request has been sent to your plan administrator.", active: true },
                        { title: "Being processed", desc: "Your selections are being reviewed and set up.", active: false },
                        { title: "Active", desc: "Your choices will take effect according to your plan’s schedule.", active: false },
                      ].map((s) => (
                        <div
                          key={s.title}
                          className={`
                            rounded-xl border p-3
                            ${s.active
                              ? isDarkMode
                                ? 'border-emerald-400/30 bg-emerald-500/10'
                                : 'border-emerald-200 bg-emerald-50'
                              : isDarkMode
                                ? 'border-slate-700/60 bg-slate-950/20'
                                : 'border-slate-200 bg-white'}
                          `}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`
                                mt-[6px] h-2.5 w-2.5 rounded-full
                                ${s.active ? (isDarkMode ? 'bg-emerald-300' : 'bg-emerald-600') : (isDarkMode ? 'bg-slate-500' : 'bg-slate-400')}
                              `}
                              aria-hidden="true"
                            />
                            <div>
                              <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{s.title}</div>
                              <div className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{s.desc}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      You don’t need to take any action right now.
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => handleUserInput("done", "chip")}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loan complete confirmation (UI-only) */}
              {loanCompleteState?.step === 'CONFIRMED' && (
                <div
                  className={`
                    mt-4 rounded-2xl border shadow-lg overflow-hidden
                    ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                  `}
                  role="region"
                  aria-label="Loan request submitted"
                >
                  <div className={`px-4 sm:px-5 py-4 ${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl
                          ${isDarkMode ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}
                        `}
                        aria-hidden="true"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                          Loan request submitted
                        </div>
                        <div className={`mt-1 text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Your loan request has been submitted. This does not guarantee approval. You can review details later if needed.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 py-4 space-y-3">
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                      What happens next
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          title: "Submitted (Now)",
                          desc: "Your request has been sent for processing.",
                          active: true,
                        },
                        {
                          title: "Being processed",
                          desc: "Your request is being reviewed and set up.",
                          active: false,
                        },
                        {
                          title: "Decision",
                          desc: "You’ll receive an update according to your plan’s process.",
                          active: false,
                        },
                      ].map((s) => (
                        <div
                          key={s.title}
                          className={`
                            rounded-xl border p-3
                            ${s.active
                              ? isDarkMode
                                ? 'border-emerald-400/30 bg-emerald-500/10'
                                : 'border-emerald-200 bg-emerald-50'
                              : isDarkMode
                                ? 'border-slate-700/60 bg-slate-950/20'
                                : 'border-slate-200 bg-white'}
                          `}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`
                                mt-[6px] h-2.5 w-2.5 rounded-full
                                ${s.active ? (isDarkMode ? 'bg-emerald-300' : 'bg-emerald-600') : (isDarkMode ? 'bg-slate-500' : 'bg-slate-400')}
                              `}
                              aria-hidden="true"
                            />
                            <div>
                              <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{s.title}</div>
                              <div className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{s.desc}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      You don’t need to take any action right now.
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setShowLoanCompleteDetails((v) => !v)}
                        className={isDarkMode
                          ? "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                          : "px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                      >
                        {showLoanCompleteDetails ? 'Hide details' : 'Review my loan request'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoanCompleteState(null);
                          setShowLoanCompleteDetails(false);
                        }}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Done
                      </button>
                    </div>

                    {showLoanCompleteDetails && (
                      <div
                        className={`
                          rounded-xl border px-3 py-3 text-sm
                          ${isDarkMode ? 'border-slate-700/60 bg-slate-950/30 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-800'}
                        `}
                        aria-label="Loan request details"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Amount</div>
                            <div className="font-semibold">
                              {loanCompleteState.collectedData.loanAmount != null ? formatCurrency(loanCompleteState.collectedData.loanAmount) : "—"}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Term</div>
                            <div className="font-semibold">
                              {loanCompleteState.collectedData.repaymentTerm != null ? `${loanCompleteState.collectedData.repaymentTerm} years` : "—"}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Purpose</div>
                            <div className="font-semibold">{loanCompleteState.collectedData.loanPurpose ?? "Not specified"}</div>
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Estimated monthly payment</div>
                            <div className="font-semibold">
                              {loanCompleteState.collectedData.monthlyPayment != null ? formatCurrency(loanCompleteState.collectedData.monthlyPayment) : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Post-confirmation end state (not a chat bubble) */}
              {enrollmentCompleteState?.step === 'CONFIRMED' && (
                <div
                  className={`
                    mt-4 rounded-2xl border shadow-lg overflow-hidden
                    ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                  `}
                  role="region"
                  aria-label="Enrollment submitted"
                >
                  <div className={`px-4 sm:px-5 py-4 ${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl
                          ${isDarkMode ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}
                        `}
                        aria-hidden="true"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                          Enrollment submitted
                        </div>
                        <div className={`mt-1 text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Your enrollment has been submitted successfully. You can change these selections later if needed.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 py-4 space-y-3">
                    <div>
                      <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                        What happens next
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className={`rounded-xl border p-3 ${isDarkMode ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50'}`}>
                          <div className="flex items-start gap-2">
                            <span className={`mt-[6px] h-2.5 w-2.5 rounded-full ${isDarkMode ? 'bg-emerald-300' : 'bg-emerald-600'}`} aria-hidden="true" />
                            <div>
                              <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Submitted (Now)</div>
                              <div className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                Your enrollment has been sent to your plan administrator.
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={`rounded-xl border p-3 ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20' : 'border-slate-200 bg-white'}`}>
                          <div className="flex items-start gap-2">
                            <span className={`mt-[6px] h-2.5 w-2.5 rounded-full ${isDarkMode ? 'bg-slate-500' : 'bg-slate-400'}`} aria-hidden="true" />
                            <div>
                              <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Being processed</div>
                              <div className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                Your selections are being reviewed and set up.
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={`rounded-xl border p-3 ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20' : 'border-slate-200 bg-white'}`}>
                          <div className="flex items-start gap-2">
                            <span className={`mt-[6px] h-2.5 w-2.5 rounded-full ${isDarkMode ? 'bg-slate-500' : 'bg-slate-400'}`} aria-hidden="true" />
                            <div>
                              <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Active</div>
                              <div className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                Your choices will take effect according to your plan’s schedule.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`mt-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        You don’t need to take any action right now.
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEnrollmentCompleteDetails((v) => !v)}
                        className={`
                          px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors
                          ${isDarkMode
                            ? 'border-slate-700/60 text-slate-200 hover:bg-white/5'
                            : 'border-slate-200 text-slate-800 hover:bg-slate-50'}
                        `}
                      >
                        {showEnrollmentCompleteDetails ? 'Hide details' : 'Review my selections'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEnrollmentCompleteState(null);
                          setShowEnrollmentCompleteDetails(false);
                        }}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Done
                      </button>
                    </div>

                    {showEnrollmentCompleteDetails && (
                      <div
                        className={`
                          rounded-xl border px-3 py-3 text-sm
                          ${isDarkMode ? 'border-slate-700/60 bg-slate-950/30 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-800'}
                        `}
                        role="region"
                        aria-label="Enrollment selections"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Plan</div>
                            <div className="font-semibold">{enrollmentCompleteState.planType ?? '401(k)'}</div>
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Saving</div>
                            <div className="font-semibold">{(enrollmentCompleteState.contributionPercentage ?? 6)}%</div>
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Investments</div>
                            <div className="font-semibold">
                              {enrollmentCompleteState.investmentStrategy === 'MANUAL'
                                ? 'You choose'
                                : enrollmentCompleteState.investmentStrategy === 'ADVISOR'
                                ? 'Advisor later'
                                : 'System managed'}
                            </div>
                          </div>
                          {enrollmentCompleteState.investmentStrategy === 'MANUAL' && (
                            <div>
                              <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Risk</div>
                              <div className="font-semibold">
                                {(enrollmentCompleteState.manualRiskLevel ?? 'conservative')
                                  .toString()
                                  .charAt(0)
                                  .toUpperCase() +
                                  (enrollmentCompleteState.manualRiskLevel ?? 'conservative').toString().slice(1)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Enrollment decision UI: cards/slider/buttons instead of typing */}
              {isEnrolling && enrollmentState && ['PLAN_SELECTION', 'CONTRIBUTION', 'INVESTMENT'].includes(enrollmentState.step) && (
                <EnrollmentDecisionBlock
                  step={enrollmentState.step}
                  isDarkMode={isDarkMode}
                  hideFraming
                  onPlanSelect={(v) => handleEnrollmentChoice(v, v === 'traditional' ? 'Traditional 401(k)' : 'Roth 401(k)')}
                  onContributionSelect={(v) => handleEnrollmentChoice(v.includes('%') ? v : v, (v.includes('%') ? v : `${v}%`))}
                  onInvestmentSelect={(v) => handleEnrollmentChoice(v, v.charAt(0).toUpperCase() + v.slice(1))}
                />
              )}

              {/* Persistent selected plan summary (blue theme) */}
              {isEnrolling &&
                enrollmentState &&
                enrollmentState.selectedPlanChoice &&
                !["PLAN_RECOMMENDATION", "CONFIRMED"].includes(enrollmentState.step) && (
                  <div
                    className="mt-3 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 shadow-sm hover:shadow-md transition-shadow overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-400"
                    role="region"
                    aria-label="Selected plan summary"
                  >
                    <div className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Your selected plan
                        </div>
                        <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                          {enrollmentState.selectedPlanChoice === "PAY_TAX_NOW"
                            ? "Roth 401(k) — pay tax now, withdrawals may be tax-free later."
                            : "Traditional 401(k) — pay tax later, taxes apply when you withdraw."}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {enrollmentState.recommendedPlanChoice &&
                          enrollmentState.selectedPlanChoice === enrollmentState.recommendedPlanChoice && (
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-[10px] sm:text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                              Suggested
                            </span>
                          )}
                        <button
                          type="button"
                          onClick={() => handleUserInput("change plan", "chip")}
                          className="shrink-0 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                          Change plan
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* Persistent contribution summary (green/emerald theme) */}
              {isEnrolling &&
                enrollmentState &&
                enrollmentState.contributionPercentage != null &&
                enrollmentState.contributionPercentage >= 0 &&
                !["PLAN_RECOMMENDATION", "CONFIRMED"].includes(enrollmentState.step) && (
                  <div
                    className="mt-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    role="region"
                    aria-label="Your contribution summary"
                  >
                    <div className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Your contribution
                        </div>
                        <div className="mt-0.5 text-base font-semibold text-emerald-600 dark:text-emerald-400">
                          {enrollmentState.contributionPercentage}% of your salary
                        </div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          You can change this later.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUserInput("change contribution", "chip")}
                        className="shrink-0 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        Change contribution
                      </button>
                    </div>
                  </div>
                )}

              {/* Persistent investment summary (indigo theme) */}
              {isEnrolling &&
                enrollmentState &&
                (enrollmentState.investmentStrategy === "DEFAULT" ||
                  enrollmentState.investmentStrategy === "MANUAL" ||
                  enrollmentState.investmentStrategy === "ADVISOR") &&
                !["PLAN_RECOMMENDATION", "CONFIRMED"].includes(enrollmentState.step) && (
                  <div
                    className="mt-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    role="region"
                    aria-label="Your investments summary"
                  >
                    <div className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Your investments
                        </div>
                        <div className="mt-0.5 text-base font-medium text-slate-800 dark:text-slate-200">
                          {enrollmentState.investmentStrategy === "DEFAULT"
                            ? "System managed"
                            : enrollmentState.investmentStrategy === "MANUAL"
                              ? "I'll choose my own investments"
                              : "Work with an advisor"}
                        </div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {enrollmentState.investmentStrategy === "DEFAULT"
                            ? "Automatically adjusted over time"
                            : enrollmentState.investmentStrategy === "MANUAL"
                              ? "You'll choose risk and funds next"
                              : "An advisor will help guide your investments"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUserInput("change investment approach", "chip")}
                        className="shrink-0 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        Change investment approach
                      </button>
                    </div>
                  </div>
                )}

              {/* Plan recommendation UI: compare + select (no typing) */}
              {isEnrolling && enrollmentState && enrollmentState.step === 'PLAN_RECOMMENDATION' && (
                <div
                  className="mt-3 sm:mt-4"
                  role="group"
                  aria-label="Plan options"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {(() => {
                      const recommended = enrollmentState.recommendedPlanChoice ?? 'PAY_TAX_LATER';
                      const cards = [
                        {
                          key: 'PAY_TAX_LATER' as const,
                          title: 'Traditional 401(k)',
                          subtitle: 'Pay tax later',
                          oneLine: 'Money is taken before tax. You pay tax when you retire.',
                          benefits: [
                            'More take-home pay now',
                            'Easy default for many employees',
                            'Good if you want more salary now',
                            'You can change this later',
                          ],
                          agentValue: 'pay tax later',
                        },
                        {
                          key: 'PAY_TAX_NOW' as const,
                          title: 'Roth 401(k)',
                          subtitle: 'Pay tax now',
                          oneLine: 'Money is taxed now. You don’t pay tax when you retire.',
                          benefits: [
                            'Tax-free withdrawals later',
                            'Good for younger employees',
                            'Good if you expect higher taxes later',
                            'You can change this later',
                          ],
                          agentValue: 'pay tax now',
                        },
                      ];

                      return cards.map((c) => {
                        const isSuggested = c.key === recommended;
                        const isOpen = !!planInfoOpen[c.key];
                        return (
                          <div
                            key={c.key}
                            onClick={() => handleEnrollmentChoice(c.agentValue, c.title)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleEnrollmentChoice(c.agentValue, c.title);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            className={`
                              text-left rounded-2xl px-4 py-4 sm:px-5 sm:py-5 transition-all
                              border shadow-sm
                              ${isDarkMode
                                ? isSuggested
                                  ? 'bg-slate-900/70 border-indigo-400/50 ring-2 ring-indigo-400/50'
                                  : 'bg-slate-900/50 border-slate-700/60 hover:bg-slate-900/60'
                                : isSuggested
                                  ? 'bg-white border-blue-300 ring-2 ring-blue-200'
                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                              }
                            `}
                              aria-label={`${c.title}. ${c.oneLine} ${isSuggested ? "Suggested." : ""} Select this plan.`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                                  {c.title}
                                </div>
                                <div className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                  {c.subtitle}
                                </div>
                                {isSuggested && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setSuggestedPlanWhyOpen((v) => !v);
                                    }}
                                    className={`
                                      mt-2 inline-flex items-center text-xs sm:text-sm font-medium underline underline-offset-4
                                      ${isDarkMode ? 'text-slate-200 hover:text-slate-100' : 'text-slate-700 hover:text-slate-900'}
                                    `}
                                    aria-expanded={suggestedPlanWhyOpen}
                                  >
                                    Why this plan?
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPlanInfoOpen((prev) => ({ ...prev, [c.key]: !prev[c.key] }));
                                  }}
                                  className={`
                                    mt-2 inline-flex items-center text-xs sm:text-sm font-medium underline underline-offset-4
                                    ${isDarkMode ? 'text-slate-200 hover:text-slate-100' : 'text-slate-700 hover:text-slate-900'}
                                  `}
                                  aria-expanded={isOpen}
                                  aria-controls={`plan-explainer-${c.key}`}
                                >
                                  {isOpen ? "Hide" : "What is this?"}
                                </button>
                              </div>
                              {isSuggested && (
                                <span
                                  className={`
                                    inline-flex items-center rounded-full px-2 py-1 text-[10px] sm:text-xs font-semibold
                                    ${isDarkMode
                                      ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }
                                  `}
                                >
                                  Suggested
                                </span>
                              )}
                            </div>

                            <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                              {c.oneLine}
                            </div>

                            <ul className={`mt-3 space-y-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                              {c.benefits.map((b) => (
                                <li key={b} className="flex items-start gap-2">
                                  <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                            {isOpen && (
                              <div
                                id={`plan-explainer-${c.key}`}
                                className={`
                                  mt-3 rounded-xl border px-3 py-3 text-xs sm:text-sm
                                  ${isDarkMode
                                    ? 'border-slate-700/60 bg-slate-950/35 text-slate-200'
                                    : 'border-slate-200 bg-slate-50 text-slate-800'}
                                `}
                                aria-live="polite"
                              >
                                <ul className="space-y-1.5">
                                  <li className="flex items-start gap-2">
                                    <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                                    <span>A 401(k) is a retirement savings account offered by your employer.</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                                    <span>{c.oneLine}</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                                    <span>You can change this choice later.</span>
                                  </li>
                                </ul>
                              </div>
                            )}

                            {isSuggested && suggestedPlanWhyOpen && (
                              <div
                                className={`
                                  mt-3 rounded-xl border px-3 py-3 text-xs sm:text-sm
                                  ${isDarkMode
                                    ? 'border-slate-700/60 bg-slate-950/35 text-slate-200'
                                    : 'border-slate-200 bg-slate-50 text-slate-800'}
                                `}
                                role="note"
                              >
                                <div className="font-semibold">Why this plan is suggested</div>
                                <div className="mt-1">
                                  This plan is suggested based on your current age, expected retirement timeline, and the tax rules for your retirement location.
                                </div>
                                <ul className="mt-2 space-y-1.5">
                                  <li className="flex items-start gap-2">
                                    <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                                    <span>
                                      Time to retirement: {enrollmentState.yearsToRetirement != null ? `${Math.round(enrollmentState.yearsToRetirement)} years` : "based on your timeline"}
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                                    <span>Retirement location: {enrollmentState.workCountry ?? "your location"}</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                                    <span>Company-provided plan options and defaults</span>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Context chips (UI-only): open short explanations; do not select a plan */}
                  <div className="mt-3">
                    {ContextChips({
                      ariaLabel: "Plan recommendation suggestions",
                      chips: [
                        { label: "What’s the difference?", onClick: () => setPlanDiffOpen((v) => !v) },
                        { label: "Can I change this later?", onClick: () => setPlanChangeLaterOpen((v) => !v) },
                      ],
                    })}

                    {(planDiffOpen || planChangeLaterOpen) && (
                      <div
                        className={`
                          mt-2 rounded-xl border px-3 py-3 text-sm
                          ${isDarkMode ? "border-slate-700/60 bg-slate-950/20 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-800"}
                        `}
                        role="note"
                      >
                        {planDiffOpen && (
                          <div>
                            Traditional (pay tax later) usually helps your take-home pay now. Roth (pay tax now) can help later when you withdraw. Your best choice depends on your situation and plan rules.
                          </div>
                        )}
                        {planChangeLaterOpen && (
                          <div className={planDiffOpen ? "mt-2" : ""}>
                            You can usually change your choice later. Availability and timing depend on your plan.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Money handling UI: 3 clear cards (no options embedded in chat text) */}
              {isEnrolling && enrollmentState && enrollmentState.step === 'MONEY_HANDLING' && (
                <div className="mt-3 sm:mt-4" role="group" aria-label="Money handling options">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleEnrollmentChoice('Let the system handle it', 'Let the system handle it')}
                      className={`
                        text-left rounded-2xl px-4 py-4 sm:px-5 sm:py-5 transition-all border
                        ${isDarkMode
                          ? 'bg-slate-900/70 border-indigo-400/50 ring-2 ring-indigo-400/40 hover:bg-slate-900/75'
                          : 'bg-white border-blue-300 ring-2 ring-blue-200 hover:bg-slate-50'}
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                            Let the system handle it
                          </div>
                          <div className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            Recommended for most participants
                          </div>
                        </div>
                        <span
                          className={`
                            inline-flex items-center rounded-full px-2 py-1 text-[10px] sm:text-xs font-semibold
                            ${isDarkMode
                              ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }
                          `}
                        >
                          Recommended
                        </span>
                      </div>
                      <ul className={`mt-3 space-y-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        <li className="flex items-start gap-2">
                          <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                          <span>Professionally managed portfolio</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                          <span>Adjusts as you approach retirement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                          <span>No ongoing decisions required</span>
                        </li>
                      </ul>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEnrollmentChoice('I want to choose myself', 'I want to choose my investments')}
                      className={`
                        text-left rounded-2xl px-4 py-4 sm:px-5 sm:py-5 transition-all border shadow-sm
                        ${isDarkMode
                          ? 'bg-slate-900/50 border-slate-700/60 hover:bg-slate-900/60'
                          : 'bg-white border-slate-200 hover:bg-slate-50'}
                      `}
                    >
                      <div className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                        I want to choose my investments
                      </div>
                      <ul className={`mt-3 space-y-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        <li className="flex items-start gap-2">
                          <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                          <span>Full control over fund selection</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                          <span>Customize risk and allocation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                          <span>Best for experienced investors</span>
                        </li>
                      </ul>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEnrollmentChoice('Talk to an advisor later', 'Talk to an advisor later')}
                      className={`
                        text-left rounded-2xl px-4 py-4 sm:px-5 sm:py-5 transition-all border shadow-sm
                        ${isDarkMode
                          ? 'bg-slate-900/50 border-slate-700/60 hover:bg-slate-900/60'
                          : 'bg-white border-slate-200 hover:bg-slate-50'}
                      `}
                    >
                      <div className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                        Talk to an advisor later
                      </div>
                      <ul className={`mt-3 space-y-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        <li className="flex items-start gap-2">
                          <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                          <span>Complete enrollment now</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                          <span>Review with an advisor later</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className={`mt-[3px] h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-slate-400'}`} />
                          <span>Change selections anytime</span>
                        </li>
                      </ul>
                    </button>
                  </div>

                  {/* Context chips (UI-only) */}
                  <div className="mt-3">
                    {ContextChips({
                      ariaLabel: "Money handling suggestions",
                      chips: [
                        { label: "What does system-managed mean?", onClick: () => setMoneyHandlingInfoOpen((v) => !v) },
                        { label: "Talk to an advisor later", onClick: () => handleEnrollmentChoice("Talk to an advisor later", "Talk to an advisor later") },
                      ],
                    })}
                    {moneyHandlingInfoOpen && (
                      <div
                        className={`
                          mt-2 rounded-xl border px-3 py-3 text-sm
                          ${isDarkMode ? "border-slate-700/60 bg-slate-950/20 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-800"}
                        `}
                        role="note"
                      >
                        System-managed means your investments are handled for you using the plan’s default approach. You can review and update this later. Availability depends on your plan.
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Manual investment UI: Risk → Fund selection → Allocation (must total 100%) */}
              {isEnrolling && enrollmentState && ['MANUAL_RISK', 'MANUAL_FUNDS', 'MANUAL_ALLOCATION'].includes(enrollmentState.step) && (
                <ManualInvestmentBlock
                  step={enrollmentState.step}
                  isDarkMode={isDarkMode}
                  manualRiskLevel={enrollmentState.manualRiskLevel}
                  manualSelectedFundIds={enrollmentState.manualSelectedFundIds}
                  manualAllocations={enrollmentState.manualAllocations}
                  hideFraming
                  onRiskSelect={(v) => handleEnrollmentChoice(v, v.charAt(0).toUpperCase() + v.slice(1))}
                  onFundsContinue={(ids) => handleEnrollmentChoice('funds:' + ids.join(','), `Selected ${ids.length} funds`)}
                  onAllocationContinue={(alloc) => {
                    const s = 'alloc:' + Object.entries(alloc).map(([k, v]) => `${k}:${Math.round(v)}`).join(',');
                    handleEnrollmentChoice(s, 'Allocation set to 100%');
                  }}
                />
              )}
              {/* Unified Review Summary card for Default, Manual, and Advisor (replaces text-only summary) */}
              {isEnrolling && enrollmentState && enrollmentState.step === 'REVIEW' && (
                <EnrollmentReviewSummaryCard
                  enrollmentState={enrollmentState}
                  isDarkMode={isDarkMode}
                  onConfirm={() => handleEnrollmentChoice('yes', 'Confirm')}
                  onEditRetirementAge={() => handleUserInput("edit retirement age", "chip")}
                  onEditRetirementLocation={() => handleUserInput("edit location", "chip")}
                  onEdit={() => {
                    const input = enrollmentState.investmentStrategy === 'MANUAL' ? 'customise allocation' : 'edit investment';
                    handleEnrollmentChoice(input, 'Edit selection');
                  }}
                />
              )}

              {/* Vesting guided flow: next actions as chips/buttons */}
              {vestingState && (
                <div className="mt-3 space-y-3" aria-label="Vested balance info">
                  {/* Vested balance snapshot view (UI-only) */}
                  <div
                    className={`
                      rounded-2xl border shadow-sm overflow-hidden
                      ${isDarkMode ? 'bg-slate-900/55 border-slate-700/60' : 'bg-white border-slate-200'}
                    `}
                    role="region"
                    aria-label="Vested balance snapshot"
                  >
                    <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50'} px-4 py-3 flex items-start justify-between gap-3`}>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Vested balance
                        </div>
                        <div className={`mt-0.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          The portion of your retirement account you fully own.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVestingExplainerOpen((v) => !v)}
                        className={isDarkMode
                          ? "shrink-0 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-700/60 text-slate-200 hover:bg-white/5"
                          : "shrink-0 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 text-slate-800 hover:bg-slate-50"}
                        aria-expanded={vestingExplainerOpen}
                      >
                        How does vesting work?
                      </button>
                    </div>

                    {/* Optional navigation bridges (secondary; non-blocking) */}
                    <div className="px-4 pb-4">
                      <div
                        className={`
                          rounded-xl border px-3 py-3
                          ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20' : 'border-slate-200 bg-white'}
                        `}
                        role="group"
                        aria-label="Vesting bridges"
                      >
                        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Optional:
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={startWithdrawalBridgeFromVesting}
                            className={isDarkMode
                              ? "px-4 py-2 rounded-lg text-sm font-medium bg-gray-800/60 text-gray-200 hover:bg-gray-700/60 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              : "px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-800 hover:bg-slate-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                          >
                            Can I withdraw from this?
                          </button>
                          <button
                            type="button"
                            onClick={startLoanBridgeFromVesting}
                            className={isDarkMode
                              ? "px-4 py-2 rounded-lg text-sm font-medium bg-gray-800/60 text-gray-200 hover:bg-gray-700/60 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              : "px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-800 hover:bg-slate-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                          >
                            Can I take a loan?
                          </button>
                        </div>
                        <div className={`mt-2 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Availability may depend on your plan rules and your account.
                        </div>
                      </div>
                    </div>

                    {vestingExplainerOpen && (
                      <div className="px-4 pb-4">
                        <div
                          className={`
                            rounded-xl border px-3 py-3
                            ${isDarkMode ? 'border-slate-700/60 bg-slate-950/20' : 'border-slate-200 bg-slate-50'}
                          `}
                          role="region"
                          aria-label="How vesting works"
                        >
                          <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            How vesting works
                          </div>
                          <div className={`mt-2 space-y-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            <p>Vesting determines how much of your retirement savings belongs to you.</p>
                            <p>Your contributions are always 100% vested.</p>
                            <p>Employer contributions may vest over time, based on your plan’s rules.</p>
                            <p>Once money is vested, it’s yours — even if you leave your employer.</p>
                            <div className={`mt-2 rounded-lg border px-3 py-2.5 text-sm ${isDarkMode ? 'border-slate-700/60 bg-slate-950/25 text-slate-200' : 'border-slate-200 bg-white text-slate-800'}`}>
                              <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Example</div>
                              <div className="mt-1">
                                If your total balance is $100,000 and $80,000 is vested, that means $80,000 belongs to you today.
                              </div>
                            </div>
                            <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              Vesting happens automatically — you don’t need to take any action.
                            </p>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                startWithdrawalBridgeFromVesting();
                              }}
                              className={isDarkMode
                                ? "px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                : "px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                            >
                              Can I withdraw from this?
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                startLoanBridgeFromVesting();
                              }}
                              className={isDarkMode
                                ? "px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                : "px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                            >
                              Can I take a loan?
                            </button>
                            <button
                              type="button"
                              onClick={() => setVestingExplainerOpen(false)}
                              className={isDarkMode
                                ? "px-4 py-2 rounded-lg text-sm font-medium bg-gray-800/60 text-gray-200 hover:bg-gray-700/60 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                : "px-4 py-2 rounded-lg text-sm font-medium bg-white/80 text-gray-800 hover:bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                            >
                              Hide
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Existing vesting next actions */}
                  <div
                    className={isDarkMode ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2"}
                    role="group"
                    aria-label="Vesting next actions"
                  >
                    <button
                      type="button"
                    onClick={() => handleUserInput("View vesting schedule", "chip")}
                      className={isDarkMode
                        ? "px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        : "px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                    >
                      View vesting schedule
                    </button>
                    <button
                      type="button"
                    onClick={() => handleUserInput("How does vesting affect withdrawals?", "chip")}
                      className={isDarkMode
                        ? "px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        : "px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                    >
                      How does vesting affect withdrawals?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVestingExplainerOpen(false);
                      handleUserInput("I want to enroll", "chip");
                      }}
                      className={isDarkMode
                        ? "px-4 py-2 rounded-lg text-sm font-medium bg-gray-800/60 text-gray-200 hover:bg-gray-700/60 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        : "px-4 py-2 rounded-lg text-sm font-medium bg-white/80 text-gray-800 hover:bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                    >
                      Go back to enrollment
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
      </BellaScreenLayout>

    </div>
  );
}


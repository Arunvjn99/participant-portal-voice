import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useTextToSpeech } from "./useTextToSpeech";
import { routeMessage, type ActiveFlowState } from "./flows/flowRouter";
import { sendCoreAIMessage } from "../../services/coreAiService";
import type { ChatMessage } from "./MessageBubble";

/* ── Enrollment context (safe import — not all pages have it) ── */
const useEnrollmentSafe = () => {
  try {
    const { useEnrollment } = require("../../enrollment/context/EnrollmentContext");
    return useEnrollment();
  } catch {
    return null;
  }
};

/* ── Props ── */
export interface CoreAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Helpers ── */
let msgCounter = 0;
const nextId = () => `msg-${++msgCounter}-${Date.now()}`;

/**
 * Welcome message with suggestion chips embedded IN the message stream.
 * No separate suggestion bar — suggestions are part of the first AI bubble.
 */
const createWelcomeMessage = (): ChatMessage => ({
  id: "welcome",
  role: "assistant",
  content: "Hi, I'm Core AI — your retirement assistant. What would you like to do?",
  timestamp: new Date(),
  suggestions: [
    "I want to enroll",
    "I want to apply for a loan",
    "How much can I withdraw?",
    "Check my vested balance",
  ],
});

/* ── Component ── */
export function CoreAssistantModal({ isOpen, onClose }: CoreAssistantModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const enrollment = useEnrollmentSafe();

  /* ── State ── */
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const flowStateRef = useRef<ActiveFlowState | null>(null);
  const prevOpenRef = useRef(false);

  /* ── Core message handler (defined early so speech hook can reference it) ── */
  const handleSendRef = useRef<(text: string) => void>(() => {});
  const isLoadingRef = useRef(false);

  /* ── Hooks ── */
  const tts = useTextToSpeech();
  const speech = useSpeechRecognition({
    onResult: (transcript: string) => {
      handleSendRef.current(transcript);
    },
  });

  /* ── User context for general AI fallback ── */
  const userContext = {
    isEnrolled: enrollment?.state?.selectedPlan != null,
    isInEnrollmentFlow: location.pathname.startsWith("/enrollment"),
    isPostEnrollment: location.pathname.startsWith("/dashboard/post-enrollment"),
    currentRoute: location.pathname,
    selectedPlan: enrollment?.state?.selectedPlan || null,
    contributionAmount: enrollment?.state?.contributionAmount || 0,
  };

  /* ── Reset when modal opens (detect false→true transition) ── */
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isOpen;

    if (isOpen && !wasOpen) {
      /* Fresh open — reset everything */
      setMessages([createWelcomeMessage()]);
      setIsLoading(false);
      isLoadingRef.current = false;
      flowStateRef.current = null;
      tts.stop();
    } else if (!isOpen && wasOpen) {
      /* Closing — stop any active audio/recording */
      speech.stopListening();
      tts.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ── Escape to close ── */
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  /* ── Lock body scroll ── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* ── Core message handler ── */
  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoadingRef.current) return;

      /* 1. Add user message */
      const userMsg: ChatMessage = {
        id: nextId(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      /* Clear suggestions from the last assistant message (they've been acted on) */
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.suggestions ? { ...m, suggestions: undefined } : m
        );
        return [...updated, userMsg];
      });

      setIsLoading(true);
      isLoadingRef.current = true;

      /* Brief delay for "thinking" UX */
      await new Promise((r) => setTimeout(r, 400));

      /* 2. Try scripted flow router first */
      const flowResult = routeMessage(trimmed, flowStateRef.current, (interactiveText: string) => {
        /* Callback for interactive components — feeds selection back into handleSend */
        handleSendRef.current(interactiveText);
      });

      if (flowResult) {
        /* Scripted flow handled it */
        flowStateRef.current = flowResult.flowState;
        setMessages((prev) => [...prev, ...flowResult.messages]);
        setIsLoading(false);
        isLoadingRef.current = false;
        return;
      }

      /* 3. No scripted flow matched → call Core AI backend (Gemini) */
      try {
        const aiResponse = await sendCoreAIMessage(trimmed, {
          isEnrolled: userContext.isEnrolled,
          isInEnrollmentFlow: userContext.isInEnrollmentFlow,
          isPostEnrollment: userContext.isPostEnrollment,
          currentRoute: userContext.currentRoute,
          selectedPlan: userContext.selectedPlan,
          contributionAmount: userContext.contributionAmount,
        });

        const assistantMsg: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: aiResponse.reply,
          timestamp: new Date(),
          disclaimer: aiResponse.isFallback
            ? undefined
            : "Powered by Core AI. Verify with your plan administrator.",
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: "I'm having trouble right now. Please try again in a moment.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userContext]
  );

  /* Keep ref in sync so the speech hook always calls the latest handleSend */
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  /* ── Handle action button navigation ── */
  const handleAction = useCallback(
    (route: string) => {
      navigate(route);
      onClose();
    },
    [navigate, onClose]
  );

  /* ── Mic click (toggle) ── */
  const handleMicClick = useCallback(() => {
    if (speech.isListening) {
      speech.stopListening();
    } else {
      speech.startListening();
    }
  }, [speech]);

  /* ── Play message audio ── */
  const handlePlay = useCallback(
    (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;
      tts.speak(messageId, msg.content);
    },
    [messages, tts]
  );

  /* ── Suggestion chip click (same handler as typing — goes through flow router) ── */
  const handleSuggestion = useCallback(
    (text: string) => {
      handleSend(text);
    },
    [handleSend]
  );

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center">
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* ── Modal ── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-[#0f172a] text-white shadow-2xl w-full sm:w-[min(640px,calc(100vw-2rem))] md:w-[min(720px,calc(100vw-2rem))] h-[calc(100dvh-1rem)] sm:h-[min(620px,calc(100dvh-3rem))]"
            role="dialog"
            aria-modal="true"
            aria-label="Core AI Assistant"
          >
            {/* ── Header ── */}
            <div className="shrink-0 flex items-center justify-between gap-3 border-b border-slate-700/60 px-5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-600/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-white truncate">Core AI</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                    <span className="text-[11px] text-slate-400">
                      {flowStateRef.current
                        ? `${flowStateRef.current.type.charAt(0).toUpperCase() + flowStateRef.current.type.slice(1)} flow`
                        : "Online"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="Close assistant"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ── Messages (suggestions are inside the message stream) ── */}
            <MessageList
              messages={messages}
              speakingId={tts.speakingId}
              isLoading={isLoading}
              onPlay={handlePlay}
              onAction={handleAction}
              onSuggestion={handleSuggestion}
            />

            {/* ── Input (mic inside input — voice is a feature, not a mode) ── */}
            <MessageInput
              onSend={handleSend}
              isListening={speech.isListening}
              isProcessing={speech.isProcessing}
              onMicClick={handleMicClick}
              disabled={isLoading}
            />

            {/* ── Footer ── */}
            <div className="shrink-0 border-t border-slate-700/60 px-5 py-2">
              <p className="text-[10px] text-slate-500 text-center">
                Core AI can make mistakes. Verify important information with your plan administrator.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

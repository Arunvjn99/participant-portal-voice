import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageActions } from "./MessageActions";

/**
 * MessageBubble — Renders a single chat message.
 *
 * Supports two types:
 *  - "text" (default): Standard chat bubble with text content, actions, suggestions
 *  - "component": Renders a ReactNode inline in the conversation stream (cards, sliders, etc.)
 *
 * Component messages get the assistant avatar + name but NO text card, NO message actions.
 * This creates a hybrid chat + guided workflow feel.
 */

export interface ChatAction {
  label: string;
  route: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  /** Message display type: "text" for standard bubbles, "component" for interactive blocks */
  type?: "text" | "component";
  content: string;
  timestamp: Date;
  dataSnippet?: string;
  disclaimer?: string;
  primaryAction?: ChatAction;
  secondaryAction?: ChatAction;
  /** Suggestion chips rendered below this message. Clicking sends the text as a user message. */
  suggestions?: string[];
  /** React component rendered instead of text when type === "component" */
  component?: ReactNode;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  speakingId: string | null;
  onPlay: (messageId: string) => void;
  onAction: (route: string) => void;
  /** When a suggestion chip is clicked, inject that text as a user message */
  onSuggestion?: (text: string) => void;
}

export function MessageBubble({ message, speakingId, onPlay, onAction, onSuggestion }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isComponent = message.type === "component";
  const isSpeaking = speakingId === message.id;
  const reduced = useReducedMotion();

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] ${
          isUser
            ? "rounded-2xl rounded-br-md bg-teal-600 px-4 py-2.5 text-white"
            : "space-y-1 w-full max-w-[85%] sm:max-w-[80%]"
        }`}
      >
        {/* ── User bubble ── */}
        {isUser && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}

        {/* ── Assistant: Component block ── */}
        {!isUser && isComponent && (
          <>
            {/* Avatar + name */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Core AI</span>
            </div>

            {/* Component content — animated mount */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {message.component}
            </motion.div>

            {/* No MessageActions for component blocks — not text-copyable */}
          </>
        )}

        {/* ── Assistant: Text bubble ── */}
        {!isUser && !isComponent && (
          <>
            {/* Avatar + name */}
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Core AI</span>
            </div>

            {/* Message card */}
            <div className="rounded-2xl rounded-tl-md bg-slate-800/70 border border-slate-700/50 px-4 py-3">
              {/* Data snippet */}
              {message.dataSnippet && (
                <p className="text-sm font-semibold text-emerald-400 mb-1">
                  {message.dataSnippet}
                </p>
              )}

              {/* Main content */}
              <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                {message.content}
              </p>

              {/* Disclaimer */}
              {message.disclaimer && (
                <p className="mt-2 text-[11px] italic text-slate-500">
                  {message.disclaimer}
                </p>
              )}

              {/* Route action buttons (navigate to page) */}
              {(message.primaryAction || message.secondaryAction) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.primaryAction && (
                    <button
                      type="button"
                      onClick={() => onAction(message.primaryAction!.route)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-500 transition-colors"
                    >
                      {message.primaryAction.label}
                    </button>
                  )}
                  {message.secondaryAction && (
                    <button
                      type="button"
                      onClick={() => onAction(message.secondaryAction!.route)}
                      className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
                    >
                      {message.secondaryAction.label}
                    </button>
                  )}
                </div>
              )}

              {/* Suggestion chips (inline in conversation, act as quick replies) */}
              {message.suggestions && message.suggestions.length > 0 && onSuggestion && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-700/40">
                  {message.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onSuggestion(s)}
                      className="rounded-lg bg-slate-700/60 border border-slate-600/50 px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Per-message actions (copy, thumbs, play) — only for text messages */}
            <MessageActions
              messageId={message.id}
              text={message.content}
              isSpeaking={isSpeaking}
              onPlay={onPlay}
            />
          </>
        )}
      </div>
    </div>
  );
}

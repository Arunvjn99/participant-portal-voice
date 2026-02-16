import { useRef, useEffect } from "react";
import { MessageBubble, type ChatMessage } from "./MessageBubble";

/**
 * MessageList — Scrollable container for all chat messages.
 *
 * Responsibilities:
 *  - Renders messages via MessageBubble
 *  - Smooth auto-scroll on new messages
 *  - No logic — purely presentational
 */

export interface MessageListProps {
  messages: ChatMessage[];
  speakingId: string | null;
  isLoading: boolean;
  onPlay: (messageId: string) => void;
  onAction: (route: string) => void;
  onSuggestion: (text: string) => void;
}

export function MessageList({ messages, speakingId, isLoading, onPlay, onAction, onSuggestion }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to bottom when messages change or loading state changes */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth"
      role="log"
      aria-label="Conversation"
      aria-live="polite"
    >
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          speakingId={speakingId}
          onPlay={onPlay}
          onAction={onAction}
          onSuggestion={onSuggestion}
        />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-slate-800/70 border border-slate-700/50 px-4 py-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-slate-500 animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-slate-500 animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-xs text-slate-400">Thinking...</span>
          </div>
        </div>
      )}

      <div ref={endRef} aria-hidden />
    </div>
  );
}

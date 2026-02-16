import { useState } from "react";

/**
 * MessageActions — Per-message action bar rendered below each AI message.
 *
 * Actions:
 *  - Copy text to clipboard
 *  - Thumbs up (feedback)
 *  - Thumbs down (feedback)
 *  - Play / stop audio (manual TTS trigger)
 *
 * No direct TTS logic here — onPlay callback delegates to parent.
 */

export interface MessageActionsProps {
  messageId: string;
  text: string;
  isSpeaking: boolean;
  onPlay: (messageId: string) => void;
}

export function MessageActions({ messageId, text, isSpeaking, onPlay }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard not available */
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1.5" role="group" aria-label="Message actions">
      {/* Copy */}
      <button
        type="button"
        onClick={handleCopy}
        className={`p-1.5 rounded-md transition-colors ${
          copied
            ? "text-emerald-400"
            : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
        }`}
        aria-label={copied ? "Copied" : "Copy message"}
        title={copied ? "Copied!" : "Copy"}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>

      {/* Thumbs up */}
      <button
        type="button"
        onClick={() => setFeedback(feedback === "up" ? null : "up")}
        className={`p-1.5 rounded-md transition-colors ${
          feedback === "up"
            ? "text-emerald-400"
            : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
        }`}
        aria-label="Helpful"
        title="Helpful"
        aria-pressed={feedback === "up"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={feedback === "up" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </button>

      {/* Thumbs down */}
      <button
        type="button"
        onClick={() => setFeedback(feedback === "down" ? null : "down")}
        className={`p-1.5 rounded-md transition-colors ${
          feedback === "down"
            ? "text-red-400"
            : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
        }`}
        aria-label="Not helpful"
        title="Not helpful"
        aria-pressed={feedback === "down"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={feedback === "down" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
      </button>

      {/* Play / Stop audio */}
      <button
        type="button"
        onClick={() => onPlay(messageId)}
        className={`p-1.5 rounded-md transition-colors ${
          isSpeaking
            ? "text-teal-400 bg-teal-400/10"
            : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
        }`}
        aria-label={isSpeaking ? "Stop audio" : "Play audio"}
        title={isSpeaking ? "Stop" : "Play"}
      >
        {isSpeaking ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
    </div>
  );
}

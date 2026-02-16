import { useState, useRef, useCallback } from "react";

/**
 * MessageInput — Input bar with integrated mic button.
 *
 * Voice is NOT a mode. Voice is a feature inside this input.
 *
 * Behavior:
 *  - Type text + press Enter or click Send
 *  - Click mic → toggles speech recognition
 *  - While listening: glowing pulse, placeholder says "Listening..."
 *  - Processing: spinner icon, placeholder says "Processing..."
 *  - On final result → hook calls onResult → handleSend directly (no useEffects)
 *  - Click mic again to cancel listening
 *
 * The transcript is submitted directly by the useSpeechRecognition hook's
 * onResult callback — NO useEffect chains, NO interim text, NO duplication.
 */

export interface MessageInputProps {
  onSend: (text: string) => void;
  isListening: boolean;
  isProcessing: boolean;
  onMicClick: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  isListening,
  isProcessing,
  onMicClick,
  disabled,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = value.trim();
      if (!text || disabled) return;
      onSend(text);
      setValue("");
      inputRef.current?.focus();
    },
    [value, disabled, onSend]
  );

  /* Derive placeholder from mic state */
  const placeholder = isListening
    ? "Listening..."
    : isProcessing
      ? "Processing speech..."
      : "Ask anything about your retirement plan...";

  /* Mic is busy if listening or processing */
  const micBusy = isListening || isProcessing;

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-slate-700/60 px-4 py-3 sm:px-5"
    >
      <div className="flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700/50 pl-2 pr-1 focus-within:border-teal-500/50 transition-colors">
        {/* Mic button — inside input */}
        <button
          type="button"
          onClick={onMicClick}
          disabled={disabled || isProcessing}
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
            isListening
              ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
              : isProcessing
                ? "bg-amber-500/80 text-white"
                : "text-slate-400 hover:text-teal-400 hover:bg-slate-700"
          }`}
          aria-label={
            isListening
              ? "Stop recording"
              : isProcessing
                ? "Processing speech"
                : "Start recording"
          }
          title={
            isListening
              ? "Stop recording"
              : isProcessing
                ? "Processing..."
                : "Voice input"
          }
        >
          {/* Pulse ring when listening */}
          {isListening && (
            <span className="absolute inset-0 rounded-full animate-ping bg-red-500/30" />
          )}

          {/* Processing spinner */}
          {isProcessing ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10 animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            /* Mic icon */
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || micBusy}
          className="flex-1 bg-transparent py-2.5 text-sm text-white placeholder-slate-500 outline-none min-w-0 disabled:opacity-50"
          aria-label="Message input"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!value.trim() || disabled || micBusy}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white transition-all hover:bg-teal-500 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Send message"
          title="Send"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* Speech status */}
      {isListening && (
        <p className="mt-1.5 text-center text-[11px] text-red-400/80 animate-pulse">
          Recording... click mic to stop
        </p>
      )}
      {isProcessing && (
        <p className="mt-1.5 text-center text-[11px] text-amber-400/80">
          Processing your speech...
        </p>
      )}
    </form>
  );
}

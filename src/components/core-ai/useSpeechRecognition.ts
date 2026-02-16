import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useSpeechRecognition — Speech-to-text for CoreAssistantModal input.
 *
 * Rules (prevents duplication):
 *  - interimResults = false  → only final transcripts
 *  - continuous = false       → one utterance per session
 *  - Single event.results[0][0].transcript — no looping, no resultIndex
 *  - isListeningRef guard    → prevents double submission
 *  - No auto-restart in onend
 *  - onResult callback fires ONCE with the final transcript, then stops
 *
 * States:
 *  - Idle:       not listening, not processing
 *  - Listening:  mic active, waiting for speech
 *  - Processing: speech ended, waiting for final result
 */

/* Browser compat */
const getSpeechRecognition = (): (new () => SpeechRecognition) | null => {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ??
    (window as any).webkitSpeechRecognition ??
    null
  );
};

export interface UseSpeechRecognitionOptions {
  /** Called exactly once with the final transcript. The hook auto-stops after this. */
  onResult: (transcript: string) => void;
}

export interface UseSpeechRecognitionReturn {
  /** Mic is active and listening for speech */
  isListening: boolean;
  /** Speech captured, waiting for final result processing */
  isProcessing: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  isSupported: boolean;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const onResultRef = useRef(options.onResult);
  const isSupported =
    typeof window !== "undefined" && getSpeechRecognition() !== null;

  /* Keep callback ref fresh without re-creating recognition */
  useEffect(() => {
    onResultRef.current = options.onResult;
  }, [options.onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
    setIsListening(false);
    setIsProcessing(false);
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setIsProcessing(false);

    const SRConstructor = getSpeechRecognition();
    if (!SRConstructor) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    /* Stop any existing session first */
    if (recognitionRef.current) {
      stopListening();
    }

    const recognition = new SRConstructor();

    /* ── Critical: final results only, one utterance ── */
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    /* ── Single final result → one send → one stop ── */
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      /* Guard: if we already stopped, ignore stale events */
      if (!isListeningRef.current) return;

      const transcript = event.results[0][0].transcript.trim();

      if (!transcript) return;

      /* Mark as done BEFORE calling onResult to prevent double submission */
      isListeningRef.current = false;
      setIsListening(false);
      setIsProcessing(false);

      /* Fire callback exactly once */
      onResultRef.current(transcript);

      /* Stop recognition (may already be stopped since continuous=false) */
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        /* Benign — user stopped or silence timeout */
      } else if (event.error === "not-allowed") {
        setError(
          "Microphone access denied. Please allow microphone permissions."
        );
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      isListeningRef.current = false;
      setIsListening(false);
      setIsProcessing(false);
      recognitionRef.current = null;
    };

    /* ── No auto-restart. Just clean up. ── */
    recognition.onend = () => {
      recognitionRef.current = null;
      /* If we're still marked as listening, it means speech ended
         but onresult hasn't fired yet (or fired synchronously).
         Transition to processing state briefly. */
      if (isListeningRef.current) {
        setIsListening(false);
        setIsProcessing(true);
        /* Safety timeout — if no result arrives within 2s, reset */
        setTimeout(() => {
          if (isListeningRef.current) {
            isListeningRef.current = false;
            setIsProcessing(false);
          }
        }, 2000);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      isListeningRef.current = true;
      setIsListening(true);
    } catch {
      setError("Could not start speech recognition. Please try again.");
      isListeningRef.current = false;
      recognitionRef.current = null;
    }
  }, [stopListening]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* noop */
        }
        recognitionRef.current = null;
      }
      isListeningRef.current = false;
    };
  }, []);

  return {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    error,
    isSupported,
  };
}

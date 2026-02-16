import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useTextToSpeech — Encapsulates browser SpeechSynthesis for manual playback.
 *
 * Rules:
 *  - NEVER auto-speaks. Only triggered from MessageActions play button.
 *  - Only one message plays at a time.
 *  - Clicking play on another message stops the current one.
 *
 * Returns: { isSpeaking, speakingId, speak, stop }
 */

export interface UseTextToSpeechReturn {
  /** Whether any message is currently being spoken */
  isSpeaking: boolean;
  /** The ID of the message currently being spoken, or null */
  speakingId: string | null;
  /** Speak a message — pass message id + text */
  speak: (id: string, text: string) => void;
  /** Stop any current playback */
  stop: () => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string) => {
      if (!("speechSynthesis" in window)) return;

      /* If the same message is already playing, toggle off */
      if (speakingId === id) {
        stop();
        return;
      }

      /* Stop any current playback first */
      stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = "en-US";

      /* Try to pick a natural-sounding English voice */
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("samantha")
      );
      const fallback = voices.find((v) => v.lang.startsWith("en"));
      if (preferred) utterance.voice = preferred;
      else if (fallback) utterance.voice = fallback;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingId(id);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
        utteranceRef.current = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingId(null);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [speakingId, stop]
  );

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  return { isSpeaking, speakingId, speak, stop };
}

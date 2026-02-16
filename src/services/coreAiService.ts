/**
 * Core AI Service — Frontend client for the scoped retirement assistant.
 *
 * Calls the backend proxy which handles Gemini API.
 * Never exposes API keys to the frontend.
 * Falls back to the local mock system when the backend is unreachable.
 */

import { getResponseForQuery } from "../utils/aiIntentDetection";
import type { UserContext } from "../utils/aiIntentDetection";

export interface CoreAIRequest {
  message: string;
  context: {
    age?: number;
    salary?: number;
    selectedPlan?: string | null;
    risk?: string;
    isEnrolled?: boolean;
    isInEnrollmentFlow?: boolean;
    isPostEnrollment?: boolean;
    currentRoute?: string;
    contributionAmount?: number;
  };
}

export interface CoreAIResponse {
  reply: string;
  filtered: boolean;
  /** True when the response came from the local fallback, not Gemini */
  isFallback: boolean;
}

/**
 * Send a user message to the Core AI backend.
 *
 * If the backend is unavailable (e.g. in local dev without server running),
 * falls back to the local mock intent detection system seamlessly.
 */
export async function sendCoreAIMessage(
  message: string,
  context: CoreAIRequest["context"]
): Promise<CoreAIResponse> {
  try {
    const response = await fetch("/api/core-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      reply: data.reply,
      filtered: data.filtered || false,
      isFallback: false,
    };
  } catch (error) {
    /* Backend unreachable — fall back to local mock system */
    console.warn("Core AI backend unavailable, using local fallback:", (error as Error).message);

    const localContext: UserContext = {
      isEnrolled: context.isEnrolled ?? false,
      isInEnrollmentFlow: context.isInEnrollmentFlow ?? false,
      isPostEnrollment: context.isPostEnrollment ?? false,
      currentRoute: context.currentRoute ?? "/",
      selectedPlan: context.selectedPlan ?? null,
      contributionAmount: context.contributionAmount ?? 0,
    };

    const localResponse = getResponseForQuery(message, localContext);

    return {
      reply: localResponse.answer,
      filtered: false,
      isFallback: true,
    };
  }
}

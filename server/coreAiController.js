/**
 * Core AI Controller — Scoped retirement assistant with Gemini backend.
 *
 * Hard scope boundaries:
 *  - Dashboard overview, retirement plans, contributions, investments
 *  - Beneficiaries, transactions, enrollment flow
 *
 * NOT a general AI chatbot. Rejects out-of-scope questions.
 */

import { model } from "./geminiClient.js";

/* ── System prompt: strict scope ── */
const SYSTEM_PROMPT = `You are Core AI, a retirement plan assistant inside a financial dashboard.

You ONLY answer questions related to:
- Retirement plans (Roth 401(k), Traditional 401(k), After-tax)
- Contributions (how much to contribute, paycheck impact, auto increase, tax impact)
- Investment allocations (fund selection, risk levels, rebalancing)
- Employer match (match formula, vesting schedule, maximizing match)
- Dashboard metrics (account balance, projected retirement value, on-track status)
- Account balance and vested balance
- Retirement projections and compound growth
- Withdrawal rules and eligibility
- Loan info within retirement plan context
- Beneficiary designations
- Transaction history within the plan
- Enrollment flow guidance

If a question is unrelated to retirement planning or dashboard features, politely decline and say:
"I can help with your retirement plan, contributions, investments, or dashboard details. For other requests, please contact support."

Rules:
- Never provide legal advice, medical advice, political opinions, or general knowledge outside the product.
- Keep responses concise (2-4 sentences), clear, and professional.
- Do not fabricate data. Use provided user context when available.
- If user context includes specific numbers (balance, contribution rate), reference them naturally.
- Always be encouraging about retirement savings.
- If the user asks about a specific plan feature, explain it simply.`;

/* ── Intent guard: pre-filter before Gemini call ── */
const ALLOWED_TOPICS = [
  "plan",
  "roth",
  "traditional",
  "401k",
  "401(k)",
  "contribution",
  "invest",
  "allocation",
  "fund",
  "balance",
  "retirement",
  "retire",
  "match",
  "employer",
  "dashboard",
  "account",
  "vesting",
  "vested",
  "withdrawal",
  "withdraw",
  "loan",
  "beneficiary",
  "transaction",
  "enrollment",
  "enroll",
  "paycheck",
  "salary",
  "tax",
  "rmd",
  "projection",
  "compound",
  "growth",
  "risk",
  "conservative",
  "moderate",
  "aggressive",
  "rebalance",
  "rollover",
  "distribution",
  "hardship",
  "catch-up",
  "limit",
  "maximum",
  "auto increase",
  "target date",
  "index fund",
  "expense ratio",
  "fee",
  "performance",
  "return",
  "diversif",
  "portfolio",
  "age",
  "how much",
  "overview",
  "summary",
  "status",
  "payroll",
  "percent",
  "rate of return",
  "annuity",
  "ira",
  "pension",
  "social security",
  "fiduciary",
  "401a",
  "403b",
  "457",
  "qdro",
  "saver",
  "saving",
];

/* ── Greeting detection (allow friendly greetings without topic keywords) ── */
const GREETING_PATTERNS = [
  /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|what's up|sup)\b/i,
  /^(thanks|thank you|ok|okay|got it|sure|yes|no|please)\b/i,
];

function isAllowedTopic(message) {
  const lower = message.toLowerCase();

  /* Allow greetings */
  if (GREETING_PATTERNS.some((p) => p.test(lower))) {
    return true;
  }

  /* Check for allowed topic keywords */
  return ALLOWED_TOPICS.some((topic) => lower.includes(topic));
}

/* ── Out-of-scope response ── */
const OUT_OF_SCOPE_RESPONSE =
  "I can help with your retirement plan, contributions, investments, or dashboard details. For other requests, please contact support.";

/* ── Generate reply via Gemini ── */
export async function generateCoreReply(userMessage, userContext) {
  /* 1. Intent guard — reject before calling Gemini */
  if (!isAllowedTopic(userMessage)) {
    return {
      reply: OUT_OF_SCOPE_RESPONSE,
      filtered: true,
    };
  }

  /* 2. If Gemini model not available, return graceful fallback */
  if (!model) {
    return {
      reply: "I'm currently unable to process your request. Please try again later or contact support.",
      error: "Gemini model not initialized",
    };
  }

  /* 3. Build prompt with user context */
  const contextBlock = userContext
    ? `\nUser context:\n${JSON.stringify(userContext, null, 2)}\n`
    : "";

  const fullPrompt = `${SYSTEM_PROMPT}
${contextBlock}
User question:
${userMessage}`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      reply: text.trim(),
      filtered: false,
    };
  } catch (error) {
    console.error("Gemini API error:", error.message);

    /* Rate-limit / quota error — give user a clear message */
    if (error.status === 429 || error.message?.includes("429")) {
      return {
        reply: "I'm receiving a lot of questions right now. Please wait a moment and try again.",
        error: "rate_limited",
      };
    }

    return {
      reply: "I'm having trouble right now. Please try again in a moment.",
      error: error.message,
    };
  }
}

export { isAllowedTopic };

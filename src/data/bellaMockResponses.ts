/**
 * Core AI search — mock responses for common retirement-related queries.
 * Keyword matching for fallback when intent detection returns unknown.
 */

export interface MockResponse {
  answer: string;
  primaryAction?: { label: string; route: string };
  secondaryAction?: { label: string; route: string };
}

/** Mock keyword → response map. First match wins. */
export const BELLA_MOCK_RESPONSES: { keywords: string[]; response: MockResponse }[] = [
  {
    keywords: ["balance", "how much", "total", "account value"],
    response: {
      answer:
        "Based on your account, your total balance is $234,992 with a +12.4% YTD return. You can view the full breakdown on your dashboard.",
      primaryAction: { label: "View Dashboard", route: "/dashboard/post-enrollment" },
      secondaryAction: { label: "View Statements", route: "/transactions" },
    },
  },
  {
    keywords: ["401k", "401(k)", "retirement plan", "plan"],
    response: {
      answer:
        "You're enrolled in the TechVantage 401(k) Retirement Plan. Your plan offers employer matching and a 90% fit score for your goals.",
      primaryAction: { label: "View Plan Details", route: "/enrollment/plans" },
      secondaryAction: { label: "Manage Investments", route: "/enrollment/investments" },
    },
  },
  {
    keywords: ["match", "employer match", "company match"],
    response: {
      answer:
        "Your employer matches 50% of contributions up to 6% of your salary. That’s free money—maximizing your contribution up to the match is usually a good idea.",
      primaryAction: { label: "Adjust Contribution", route: "/enrollment/contribution" },
    },
  },
  {
    keywords: ["vesting", "vested", "when vest"],
    response: {
      answer:
        "Employer contributions typically vest over time. Check your plan details for your vesting schedule. Most plans use a 3–5 year cliff or graded vesting.",
      primaryAction: { label: "View Plan", route: "/enrollment/plans" },
    },
  },
  {
    keywords: ["withdraw", "withdrawal", "cash out", "take money"],
    response: {
      answer:
        "Withdrawals before age 59½ may be subject to taxes and penalties. You can request a withdrawal or hardship distribution from your account—check eligibility in your plan.",
      primaryAction: { label: "View Transactions", route: "/transactions" },
    },
  },
  {
    keywords: ["rollover", "transfer", "move money"],
    response: {
      answer:
        "You have $207,992 eligible for rollover from previous employers. A rollover can consolidate your retirement savings. Start the process from your dashboard.",
      primaryAction: { label: "Start Rollover", route: "/transactions/rollover/start" },
    },
  },
  {
    keywords: ["rebalance", "reallocate", "change allocation"],
    response: {
      answer:
        "Rebalancing keeps your portfolio aligned with your target allocation. You can rebalance anytime from your investment settings.",
      primaryAction: { label: "Rebalance Portfolio", route: "/transactions/rebalance/start" },
    },
  },
  {
    keywords: ["help", "support", "contact", "advisor"],
    response: {
      answer:
        "Our advisors are here to help. You can schedule a consultation or visit the Help Center for FAQs and guides.",
      primaryAction: { label: "Schedule Consultation", route: "/investments" },
      secondaryAction: { label: "Help Center", route: "/help" },
    },
  },
  {
    keywords: ["hello", "hi", "hey"],
    response: {
      answer:
        "Hi! I'm Core AI, your retirement assistant. Ask me about contributions, investments, your balance, or how to get started.",
      primaryAction: { label: "Start Enrollment", route: "/enrollment" },
    },
  },
  {
    keywords: ["salary", "income", "pay", "paycheck"],
    response: {
      answer:
        "Your contribution is a percentage of your salary. Many experts suggest saving 10–15% for retirement. Employer matching can help you reach that faster.",
      primaryAction: { label: "Set Contribution", route: "/enrollment/contribution" },
    },
  },
  {
    keywords: ["statement", "documents", "tax form", "1099"],
    response: {
      answer:
        "Your account statements and tax documents are available in the Transactions hub. You can view or download them anytime.",
      primaryAction: { label: "View Statements", route: "/transactions" },
    },
  },
];

/**
 * Find a mock response for a query. Returns null if no match.
 */
export function getMockResponseForQuery(query: string): MockResponse | null {
  const lower = query.toLowerCase().trim();
  if (!lower) return null;

  for (const { keywords, response } of BELLA_MOCK_RESPONSES) {
    const hasMatch = keywords.some((k) => lower.includes(k.toLowerCase()));
    if (hasMatch) return response;
  }
  return null;
}

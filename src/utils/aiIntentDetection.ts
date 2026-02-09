/**
 * AI Intent Detection and Response Generation
 * Mocked AI logic for search, Q&A, and action launching
 */

import { getMockResponseForQuery } from "../data/bellaMockResponses";

export type UserIntent =
  | "explain_retirement_plans"
  | "calculate_contributions"
  | "benefits_starting_early"
  | "search_contribution"
  | "search_investment"
  | "search_beneficiary"
  | "search_transaction"
  | "search_profile"
  | "question_contribution"
  | "question_investment"
  | "question_beneficiary"
  | "action_change_contribution"
  | "action_change_investment"
  | "action_update_beneficiary"
  | "action_view_transaction"
  | "unknown";

export interface AIResponse {
  answer: string;
  dataSnippet?: string;
  primaryAction?: {
    label: string;
    route: string;
  };
  secondaryAction?: {
    label: string;
    route: string;
  };
  disclaimer?: string;
}

export interface UserContext {
  isEnrolled: boolean;
  isInEnrollmentFlow: boolean;
  isPostEnrollment: boolean;
  currentRoute: string;
  selectedPlan: string | null;
  contributionAmount: number;
}

/**
 * Detect user intent from query
 */
/** Suggestion queries from Core AI search bar - same intent when typed or clicked */
const SUGGESTION_MATCHES: { pattern: RegExp | string; intent: UserIntent }[] = [
  {
    pattern: /explain\s+retirement\s+plan/i,
    intent: "explain_retirement_plans",
  },
  {
    pattern: /calculate\s+contribution/i,
    intent: "calculate_contributions",
  },
  {
    pattern: /benefits?\s+of\s+starting\s+early|starting\s+early/i,
    intent: "benefits_starting_early",
  },
];

export const detectIntent = (query: string, context: UserContext): UserIntent => {
  const lowerQuery = query.toLowerCase();

  // Match suggestion queries first - same answer when typed vs clicked
  for (const { pattern, intent } of SUGGESTION_MATCHES) {
    if (typeof pattern === "string" ? lowerQuery.includes(pattern) : pattern.test(query)) {
      return intent;
    }
  }

  // Action intents
  if (
    lowerQuery.includes("change") ||
    lowerQuery.includes("update") ||
    lowerQuery.includes("edit") ||
    lowerQuery.includes("modify")
  ) {
    if (lowerQuery.includes("contribution") || lowerQuery.includes("contribute")) {
      return "action_change_contribution";
    }
    if (lowerQuery.includes("investment") || lowerQuery.includes("allocation") || lowerQuery.includes("portfolio")) {
      return "action_change_investment";
    }
    if (lowerQuery.includes("beneficiary") || lowerQuery.includes("beneficiaries")) {
      return "action_update_beneficiary";
    }
  }

  // View intents
  if (lowerQuery.includes("view") || lowerQuery.includes("show") || lowerQuery.includes("see")) {
    if (lowerQuery.includes("transaction")) {
      return "action_view_transaction";
    }
  }

  // Search intents
  if (lowerQuery.includes("contribution") || lowerQuery.includes("contribute")) {
    return lowerQuery.includes("what") || lowerQuery.includes("how") || lowerQuery.includes("?")
      ? "question_contribution"
      : "search_contribution";
  }
  if (
    lowerQuery.includes("investment") ||
    lowerQuery.includes("allocation") ||
    lowerQuery.includes("portfolio") ||
    lowerQuery.includes("fund")
  ) {
    return lowerQuery.includes("what") || lowerQuery.includes("how") || lowerQuery.includes("?")
      ? "question_investment"
      : "search_investment";
  }
  if (lowerQuery.includes("beneficiary") || lowerQuery.includes("beneficiaries")) {
    return lowerQuery.includes("what") || lowerQuery.includes("how") || lowerQuery.includes("?")
      ? "question_beneficiary"
      : "search_beneficiary";
  }
  if (lowerQuery.includes("transaction")) {
    return "search_transaction";
  }
  if (lowerQuery.includes("profile") || lowerQuery.includes("personal")) {
    return "search_profile";
  }

  return "unknown";
};

/**
 * Get AI response for a query. Uses intent detection first, then mock keyword fallback.
 */
export const getResponseForQuery = (query: string, context: UserContext): AIResponse => {
  const intent = detectIntent(query, context);
  const response = generateResponse(intent, query, context);

  // If unknown, try mock keyword matching for broader coverage
  if (intent === "unknown") {
    const mock = getMockResponseForQuery(query);
    if (mock) {
      return {
        answer: mock.answer,
        primaryAction: mock.primaryAction,
        secondaryAction: mock.secondaryAction,
      };
    }
  }

  return response;
};

/**
 * Generate AI response based on intent and context
 */
export const generateResponse = (intent: UserIntent, query: string, context: UserContext): AIResponse => {
  switch (intent) {
    case "explain_retirement_plans":
      return {
        answer:
          "Retirement plans like 401(k) and Roth 401(k) help you save for retirement with tax advantages. A 401(k) uses pre-tax money (you pay taxes when you withdraw); a Roth 401(k) uses after-tax money (qualified withdrawals are tax-free). Employer matching can boost your savings significantly.",
        primaryAction: {
          label: "Learn More",
          route: "/enrollment/plans",
        },
        secondaryAction: {
          label: "View Help Center",
          route: "/help",
        },
        disclaimer: "This is general information, not financial advice.",
      };

    case "calculate_contributions":
      return {
        answer: `Based on a typical salary, contributing ${context.contributionAmount || 5}% would mean about $${Math.round(((context.contributionAmount || 5) / 100) * 75000 / 12)} per month. You can adjust your contribution percentage anytime in your enrollment settings.`,
        primaryAction: context.isEnrolled
          ? {
              label: "Manage Contribution",
              route: "/enrollment",
            }
          : {
              label: "Set Contribution",
              route: "/enrollment/contribution",
            },
        disclaimer: "This is an estimate. Actual amounts depend on your salary and pay frequency.",
      };

    case "benefits_starting_early":
      return {
        answer:
          "Starting early means more time for compound growth. For example, $200/month at 7% from age 25 could grow to over $400,000 by 65—but starting at 35 would yield about half. Even small contributions now can make a big difference.",
        primaryAction: {
          label: "Set Up Contribution",
          route: "/enrollment/contribution",
        },
        secondaryAction: {
          label: "View Plans",
          route: "/enrollment/plans",
        },
        disclaimer: "This is illustrative. Past performance does not guarantee future results.",
      };

    case "search_contribution":
      const pct = context.contributionAmount ?? 5;
      const monthly = Math.round((pct / 100) * 75000 / 12);
      return {
        answer: `Your current contribution is ${pct}% of your salary${pct > 0 ? ` (about $${monthly}/month)` : ""}.`,
        dataSnippet: undefined,
        primaryAction: context.isEnrolled
          ? {
              label: "Manage Contribution",
              route: "/enrollment",
            }
          : {
              label: "Set Contribution",
              route: "/enrollment/contribution",
            },
        disclaimer: "This is general information, not financial advice.",
      };

    case "question_contribution":
      return {
        answer:
          "Your contribution percentage determines how much of your salary goes to your retirement plan each pay period. You can change this anytime.",
        primaryAction: context.isEnrolled
          ? {
              label: "Manage Contribution",
              route: "/enrollment",
            }
          : {
              label: "Set Contribution",
              route: "/enrollment/contribution",
            },
        disclaimer: "This is general information, not financial advice.",
      };

    case "search_investment":
    case "question_investment":
      return {
        answer: "Your investment allocation determines how your contributions are invested across different funds.",
        primaryAction: context.isInEnrollmentFlow
          ? {
              label: "View Investments",
              route: "/enrollment/investments",
            }
          : {
              label: "Manage Investments",
              route: "/enrollment/investments",
            },
        disclaimer: "This is general information, not financial advice.",
      };

    case "search_beneficiary":
    case "question_beneficiary":
      return {
        answer:
          "Beneficiaries are the people who will receive your retirement plan benefits if you pass away. You can designate primary and contingent beneficiaries.",
        primaryAction: {
          label: "Manage Beneficiaries",
          route: "/profile",
        },
        secondaryAction: {
          label: "View Profile",
          route: "/profile",
        },
        disclaimer: "This is general information, not financial advice.",
      };

    case "search_transaction":
      return {
        answer: "Your transaction history shows all contributions, withdrawals, and account activity.",
        primaryAction: {
          label: "View Transactions",
          route: "/transactions",
        },
      };

    case "search_profile":
      return {
        answer: "Your profile contains personal information, employment details, beneficiaries, and account settings.",
        primaryAction: {
          label: "View Profile",
          route: "/profile",
        },
      };

    case "action_change_contribution":
      return {
        answer: "I can help you navigate to where you can change your contribution. You'll need to confirm the change yourself.",
        primaryAction: context.isEnrolled
          ? {
              label: "Go to Enrollment Management",
              route: "/enrollment",
            }
          : {
              label: "Go to Contribution Settings",
              route: "/enrollment/contribution",
            },
        disclaimer: "All changes require your explicit confirmation.",
      };

    case "action_change_investment":
      return {
        answer: "I can help you navigate to where you can change your investment allocation. You'll need to confirm the change yourself.",
        primaryAction: {
          label: "Go to Investment Settings",
          route: "/enrollment/investments",
        },
        disclaimer: "All changes require your explicit confirmation.",
      };

    case "action_update_beneficiary":
      return {
        answer: "I can help you navigate to where you can update your beneficiaries. You'll need to confirm the changes yourself.",
        primaryAction: {
          label: "Go to Beneficiaries",
          route: "/profile",
        },
        disclaimer: "Beneficiary changes are legally binding and require your explicit confirmation.",
      };

    case "action_view_transaction":
      return {
        answer: "I'll take you to your transaction history.",
        primaryAction: {
          label: "View Transactions",
          route: "/transactions",
        },
      };

    case "unknown":
    default:
      return {
        answer:
          "I couldn't find that. Try asking about contributions, investments, beneficiaries, or transactions.",
        primaryAction: {
          label: "View Help Center",
          route: "/help",
        },
      };
  }
};

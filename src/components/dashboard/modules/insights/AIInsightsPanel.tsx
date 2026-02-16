import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { InsightCard } from "../../shared/InsightCard";
import { CARD_STYLE } from "../../core/types";
import type { ModuleProps } from "../../core/types";

const ICONS: Record<string, React.ReactNode> = {
  match: <span>💰</span>,
  roth: <span>🔄</span>,
  rebalance: <span>⚖️</span>,
  increase: <span>📈</span>,
  "loan-warning": <span>⚠️</span>,
};

/**
 * AIInsightsPanel — Dynamic personalized recommendation cards
 * with staggered entrance, hover glow, and Apply Action buttons.
 */
export const AIInsightsPanel = memo(function AIInsightsPanel({ engine }: ModuleProps) {
  const navigate = useNavigate();
  const actions = engine.recommendedActions;

  if (actions.length === 0) return null;

  const routeMap: Record<string, string> = {
    match: "/enrollment/contribution",
    roth: "/enrollment/contribution",
    rebalance: "/enrollment/investments",
    increase: "/enrollment/contribution",
    "loan-warning": "/transactions/applications/loan",
  };

  return (
    <div className="p-5" style={CARD_STYLE}>
      <div className="flex items-center gap-2 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--enroll-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
        </svg>
        <p
          className="text-xs font-bold"
          style={{ color: "var(--enroll-text-primary)" }}
        >
          AI Insights
        </p>
      </div>

      <div className="space-y-2.5">
        {actions.map((action, i) => (
          <InsightCard
            key={action.id}
            icon={ICONS[action.type] ?? <span>💡</span>}
            title={action.title}
            description={action.description}
            impact={action.impact}
            actionLabel="Apply Suggestion"
            onAction={() => navigate(routeMap[action.type] ?? "/enrollment/contribution")}
            index={i}
          />
        ))}
      </div>

      <p
        className="text-[10px] mt-3 text-center"
        style={{ color: "var(--enroll-text-muted)", opacity: 0.7 }}
      >
        Insights generated from your plan data.
      </p>
    </div>
  );
});

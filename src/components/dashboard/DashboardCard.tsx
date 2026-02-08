import type { ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
  /** @deprecated Use isSelected for plan card highlight. Badge is controlled by PlanSelectionCard. */
  isRecommended?: boolean;
  /** Selected state - ONLY ONE plan. Controls ALL visual highlight. Per Figma. */
  isSelected?: boolean;
}

/**
 * Card styling rules:
 * - isSelected=true: Single primary border, soft tint, elevated shadow. NO inner stroke.
 * - isSelected=false: Default styling (same for recommended and non-recommended).
 * - isRecommended: Does NOT affect card styling. Badge only (handled by PlanSelectionCard).
 */
export const DashboardCard = ({ children, title, action, isSelected, className }: DashboardCardProps) => {
  return (
    <article
      className={`overflow-hidden rounded-xl border p-6 md:p-8 transition-shadow duration-200 ${
        isSelected
          ? "border-[#3b82f6] bg-[rgba(59,130,246,0.04)] shadow-[0_4px_6px_-2px_rgba(0,0,0,0.1),0_6px_12px_0_rgba(0,0,0,0.08)] dark:border-blue-500 dark:bg-[rgba(59,130,246,0.08)]"
          : "border-[#ebebec] bg-white shadow-[0_2px_4px_-1px_rgba(0,0,0,0.12),0_4px_5px_0_rgba(0,0,0,0.08),0_1px_10px_0_rgba(0,0,0,0.05)] hover:shadow-[0_4px_6px_-2px_rgba(0,0,0,0.1),0_6px_10px_0_rgba(0,0,0,0.08)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/30"
      } ${className ?? ""}`}
    >
      {(title || action) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className="text-slate-700 dark:text-slate-300">{children}</div>
    </article>
  );
};

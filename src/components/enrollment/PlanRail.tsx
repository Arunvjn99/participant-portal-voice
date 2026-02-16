import * as React from "react";
import { Lock, Sparkles, CheckCircle2, Trophy } from "lucide-react";
import type { PlanOption } from "../../types/enrollment";

export interface PlanRailProps {
  plans: PlanOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Horizontal plan rail: eligibility states, best-fit highlight, smooth selection. */
export function PlanRail({ plans, selectedId, onSelect }: PlanRailProps) {
  return (
    <div className="w-full relative z-10">
      <div className="flex flex-col gap-5">
        {plans.map((plan) => (
          <HorizontalTile
            key={plan.id}
            plan={plan}
            isSelected={selectedId === plan.id}
            onSelect={() => onSelect(plan.id)}
          />
        ))}
      </div>
    </div>
  );
}

const HorizontalTile: React.FC<{
  plan: PlanOption;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ plan, isSelected, onSelect }) => {
  const isEligible = plan.isEligible !== false;
  const isRecommended = plan.isRecommended === true;
  const confidenceScore = plan.fitScore ?? 0;

  return (
    <div
      onClick={isEligible ? onSelect : undefined}
      role="button"
      tabIndex={isEligible ? 0 : -1}
      onKeyDown={(e) => {
        if (isEligible && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`
        relative w-full overflow-hidden group transition-all duration-300 ease-out
        ${!isEligible ? "opacity-60 grayscale-[0.8] cursor-not-allowed" : "cursor-pointer"}
        ${isEligible && isRecommended
          ? isSelected
            ? "scale-[1.01] z-20"
            : "z-10"
          : isEligible && isSelected
            ? "scale-[1.005] z-10"
            : isEligible
              ? "z-0"
              : ""}
      `}
      style={{
        background: !isEligible ? "var(--enroll-soft-bg)" : "var(--enroll-card-bg)",
        border: isEligible && isRecommended && isSelected
          ? "2px solid var(--enroll-brand)"
          : isEligible && isRecommended
            ? "1px solid rgb(var(--enroll-brand-rgb) / 0.2)"
            : isSelected
              ? "1px solid var(--enroll-card-border)"
              : "1px solid var(--enroll-card-border)",
        borderRadius: "var(--enroll-card-radius)",
        boxShadow: isSelected ? "var(--enroll-elevation-3)" : "var(--enroll-elevation-2)",
      }}
    >
      {/* Best-fit styling */}
      {isRecommended && isEligible && (
        <>
          <div className={`absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 pointer-events-none transition-opacity duration-500 dark:from-indigo-950/30 dark:via-slate-800 dark:to-purple-950/20 ${isSelected ? "opacity-100" : "opacity-60"}`} />
          <div className="absolute inset-0 pointer-events-none opacity-[0.4] mix-blend-multiply dark:opacity-30">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="grid-pattern-rail" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-200/50 dark:text-indigo-800/50" />
                </pattern>
                <pattern id="dot-pattern-rail" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" className="text-indigo-300/30 dark:text-indigo-700/30" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern-rail)" />
              <rect width="100%" height="100%" fill="url(#dot-pattern-rail)" />
            </svg>
          </div>
          <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-all duration-700 ${isSelected ? "opacity-100 scale-110" : "opacity-50 scale-100"}`} />
          {isSelected && (
            <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-2xl animate-pulse pointer-events-none" aria-hidden />
          )}
        </>
      )}

      <div className="relative z-10 p-6 md:p-7 flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border w-fit transition-all duration-300
                ${isRecommended && isEligible
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-500/30 dark:bg-indigo-500"
                  : !isEligible
                    ? "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-700 dark:border-slate-600"
                    : "bg-white border-slate-200 text-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"}
              `}
            >
              {isRecommended && isEligible ? <Trophy size={11} className="text-yellow-300 fill-yellow-300" /> : null}
              {isEligible ? `${confidenceScore}% Fit` : "Locked"}
            </div>
            {isRecommended && isEligible && (
              <span className="text-[11px] font-medium text-indigo-600/80 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles size={10} />
                AI Recommended Strategy
              </span>
            )}
          </div>

          <div className={`transition-all duration-300 transform ${isSelected ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0 hidden sm:block"}`}>
            {isSelected && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wide shadow-md dark:bg-slate-100 dark:text-slate-900">
                <CheckCircle2 size={12} className="text-emerald-400 dark:text-emerald-600" />
                Selected
              </div>
            )}
          </div>

          {!isSelected && isEligible && (
            <button
              type="button"
              className={`
                px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50
                dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700
                ${isRecommended ? "hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:border-indigo-700 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/30" : ""}
              `}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              Select
            </button>
          )}
        </div>

        <div>
          <div className="mb-2">
            <h3 className={`text-xl md:text-2xl font-bold tracking-tight ${!isEligible ? "text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
              {plan.title}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2 dark:text-slate-400">
              <span className={isRecommended && isEligible ? "text-indigo-600 font-semibold dark:text-indigo-400" : "text-slate-500"}>{plan.matchInfo}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden />
              <span className="text-slate-400 font-normal dark:text-slate-500">{plan.description.slice(0, 50)}…</span>
            </p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl dark:text-slate-300">
            {plan.description}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap gap-2">
          {plan.benefits.map((value, i) => (
            <div
              key={i}
              className={`
                px-3 py-1.5 rounded-md border text-[10px] font-semibold transition-colors duration-300
                ${isSelected
                  ? isRecommended
                    ? "bg-indigo-50/80 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300"
                    : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                  : "bg-slate-50/50 border-slate-100 text-slate-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"}
              `}
            >
              <span className="opacity-70 font-normal mr-1">Benefit:</span>
              {value}
            </div>
          ))}
          {isRecommended && isEligible && (
            <div className="px-3 py-1.5 rounded-md border border-emerald-100 bg-emerald-50/50 text-emerald-700 text-[10px] font-semibold flex items-center gap-1 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
              Tax-Free Growth
            </div>
          )}
        </div>
      </div>

      {!isEligible && (
        <div className="absolute top-6 right-6 text-slate-300 dark:text-slate-600" aria-hidden>
          <Lock size={20} />
        </div>
      )}
    </div>
  );
};

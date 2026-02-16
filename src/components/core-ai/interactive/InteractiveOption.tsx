/**
 * InteractiveOption — A single selectable option card inside a group.
 *
 * Supports: label, hint, optional badge (e.g. "Recommended"), selected state.
 * Presentation-only. No hard-coded flow logic.
 */

import { motion, useReducedMotion } from "framer-motion";

export interface InteractiveOptionProps {
  label: string;
  hint?: string;
  badge?: string;
  selected?: boolean;
  onClick: () => void;
  /** Delay for staggered animation */
  index?: number;
}

export function InteractiveOption({
  label,
  hint,
  badge,
  selected = false,
  onClick,
  index = 0,
}: InteractiveOptionProps) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`
        w-full rounded-lg border-2 p-3 text-left transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800
        ${selected
          ? "border-teal-500 bg-teal-500/10 text-white ring-1 ring-teal-500/30"
          : "border-slate-600/60 bg-slate-700/40 text-slate-200 hover:border-slate-500 hover:bg-slate-700/70"
        }
      `}
      aria-pressed={selected}
      aria-label={`${label}${hint ? `: ${hint}` : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="block text-sm font-semibold">{label}</span>
          {hint && <span className="block text-[11px] text-slate-400 mt-0.5">{hint}</span>}
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 text-[10px] font-medium text-teal-300">
            {badge}
          </span>
        )}
      </div>
    </motion.button>
  );
}

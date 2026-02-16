/**
 * SuccessCard — Completion / confirmation card shown at the end of a flow.
 *
 * Shows a checkmark, title, optional timeline of next steps, and action button.
 */

import { motion, useReducedMotion } from "framer-motion";

export interface TimelineStep {
  label: string;
  detail?: string;
}

export interface SuccessCardProps {
  title: string;
  description?: string;
  timeline?: TimelineStep[];
  actionLabel?: string;
  onAction?: () => void;
}

export function SuccessCard({ title, description, timeline, actionLabel, onAction }: SuccessCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-800/80 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-4 flex items-start gap-3">
        <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-emerald-300">{title}</h4>
          {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>

      {/* Timeline */}
      {timeline && timeline.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 mb-2">What happens next</p>
          <div className="space-y-2.5 pl-1">
            {timeline.map((step, i) => (
              <motion.div
                key={step.label}
                initial={reduced ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.2 }}
                className="flex items-start gap-2.5"
              >
                <div className="relative mt-1">
                  <span className="block h-2 w-2 rounded-full bg-emerald-500/60" />
                  {i < timeline.length - 1 && (
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-4 bg-slate-700" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-200">{step.label}</p>
                  {step.detail && <p className="text-[10px] text-slate-500">{step.detail}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      {actionLabel && onAction && (
        <div className="px-4 py-3 border-t border-emerald-500/20">
          <button
            type="button"
            onClick={onAction}
            className="w-full px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </motion.div>
  );
}

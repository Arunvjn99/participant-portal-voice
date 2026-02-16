/**
 * InteractiveChipGroup — A row of selectable preset chips.
 *
 * Used for quick value selection (contribution %, loan amounts, purposes, terms).
 * Presentation-only. Callbacks fire the selected value.
 */

import { motion, useReducedMotion } from "framer-motion";

export interface ChipItem {
  label: string;
  value: string;
}

export interface InteractiveChipGroupProps {
  chips: ChipItem[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  /** Optional label above the chip row */
  label?: string;
}

export function InteractiveChipGroup({ chips, selectedValue, onSelect, label }: InteractiveChipGroupProps) {
  const reduced = useReducedMotion();

  return (
    <div role="group" aria-label={label || "Options"}>
      {label && <p className="text-[11px] font-medium text-slate-400 mb-2">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => {
          const isSelected = chip.value === selectedValue;
          return (
            <motion.button
              key={chip.value}
              type="button"
              onClick={() => onSelect(chip.value)}
              initial={reduced ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15, delay: i * 0.03 }}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 focus:ring-offset-slate-800
                ${isSelected
                  ? "bg-teal-500/20 border border-teal-500/40 text-teal-300"
                  : "bg-slate-700/60 border border-slate-600/50 text-slate-300 hover:bg-slate-600/80 hover:text-white"
                }
              `}
              aria-pressed={isSelected}
            >
              {chip.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

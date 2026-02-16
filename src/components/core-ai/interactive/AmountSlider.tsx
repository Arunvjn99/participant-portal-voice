/**
 * AmountSlider — Slider with presets for selecting amounts or percentages.
 *
 * Combines a row of preset chips with a range slider.
 * Used for contribution %, loan amounts, withdrawal amounts.
 * Commits value on mouseUp / touchEnd (not on every drag tick).
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { InteractiveChipGroup, type ChipItem } from "./InteractiveChipGroup";

export interface AmountSliderProps {
  /** Label above the slider */
  label: string;
  /** Min value */
  min: number;
  /** Max value */
  max: number;
  /** Step increment */
  step?: number;
  /** Initial value */
  defaultValue?: number;
  /** Preset quick-select buttons */
  presets?: ChipItem[];
  /** Fired when user commits a value (mouseUp, touchEnd, or preset click) */
  onCommit: (value: number) => void;
  /** Format display value (default: as-is with toLocaleString) */
  formatValue?: (v: number) => string;
  /** Unit label shown next to the value (e.g. "%", "") */
  unit?: string;
}

export function AmountSlider({
  label,
  min,
  max,
  step = 1,
  defaultValue,
  presets,
  onCommit,
  formatValue,
  unit = "",
}: AmountSliderProps) {
  const [value, setValue] = useState(defaultValue ?? min);
  const reduced = useReducedMotion();

  const display = formatValue ? formatValue(value) : `${value.toLocaleString()}${unit}`;

  const handlePreset = (v: string) => {
    const num = parseFloat(v.replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) {
      setValue(num);
      onCommit(num);
    }
  };

  const commitSlider = () => {
    onCommit(value);
  };

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {presets && presets.length > 0 && (
        <InteractiveChipGroup
          chips={presets}
          selectedValue={String(value)}
          onSelect={handlePreset}
        />
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="amount-slider" className="text-xs font-medium text-slate-400">
            {label}
          </label>
          <motion.span
            key={value}
            initial={reduced ? false : { scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-semibold tabular-nums text-teal-400"
          >
            {display}
          </motion.span>
        </div>
        <input
          id="amount-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onMouseUp={commitSlider}
          onTouchEnd={commitSlider}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-teal-500
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500
            [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-teal-500/20"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={display}
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>{formatValue ? formatValue(min) : `${min.toLocaleString()}${unit}`}</span>
          <span>{formatValue ? formatValue(max) : `${max.toLocaleString()}${unit}`}</span>
        </div>
      </div>
    </motion.div>
  );
}

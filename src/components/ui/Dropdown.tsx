import { useId, useRef, useEffect, useState } from "react";
import type { KeyboardEvent, FocusEvent } from "react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  error?: string;
  disabled?: boolean;
  size?: "default" | "compact";
}

/**
 * HeroUI-inspired Select/Dropdown (v3.heroui.com). Rounded-lg, clear border, focus ring.
 */
export const Dropdown = ({
  label = "",
  placeholder = "Select an option",
  value,
  options,
  onChange,
  name,
  id,
  error,
  disabled = false,
  size = "default",
}: DropdownProps) => {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) handleSelect(options[focusedIndex].value);
        else setIsOpen(!isOpen);
        break;
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        else setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Tab":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      ) : null}
      <div
        ref={dropdownRef}
        className={cn(
          "relative w-full rounded-lg border-2 bg-transparent text-left outline-none transition-[border-color,box-shadow] duration-200",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:focus-within:ring-primary/30",
          size === "default" ? "min-h-[40px] py-2 pl-3 pr-10" : "min-h-[32px] py-1.5 pl-2.5 pr-8 text-sm",
          !isOpen && "border-slate-200 dark:border-slate-600",
          isOpen && "border-primary ring-2 ring-primary/20 dark:ring-primary/30",
          error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20",
          disabled && "cursor-not-allowed opacity-50"
        )}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${inputId}-listbox`}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        <input type="hidden" id={inputId} name={name} value={value ?? ""} readOnly aria-hidden />
        <div
          className="flex cursor-pointer items-center justify-between gap-2 px-0.5"
          onClick={handleToggle}
        >
          <span
            className={cn(
              "truncate text-slate-900 dark:text-slate-100",
              !selectedOption && "text-slate-500 dark:text-slate-400"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="pointer-events-none shrink-0 text-slate-400 dark:text-slate-500" aria-hidden>
            <svg className="h-4 w-4 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
        {isOpen && (
          <ul
            id={`${inputId}-listbox`}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[280px] overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            role="listbox"
            aria-label={label}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-colors",
                  option.value === value && "bg-primary/10 font-medium text-primary dark:text-primary",
                  index === focusedIndex && option.value !== value && "bg-slate-100 dark:bg-slate-700",
                  "hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

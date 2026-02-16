import { useId } from "react";
import type { InputHTMLAttributes, ChangeEvent } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  error?: string;
  description?: string;
}

/**
 * HeroUI-inspired Input (v3.heroui.com). Rounded-lg, clear border, focus ring.
 */
export const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  id,
  error,
  description,
  className,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const descId = description ? `${inputId}-desc` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full rounded-lg border-2 border-slate-200 bg-transparent px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-200",
          "focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30",
          "disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500",
          className
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, descId].filter(Boolean).join(" ") || undefined}
        {...props}
      />
      {description && !error && (
        <p id={descId} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

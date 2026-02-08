/**
 * Ascend logo: blue square + star (header) or angled shapes (auth).
 * Theme-aware for light and dark mode.
 */
interface AscendLogoProps {
  className?: string;
  /** "full" = icon + Ascend text. "icon" = icon only. "header" = blue square + star + Ascend (dashboard). */
  variant?: "full" | "icon" | "header";
}

export const AscendLogo = ({ className = "", variant = "full" }: AscendLogoProps) => {
  const useHeaderStyle = variant === "header";

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`.trim()}
      role="img"
      aria-label="Ascend"
    >
      {useHeaderStyle ? (
        <>
          {/* Header variant: blue square with white star */}
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 dark:bg-blue-500">
            <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-4 sm:w-4 text-white" aria-hidden>
              <path
                d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="font-sans text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
            Ascend
          </span>
        </>
      ) : (
        <>
          {/* Auth variant: overlapping angled parallelograms */}
          <svg
            viewBox="0 0 36 32"
            className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
            aria-hidden
          >
            <path
              d="M4 8 L20 8 L28 24 L12 24 Z"
              className="fill-blue-700 dark:fill-blue-500"
            />
            <path
              d="M0 14 L14 14 L22 30 L8 30 Z"
              className="fill-blue-600 dark:fill-blue-400"
            />
          </svg>
          {variant === "full" && (
            <span className="font-serif text-lg font-semibold tracking-tight text-blue-600 dark:text-blue-400 sm:text-xl">
              Ascend
            </span>
          )}
        </>
      )}
    </div>
  );
};

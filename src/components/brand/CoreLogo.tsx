/**
 * CORE logo: dark blue C/R/E with red target O.
 * Matches reference: bold sans-serif, target symbol for O.
 */
interface CoreLogoProps {
  className?: string;
}

export const CoreLogo = ({ className = "" }: CoreLogoProps) => {
  return (
    <div
      className={`inline-flex items-center gap-0.5 font-bold tracking-tight text-[#1e3a8a] dark:text-blue-500 [letter-spacing:-0.02em] ${className}`.trim()}
      role="img"
      aria-label="CORE"
    >
      <span>C</span>
      {/* Target O: red ring, blue inner, red center, crosshairs */}
      <span className="relative inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0">
        <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full">
          <circle cx="12" cy="12" r="11" fill="none" stroke="#dc2626" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" className="fill-[#1e3a8a] dark:fill-blue-500" />
          <circle cx="12" cy="12" r="2" fill="#dc2626" />
          <line x1="12" y1="0" x2="12" y2="24" stroke="#dc2626" strokeWidth="1" />
          <line x1="0" y1="12" x2="24" y2="12" stroke="#dc2626" strokeWidth="1" />
        </svg>
      </span>
      <span>RE</span>
    </div>
  );
};

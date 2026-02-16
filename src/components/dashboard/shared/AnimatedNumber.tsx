import { useState, useEffect, useRef, memo } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: "currency" | "percent" | "number";
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Animated count-up number display.
 * Supports currency, percent, and plain number formatting.
 */
export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  duration = 700,
  format = "number",
  decimals = 0,
  className,
  style,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(0);
  const startVal = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    startVal.current = display;
    startTime.current = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(startVal.current + (value - startVal.current) * eased);
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = (() => {
    const num = Number.isFinite(display) ? display : 0;
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(Math.max(0, num));
      case "percent":
        return `${num.toFixed(decimals)}%`;
      default:
        return num.toFixed(decimals);
    }
  })();

  return (
    <span className={className} style={style}>
      {formatted}
    </span>
  );
});

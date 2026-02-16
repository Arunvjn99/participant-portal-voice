import type { ReactNode } from "react";

interface EnrollmentPageContentProps {
  /** Page title (32px bold) */
  title: string;
  /** Optional subtitle (16px secondary) */
  subtitle?: string;
  /** Optional badge above the title */
  badge?: ReactNode;
  children: ReactNode;
}

/**
 * Shared inner wrapper for all enrollment step pages.
 * Provides consistent max-width, spacing, heading scale, and page background
 * using the enrollment design tokens.
 *
 * NOTE: This does NOT replace the route-level EnrollmentLayout.
 * It wraps the page content inside each step page.
 */
export function EnrollmentPageContent({
  title,
  subtitle,
  badge,
  children,
}: EnrollmentPageContentProps) {
  return (
    <div
      className="w-full pb-28"
      style={{ background: "var(--enroll-bg)" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* ── Page heading ── */}
        <header className="mb-8">
          {badge && <div className="mb-3">{badge}</div>}
          <h1
            className="text-[28px] md:text-[32px] font-bold leading-tight"
            style={{ color: "var(--enroll-text-primary)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-1.5 text-base"
              style={{ color: "var(--enroll-text-secondary)" }}
            >
              {subtitle}
            </p>
          )}
        </header>

        {/* ── Page body ── */}
        {children}
      </div>
    </div>
  );
}

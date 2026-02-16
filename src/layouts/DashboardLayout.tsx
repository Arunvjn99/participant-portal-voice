import type { ReactNode } from "react";

interface DashboardLayoutProps {
  header?: ReactNode;
  /** Optional secondary header rendered immediately below the main header (e.g. enrollment stepper). */
  subHeader?: ReactNode;
  children: ReactNode;
  /** When true, reduces top padding so content sits closer to header/stepper (e.g. enrollment steps). */
  mainCompactTop?: boolean;
  /** When true, do not apply bg-background so a parent page wrapper can provide the background. */
  transparentBackground?: boolean;
}

/*
  Shared header base class.
  Sticky with backdrop-blur, consistent border, safe-area insets.
  When subHeader is present, height is auto instead of fixed.
*/
const HEADER_BASE =
  "relative sticky top-0 z-40 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:border-slate-700 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/80 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]";

const HEADER_FIXED_H = "h-14 lg:h-16";

export const DashboardLayout = ({
  header,
  subHeader,
  children,
  mainCompactTop = false,
  transparentBackground = false,
}: DashboardLayoutProps) => {
  const mainPadding = mainCompactTop
    ? "pt-3 pb-24 md:pt-4 md:pb-24"
    : "py-6 pb-24 md:py-8 md:pb-24";

  const headerClass = subHeader
    ? HEADER_BASE
    : `${HEADER_BASE} ${HEADER_FIXED_H}`;

  if (transparentBackground) {
    return (
      <div className="dashboard-layout flex min-h-screen flex-col bg-transparent">
        {(header || subHeader) && (
          <header className={headerClass}>
            {header}
            {subHeader}
          </header>
        )}
        <div className="flex-1 min-h-0 overflow-x-hidden bg-slate-50 dark:bg-slate-900">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout flex min-h-screen flex-col bg-background">
      {(header || subHeader) && (
        <header className={headerClass}>
          {header}
          {subHeader}
        </header>
      )}
      <main
        className={`dashboard-layout__main flex-1 min-h-0 overflow-x-hidden ${mainPadding}`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:gap-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

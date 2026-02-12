import type { ReactNode } from "react";

interface DashboardLayoutProps {
  header?: ReactNode;
  children: ReactNode;
}

export const DashboardLayout = ({ header, children }: DashboardLayoutProps) => {
  return (
    <div className="dashboard-layout flex min-h-screen flex-col bg-background">
      {header && (
        <header className="relative sticky top-0 z-40 h-14 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md md:h-16 supports-[backdrop-filter]:bg-white/80 dark:border-slate-700 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/80 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
          {header}
        </header>
      )}
      <main className="dashboard-layout__main flex-1 py-6 pb-24 md:py-8 md:pb-24">
        <div className="flex flex-col gap-6 mx-auto w-full max-w-[1440px] px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

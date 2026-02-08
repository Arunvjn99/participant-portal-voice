import type { ReactNode } from "react";

interface DashboardLayoutProps {
  header?: ReactNode;
  children: ReactNode;
}

export const DashboardLayout = ({ header, children }: DashboardLayoutProps) => {
  return (
    <div className="dashboard-layout flex min-h-screen flex-col bg-background">
      {header && (
        <header className="dashboard-layout__header sticky top-0 z-50 shrink-0">
          {header}
        </header>
      )}
      <main className="dashboard-layout__main flex-1 px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-24 lg:px-8">
        <div className="flex flex-col gap-6">{children}</div>
      </main>
    </div>
  );
};

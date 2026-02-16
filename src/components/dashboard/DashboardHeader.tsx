import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { branding } from "../../config/branding";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useDemoUser, clearDemoUser } from "@/hooks/useDemoUser";
import { SCENARIO_LABELS } from "@/mock/personas";

/* ────────────────────────────── Nav config ────────────────────────────── */

/**
 * Build nav links dynamically — "Dashboard" points to /demo when a demo
 * persona is active, otherwise to /dashboard.
 */
function getNavLinks(isDemoMode: boolean) {
  return [
    { to: isDemoMode ? "/demo" : "/dashboard", label: "Dashboard" },
    { to: "/enrollment", label: "Enrollment" },
    { to: "/profile", label: "Profile" },
    { to: "/transactions", label: "Transactions" },
    { to: "#", label: "Account Statements" },
  ] as const;
}

/* ────────────────────────── Inline SVG icons ─────────────────────────── */

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseMenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* ────────────────────── Icon button shared class ─────────────────────── */

const ICON_BTN =
  "relative h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100";

/* ──────────────────────────── Component ──────────────────────────────── */

export const DashboardHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const demoUser = useDemoUser();

  /* Close user menu on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    clearDemoUser();
    navigate("/");
  };

  const NAV_LINKS = getNavLinks(!!demoUser);

  const isActive = (to: string) => {
    if (to === "#") return false;
    if (to === "/dashboard" || to === "/demo")
      return location.pathname === "/dashboard" || location.pathname === "/demo" || location.pathname === "/dashboard/classic" || location.pathname === "/dashboard/post-enrollment";
    if (to === "/transactions") return location.pathname.startsWith("/transactions");
    if (to === "/enrollment") return location.pathname.startsWith("/enrollment");
    return location.pathname === to;
  };

  const { logo, footer } = branding;

  return (
    <>
      {/*
        Main header bar.
        Padding matches DashboardLayout content: px-4 → sm:px-6 → lg:px-8
        Nav shows at lg (1024px) where 5 links fit comfortably.
        Height: h-14 (56px) → lg:h-16 (64px).
      */}
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-16 lg:px-8">
        {/* ── Left: Logos ── */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src={footer.core.src}
            alt={footer.core.label}
            className="h-7 w-auto object-contain sm:h-8"
          />
          <span className="hidden sm:block h-5 w-px shrink-0 bg-slate-200 dark:bg-slate-600" aria-hidden />
          <img
            src={logo.src}
            alt={logo.alt}
            className="hidden sm:block h-7 w-auto object-contain sm:h-8"
          />
        </div>

        {/* ── Center: Desktop nav (visible at lg+) ── */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(({ to, label }) => {
            const active = isActive(to);
            return (
              <Link
                key={label}
                to={to}
                className={`relative px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  active
                    ? "text-[#0b5fff] font-semibold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-[#0b5fff]"
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Demo Mode badge */}
          {demoUser && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden />
              Demo — {SCENARIO_LABELS[demoUser.scenario]}
            </span>
          )}

          {/* Theme toggle – always visible */}
          <ThemeToggle />

          {/* Notifications – hidden on mobile */}
          <button
            type="button"
            className={`${ICON_BTN} hidden lg:flex`}
            aria-label="Notifications"
          >
            <BellIcon />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" aria-hidden />
          </button>

          {/* User avatar + dropdown – hidden on mobile */}
          <div className="relative hidden lg:block" ref={userMenuRef}>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              onClick={() => setUserMenuOpen((o) => !o)}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #0b5fff 0%, #00b37e 100%)" }}
                aria-hidden
              >
                {demoUser?.name?.charAt(0) ?? "B"}
              </span>
              <ChevronDownIcon className="text-slate-400" />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                role="menu"
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger – visible below lg */}
          <button
            type="button"
            className={`${ICON_BTN} lg:hidden`}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <CloseMenuIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      {/* ── Mobile nav drawer (below lg) ── */}
      {mobileMenuOpen && (
      <div
        className="absolute inset-x-0 top-full z-40 border-b border-slate-200 bg-white shadow-lg lg:hidden dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-label="Mobile navigation"
      >
        <nav className="px-4 sm:px-6 py-3">
          <ul className="flex flex-col gap-0.5">
            {NAV_LINKS.map(({ to, label }) => {
              const active = isActive(to);
              return (
                <li key={label}>
                  <Link
                    to={to}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "text-[#0b5fff] bg-blue-50 dark:bg-blue-500/10"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-1 border-t border-slate-100 pt-1 dark:border-slate-800">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                onClick={handleLogout}
              >
                Log out
              </button>
            </li>
          </ul>
        </nav>
      </div>
      )}
    </>
  );
};

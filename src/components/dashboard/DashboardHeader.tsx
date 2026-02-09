import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { branding } from "../../config/branding";
import ThemeToggle from "@/components/ui/ThemeToggle";

export const DashboardHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (to: string) => {
    if (to === "#") return false;
    if (to === "/dashboard") return location.pathname === "/dashboard";
    if (to === "/transactions") return location.pathname.startsWith("/transactions");
    if (to === "/enrollment") return location.pathname.startsWith("/enrollment");
    return location.pathname === to;
  };

  const { logo, footer } = branding;

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/enrollment", label: "Enrollment" },
    { to: "/profile", label: "Profile" },
    { to: "/transactions", label: "Transactions" },
    { to: "#", label: "Account Statements" },
  ];

  const navLinkClass = (to: string) =>
    `block px-3 py-2 sm:px-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
      isActive(to)
        ? "text-primary bg-primary/10"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
    }`;

  const ActionButton = ({ "aria-label": ariaLabel, children, onClick }: { "aria-label": string; children: React.ReactNode; onClick?: () => void }) => (
    <button
      type="button"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:h-10 lg:w-10"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span className="w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center text-lg" aria-hidden>
        {children}
      </span>
    </button>
  );

  return (
    <div className="flex h-full w-full items-center">
      <div className="flex h-full w-full max-w-[1200px] flex-1 items-center justify-between gap-4 px-4 sm:px-6 mx-auto">
        {/* Brand */}
        <div className="flex shrink-0 items-center gap-3">
          <img
            src={footer.core.src}
            alt={footer.core.label}
            className="h-7 w-auto object-contain sm:h-8"
          />
          <span className="h-5 w-px shrink-0 bg-slate-200 dark:bg-slate-600" aria-hidden />
          <img src={logo.src} alt={logo.alt} className="h-7 w-auto object-contain sm:h-8" />
        </div>

        {/* Nav - hidden on mobile */}
        <nav className="hidden md:flex flex-1 items-center justify-center" aria-label="Main navigation">
          <ul className="flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <li key={label}>
                <Link to={to} className={navLinkClass(to)} onClick={() => setMobileMenuOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <ActionButton aria-label="Voice mode" onClick={() => navigate("/voice", { state: { from: location.pathname } })}>
            🎤
          </ActionButton>
          <ActionButton aria-label="Notifications">🔔</ActionButton>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:h-10 lg:w-10"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              onClick={() => setUserMenuOpen((o) => !o)}
            >
              <span className="w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center text-lg" aria-hidden>
                👤
              </span>
            </button>
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
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

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            <span className="w-5 h-5" aria-hidden>
              {mobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div
          className="absolute left-0 right-0 top-full z-40 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:hidden"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-0 px-4 py-3">
            {navLinks.map(({ to, label }) => (
              <li key={label}>
                <Link
                  to={to}
                  className={navLinkClass(to)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="block w-full px-3 py-2 sm:px-4 text-left text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-md"
                onClick={handleLogout}
              >
                Log out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

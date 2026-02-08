import { Link, useLocation, useNavigate } from "react-router-dom";
import { branding } from "../../config/branding";
import ThemeToggle from "@/components/ui/ThemeToggle";

export const DashboardHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (path === "/transactions") {
      return location.pathname.startsWith("/transactions");
    }
    if (path === "/enrollment") {
      return location.pathname.startsWith("/enrollment");
    }
    return location.pathname === path;
  };

  const { logo, footer } = branding;

  return (
    <div className="dashboard-header">
      <div className="dashboard-header__brand">
        <img
          src={footer.core.src}
          alt={footer.core.label}
          className="dashboard-header__core-logo h-8 w-auto object-contain"
        />
        <span className="dashboard-header__brand-separator" aria-hidden />
        <img
          src={logo.src}
          alt={logo.alt}
          className="dashboard-header__ascend-logo h-8 w-auto object-contain"
        />
      </div>
      <nav className="dashboard-header__nav" aria-label="Main navigation">
        <ul className="dashboard-header__nav-list">
          <li>
            <Link
              to="/dashboard"
              className={`dashboard-header__nav-link ${isActive("/dashboard") ? "dashboard-header__nav-link--active" : ""}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/enrollment"
              className={`dashboard-header__nav-link ${isActive("/enrollment") ? "dashboard-header__nav-link--active" : ""}`}
            >
              Enrollment
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={`dashboard-header__nav-link ${location.pathname === "/profile" ? "dashboard-header__nav-link--active" : ""}`}
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/transactions"
              className={`dashboard-header__nav-link ${isActive("/transactions") ? "dashboard-header__nav-link--active" : ""}`}
            >
              Transactions
            </Link>
          </li>
          <li>
            <Link
              to="#"
              className="dashboard-header__nav-link"
            >
              Account Statements
            </Link>
          </li>
        </ul>
      </nav>
      <div className="dashboard-header__actions">
        <ThemeToggle />
        <button
          type="button"
          className="dashboard-header__action-button"
          aria-label="Voice mode"
          onClick={() => navigate("/voice", { state: { from: location.pathname } })}
        >
          <span aria-hidden="true">🎤</span>
        </button>
        <button
          type="button"
          className="dashboard-header__action-button"
          aria-label="Notifications"
        >
          <span aria-hidden="true">🔔</span>
        </button>
        <button
          type="button"
          className="dashboard-header__action-button"
          aria-label="Profile"
        >
          <span aria-hidden="true">👤</span>
        </button>
      </div>
    </div>
  );
};

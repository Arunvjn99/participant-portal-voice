import { useNavigate } from "react-router-dom";

interface BottomActionCardsProps {
  contributionPct: number;
}

/**
 * Bottom 3 cards: Contribution (dark blue), Statements, Strategy
 */
export const BottomActionCards = ({ contributionPct }: BottomActionCardsProps) => {
  const navigate = useNavigate();

  return (
    <div className="ped-bottom-cards w-full min-w-0">
      <div className="ped-bottom-cards__card ped-bottom-cards__card--primary">
        <span className="ped-bottom-cards__icon" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </span>
        <span className="ped-bottom-cards__label">CONTRIBUTION</span>
        <span className="ped-bottom-cards__value">{contributionPct}% of paycheck</span>
        <button
          type="button"
          className="ped-bottom-cards__btn ped-bottom-cards__btn--primary"
          onClick={() => navigate("/enrollment/contribution")}
        >
          Change Rate
        </button>
      </div>
      <div className="ped-bottom-cards__card">
        <span className="ped-bottom-cards__icon" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </span>
        <span className="ped-bottom-cards__label">Statements</span>
        <p className="ped-bottom-cards__desc">Access quarterly reports and tax forms.</p>
        <button
          type="button"
          className="ped-bottom-cards__link"
          onClick={() => navigate("/transactions")}
        >
          View Documents →
        </button>
      </div>
      <div className="ped-bottom-cards__card">
        <span className="ped-bottom-cards__icon" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </span>
        <span className="ped-bottom-cards__label">Strategy</span>
        <p className="ped-bottom-cards__desc">Rebalance portfolio or change investment allocations.</p>
        <button
          type="button"
          className="ped-bottom-cards__link"
          onClick={() => navigate("/enrollment/investments")}
        >
          Manage Portfolio →
        </button>
      </div>
    </div>
  );
};

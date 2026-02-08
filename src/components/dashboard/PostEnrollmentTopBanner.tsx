import { useNavigate } from "react-router-dom";

interface PostEnrollmentTopBannerProps {
  percentOnTrack: number;
  subText: string;
  actionRoute: string;
}

/**
 * Top banner: "You're X% on track for retirement" with gradient + Take Action CTA
 */
export const PostEnrollmentTopBanner = ({
  percentOnTrack,
  subText,
  actionRoute,
}: PostEnrollmentTopBannerProps) => {
  const navigate = useNavigate();

  return (
    <div className="ped-banner rounded-xl p-6 w-full min-w-0">
      <div className="ped-banner__content">
        <div className="ped-banner__icon-wrap" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>
        <div className="ped-banner__text">
          <p className="ped-banner__title">
            You're {percentOnTrack}% on track for retirement.
          </p>
          <p className="ped-banner__sub">{subText}</p>
        </div>
        <button
          type="button"
          className="ped-banner__cta ped-banner__cta--pill"
          onClick={() => navigate(actionRoute)}
        >
          Take Action →
        </button>
      </div>
    </div>
  );
};

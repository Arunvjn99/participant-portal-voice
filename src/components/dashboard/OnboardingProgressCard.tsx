interface OnboardingProgressCardProps {
  percentComplete: number;
  badgesCompleted: number;
  badgesTotal: number;
  message: string;
}

export const OnboardingProgressCard = ({
  percentComplete,
  badgesCompleted,
  badgesTotal,
  message,
}: OnboardingProgressCardProps) => (
  <article className="ped-onboarding bg-card rounded-xl border border-border p-6 shadow-sm min-h-fit w-full min-w-0">
    <h2 className="ped-onboarding__title">Onboarding Progress</h2>
    <div className="ped-onboarding__bar-wrap">
      <div className="ped-onboarding__bar">
        <div
          className="ped-onboarding__bar-fill"
          style={{ width: `${percentComplete}%` }}
        />
      </div>
      <span className="ped-onboarding__bar-label">Progress {percentComplete}%</span>
    </div>
    <div className="ped-onboarding__badges">
      <span className="ped-onboarding__badges-icon" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      </span>
      <span className="ped-onboarding__badges-text">
        Reward Badges - Step {badgesCompleted} Completed!
      </span>
    </div>
    <p className="ped-onboarding__message">{message}</p>
  </article>
);

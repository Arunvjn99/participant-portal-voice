import { motion } from "framer-motion";

export interface ContributionHeroProps {
  matchCap: number;
  matchEnabled: boolean;
}

export function ContributionHero({ matchCap, matchEnabled }: ContributionHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {matchEnabled && matchCap > 0 && (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full mb-3"
          style={{
            background: "rgb(var(--enroll-brand-rgb) / 0.08)",
            color: "var(--enroll-brand)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
          Employer match up to {matchCap}%
        </span>
      )}
    </motion.div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import { PersonalizePlanModal } from "../enrollment/PersonalizePlanModal";
import { ArrowUpRightIcon } from "../../assets/dashboard/icons";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useCanHover } from "../../hooks/useCanHover";

interface HeroEnrollmentCardProps {
  greeting?: string;
  headline?: string;
  description?: string;
  /** Hero illustration image. Uses placeholder if not provided. */
  heroImageSrc?: string;
  /** Enrollment badge text. Hidden if empty. */
  enrollmentBadge?: string;
  /** Floating insight card: plan name */
  insightPlanName?: string;
  /** Floating insight card: balance label */
  insightBalanceLabel?: string;
  /** Floating insight card: balance value */
  insightBalanceValue?: string;
}

const DEFAULT_HERO_IMAGE = "/image/hero-illustration.png";

export const HeroEnrollmentCard = ({
  greeting = "Welcome back",
  headline = "Get started with your 401(k)",
  description = "Enroll in your retirement plan today and start building your financial future. The process is simple and takes just a few minutes.",
  heroImageSrc = DEFAULT_HERO_IMAGE,
  enrollmentBadge = "+ ENROLLMENT OPEN",
  insightPlanName = "Plan: Roth 401(k)",
  insightBalanceLabel = "Current Balance",
  insightBalanceValue = "$12,500",
}: HeroEnrollmentCardProps) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const reduced = useReducedMotion();
  const canHover = useCanHover();

  const handleEnrollClick = () => {
    setIsWizardOpen(true);
  };

  return (
    <>
      <section
        className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-shadow duration-300 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/30 md:p-8 ${canHover ? "md:hover:shadow-xl" : ""}`}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
          {/* Left: copy, badge, CTA - stagger first */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 8 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={reduced ? {} : { duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0 }}
            className="flex flex-1 flex-col items-start gap-4 lg:order-1"
          >
            {enrollmentBadge && (
              <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white dark:bg-emerald-500">
                {enrollmentBadge}
              </span>
            )}
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {greeting}
            </p>
            <h1 className="text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100 md:text-3xl">
              {headline}
            </h1>
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {description}
            </p>
            <Button
              className="rounded-2xl px-8 py-3.5 font-semibold text-white bg-primary hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 dark:focus-visible:outline-offset-slate-900 transition-colors shadow-md hover:shadow-lg"
              onClick={handleEnrollClick}
            >
              Enroll Now
            </Button>
          </motion.div>

          {/* Right: illustration - stagger second */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 8 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={reduced ? {} : { duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.08 }}
            className="relative order-first w-full shrink-0 lg:order-2 lg:min-w-[280px] lg:w-2/5"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
              <img
                src={heroImageSrc}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%94a3b8' width='400' height='300'/%3E%3Ctext fill='%64748b' font-family='sans-serif' font-size='18' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EIllustration%3C/text%3E%3C/svg%3E";
                }}
              />
              {/* Floating insight card - stagger last */}
              <motion.div
                initial={reduced ? {} : { opacity: 0, y: 8 }}
                animate={reduced ? {} : { opacity: 1, y: 0 }}
                transition={reduced ? {} : { duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.16 }}
                className="absolute bottom-4 left-4 right-4 rounded-lg border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:border-slate-600/80 dark:bg-slate-800/95 dark:shadow-black/40 md:right-auto md:w-48"
              >
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                  PERSONALISED INSIGHTS
                  <ArrowUpRightIcon size={12} className="shrink-0" />
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {insightPlanName}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {insightBalanceLabel}
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {insightBalanceValue}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      <PersonalizePlanModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </>
  );
};

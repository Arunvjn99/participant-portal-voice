import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { FloatingCards } from "./FloatingCards";
import { PersonalizePlanModal } from "../enrollment/PersonalizePlanModal";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

export const HeroSection = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <>
    <section className="relative w-full overflow-hidden rounded-2xl">
      {/* Background depth – radial gradients + optional noise */}
      <div
        className="pre-enrollment-hero-bg pre-enrollment-hero-noise absolute inset-0 -z-10"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-slate-50/80 dark:to-slate-900/90" />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 sm:gap-10 lg:gap-16 pt-8 pb-10 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-24 px-0 min-h-0">
        {/* Left: content */}
        <motion.div
          className="flex-1 w-full min-w-0 flex flex-col justify-center min-h-0"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/40 dark:border-emerald-800 w-fit mb-4 sm:mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              Enrollment Window Open
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 mb-3"
          >
            Good Morning, Brian
          </motion.h2>

          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-slate-900 dark:text-slate-100 leading-[1.08] tracking-tight mb-4 sm:mb-6"
          >
            Let&apos;s build your{" "}
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              future, together.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed mb-6 sm:mb-8 md:mb-10"
          >
            You&apos;re one step away from activating your 401(k). We&apos;ve simplified
            everything so you can focus on what matters.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10"
          >
            <motion.button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="group relative inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 w-full sm:w-auto bg-primary hover:bg-primary-hover text-white rounded-2xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Start My Enrollment
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 rounded-2xl font-semibold text-sm sm:text-base hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 focus:ring-offset-2"
            >
              <Compass size={18} />
              Explore My Options
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right: floating cards (desktop) / fallback card (mobile/tablet) */}
        <motion.div
          className="flex-1 w-full min-w-0 relative flex items-center justify-center shrink-0 lg:shrink"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Desktop floating cards */}
          <div className="hidden lg:block w-full h-[520px] xl:h-[600px] relative">
            <FloatingCards />
          </div>
          {/* Mobile/Tablet fallback */}
          <div className="lg:hidden w-full max-w-[260px] sm:max-w-[320px] aspect-square bg-gradient-to-br from-brand-100 to-indigo-50 dark:from-brand-900/40 dark:to-indigo-900/30 rounded-2xl sm:rounded-3xl flex items-center justify-center relative overflow-hidden shadow-lg dark:shadow-black/20 mx-auto">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="text-center p-6 sm:p-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-brand-900 dark:text-brand-200 mb-2">$1.2M</h3>
              <p className="text-sm sm:text-base text-brand-700 dark:text-brand-300 font-medium">Projected Future Value</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    <PersonalizePlanModal
      isOpen={isWizardOpen}
      onClose={() => setIsWizardOpen(false)}
      userName="Brian"
    />
    </>
  );
};

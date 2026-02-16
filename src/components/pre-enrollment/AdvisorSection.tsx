import { MessageCircle, Calendar } from "lucide-react";
import { ADVISORS } from "./constants";

export const AdvisorSection = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 w-full rounded-2xl min-w-0 overflow-hidden px-4 sm:px-6 md:px-8">
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3 md:mb-4">
          Need guidance? Real people are here.
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base md:text-lg">
          Robots are great for math, but sometimes you just need to talk to a human.
          Our team is non-commissioned and here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
        {ADVISORS.map((advisor) => (
          <div
            key={advisor.id}
            className="flex flex-col items-center text-center p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 hover:bg-brand-50/50 dark:hover:bg-slate-700/80 transition-colors border border-slate-100 dark:border-slate-700 hover:border-brand-100 dark:hover:border-slate-600 hover:shadow-lg shadow-sm dark:shadow-black/20 group min-w-0"
          >
              <div className="relative mb-4 sm:mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
                  <img
                    src={advisor.image}
                    alt={advisor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 border-[3px] sm:border-4 border-white dark:border-slate-700 rounded-full" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">{advisor.name}</h3>
              <p className="text-brand-600 dark:text-brand-400 text-xs sm:text-sm font-medium mb-2 sm:mb-3">{advisor.role}</p>
              <p className="text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 md:mb-8 leading-relaxed text-xs sm:text-sm md:text-base">&quot;{advisor.bio}&quot;</p>

              <div className="flex gap-2 sm:gap-3 w-full mt-auto">
                <button
                  type="button"
                  className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-300 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                  Chat
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-primary text-white font-medium text-xs sm:text-sm hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                >
                  <Calendar size={14} className="sm:w-4 sm:h-4" />
                  Book
                </button>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

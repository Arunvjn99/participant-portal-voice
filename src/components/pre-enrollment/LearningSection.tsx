import { Play } from "lucide-react";
import { RESOURCES } from "./constants";

export const LearningSection = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">
            Learn at your pace
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base md:text-lg">
            Short, simple guides to help you make informed decisions.
          </p>
        </div>
        <button
          type="button"
          className="hidden sm:block text-brand-600 dark:text-brand-400 font-medium hover:text-brand-800 dark:hover:text-brand-300 transition-colors rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-2 dark:focus:ring-offset-slate-900 py-1 shrink-0"
        >
          View library
        </button>
      </div>

      <div className="relative w-full overflow-x-auto pb-4 sm:pb-6 scrollbar-hide -mx-1 px-1">
        <div className="flex gap-3 sm:gap-4 md:gap-5 w-max">
          {RESOURCES.map((resource) => (
            <div
              key={resource.id}
              className="group relative w-56 h-64 sm:w-64 sm:h-72 md:w-72 md:h-80 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl shadow-md dark:shadow-black/30 dark:hover:shadow-black/40 ring-1 ring-slate-200/50 dark:ring-slate-700/50 flex-shrink-0"
            >
              <div className="absolute inset-0">
                <img
                  src={resource.thumbnail}
                  alt={resource.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 p-3 sm:p-4 md:p-6 w-full">
                <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider mb-1.5 sm:mb-2 border border-white/10">
                  {resource.category}
                </span>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-1.5 md:mb-2 leading-tight">
                  {resource.title}
                </h3>
                <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Play size={10} fill="currentColor" />
                  </div>
                  {resource.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { detectIntent, generateResponse, type AIResponse } from "../../utils/aiIntentDetection";

// Optional enrollment context
const useEnrollmentSafe = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useEnrollment } = require("../../enrollment/context/EnrollmentContext");
    return useEnrollment();
  } catch {
    return null;
  }
};

/**
 * FloatingRetirementSearch - Bella AI Assistant
 * Matches Figma: Participants-Portal-Playground node 521-6037
 * Fixed position, appears on all screens. Dark theme, rounded panel.
 */
export const FloatingRetirementSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const enrollment = useEnrollmentSafe();
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const userContext = {
    isEnrolled: enrollment?.state?.selectedPlan != null,
    isInEnrollmentFlow: location.pathname.startsWith("/enrollment"),
    isPostEnrollment: location.pathname.startsWith("/dashboard/post-enrollment"),
    currentRoute: location.pathname,
    selectedPlan: enrollment?.state?.selectedPlan || null,
    contributionAmount: enrollment?.state?.contributionAmount || 0,
  };

  useEffect(() => {
    if (isExpanded) inputRef.current?.focus();
  }, [isExpanded]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) setIsExpanded(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !target.closest(".floating-retirement-search-trigger")
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    const currentQuery = query.trim();
    setQuery("");
    setIsLoading(true);
    const intent = detectIntent(currentQuery, userContext);
    const aiResponse = generateResponse(intent, currentQuery, userContext);
    setResponse(aiResponse);
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSuggestion = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  const handleAction = (route: string) => {
    navigate(route);
    setIsExpanded(false);
    setResponse(null);
  };

  const suggestions = [
    { icon: "book", label: "Explain retirement plans", query: "Explain retirement plans to me" },
    { icon: "calculator", label: "Calculate contributions", query: "Calculate contributions for my salary" },
    { icon: "lightning", label: "Show benefits of starting early", query: "Show benefits of starting early" },
  ];

  return (
    <>
      {/* Collapsed trigger - "Ask Bella" pill button (Figma 522-6066) */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="floating-retirement-search-trigger fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 rounded-full px-5 py-3 text-white shadow-lg hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        style={{
          background: "linear-gradient(90deg, #5EEAD4 0%, #14B8A6 50%, #0D9488 100%)",
        }}
        aria-label="Ask Bella - Retirement Assistant"
        aria-expanded={isExpanded}
      >
        {/* Bella avatar icon */}
        <img
          src="/image/bella-icon.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
          aria-hidden
        />
        <span className="font-semibold text-sm">Ask Bella</span>
      </button>

      {/* Backdrop overlay - panel floats above page content */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[9998] bg-black/25"
          aria-hidden
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Expanded panel - floating search (Figma 522-6410) */}
      {isExpanded && (
        <div
          ref={panelRef}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100vw-2rem)] min-h-[100px] sm:w-[min(640px,calc(100vw-2rem))] sm:min-h-[107px] md:w-[min(768px,calc(100vw-2rem))] md:min-h-[120px] lg:w-[min(1024px,calc(100vw-2rem))] lg:min-h-[160px] xl:w-[1168px] xl:min-h-[183px] max-w-[calc(100vw-2rem)] rounded-2xl bg-[#1B2232] dark:bg-slate-900 border border-slate-600/80 dark:border-slate-700/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
          role="dialog"
          aria-label="Bella - AI Assistant"
        >
          {/* Header - Figma: AI Assistant Online */}
          <div className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden />
              <span className="text-sm text-slate-400">AI Assistant Online</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2">What would you like to do today?</h2>
          </div>

          {/* Search input - pill shape with mic button (Figma 522-6410) */}
          <form onSubmit={handleSubmit} className="px-4 pb-4">
            <div className="flex gap-0 rounded-full bg-[#2C3549] dark:bg-slate-800 overflow-hidden border border-slate-600/50">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setResponse(null);
                  setQuery(e.target.value);
                }}
                placeholder="Explain retirement plans to me..."
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-500 text-sm outline-none min-w-0"
                aria-label="Ask Bella"
              />
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity rounded-r-full"
                aria-label="Send"
                title="Send or use voice"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            </div>
          </form>

          {/* Suggested actions */}
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => handleSuggestion(s.query)}
                className="flex items-center gap-2 rounded-lg bg-[#2C3549] dark:bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-600 transition-colors"
              >
                {s.icon === "book" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <path d="M8 7h8" />
                    <path d="M8 11h8" />
                  </svg>
                )}
                {s.icon === "calculator" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <path d="M8 6h8" />
                    <path d="M8 10h2" />
                    <path d="M14 10h2" />
                    <path d="M8 14h2" />
                    <path d="M14 14h2" />
                    <path d="M8 18h2" />
                    <path d="M14 18h2" />
                  </svg>
                )}
                {s.icon === "lightning" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                )}
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Response area */}
          <div className="px-4 pb-4 min-h-[80px] max-h-[200px] overflow-y-auto">
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
                <span>Thinking...</span>
              </div>
            )}
            {!isLoading && response && (
              <div className="rounded-lg bg-[#2C3549] dark:bg-slate-800 p-3 text-sm text-slate-200 space-y-2">
                <p>{response.answer}</p>
                {response.primaryAction && (
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleAction(response.primaryAction!.route)}
                      className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-medium hover:opacity-90"
                    >
                      {response.primaryAction.label}
                    </button>
                    {response.secondaryAction && (
                      <button
                        type="button"
                        onClick={() => handleAction(response.secondaryAction!.route)}
                        className="px-3 py-1.5 rounded-md border border-slate-500 text-slate-300 text-xs hover:bg-slate-700"
                      >
                        {response.secondaryAction.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

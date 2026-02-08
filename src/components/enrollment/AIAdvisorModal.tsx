import { useCallback, useEffect } from "react";
import Button from "../ui/Button";

interface AIAdvisorModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * AI Advisor modal - AI + Human advisor options for "Optimize your score" CTA.
 */
export const AIAdvisorModal = ({ open, onClose }: AIAdvisorModalProps) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleEscape]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-advisor-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <h2 id="ai-advisor-modal-title" className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Optimize Your Portfolio
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Get personalized guidance from our AI advisor or connect with a human expert to optimize
          your retirement investments.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="w-full"
          >
            Connect with AI Advisor
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="button--outline w-full"
          >
            Schedule Human Advisor Call
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

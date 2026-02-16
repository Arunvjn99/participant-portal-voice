import { useState } from "react";
import { CoreAssistantModal } from "../core-ai/CoreAssistantModal";

/**
 * CoreAIFab — Single floating "Ask Core AI" pill button.
 * Opens the unified CoreAssistantModal.
 *
 * This is the ONLY entry point to Core AI.
 * No second modal. No voice route. No toggle.
 */
export const CoreAIFab = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB trigger */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full px-5 py-3 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-transparent dark:from-teal-500 dark:via-teal-600 dark:to-teal-700"
          aria-label="Ask Core AI - Retirement Assistant"
        >
          <img
            src="/image/bella-icon.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            aria-hidden
          />
          <span className="font-semibold text-sm">Ask Core AI</span>
        </button>
      </div>

      {/* Single assistant modal — no voice toggle, no second screen */}
      <CoreAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

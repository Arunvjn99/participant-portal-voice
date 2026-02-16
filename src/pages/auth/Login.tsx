import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthLayout,
  AuthFormShell,
  AuthInput,
  AuthPasswordInput,
  AuthButton,
} from "../../components/auth";
import { Logo } from "../../components/brand/Logo";
import { personas, SCENARIO_LABELS } from "@/mock/personas";
import { setDemoUser } from "@/hooks/useDemoUser";
import type { PersonaProfile } from "@/mock/personas";

/* ─────────────────────────────────────────────────────────────────────────
   Scenario colors for the demo persona picker
   ───────────────────────────────────────────────────────────────────────── */

const SCENARIO_COLORS: Record<string, string> = {
  pre_enrollment: "#6366f1",
  new_enrollee: "#6366f1",
  young_accumulator: "#10b981",
  mid_career: "#0b5fff",
  pre_retiree: "#f59e0b",
  at_risk: "#ef4444",
  loan_active: "#f97316",
  retired: "#8b5cf6",
};

export const Login = () => {
  const navigate = useNavigate();
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  /* ── Normal login (unchanged) ── */
  const handleLogin = () => {
    navigate("/verify");
  };

  const handleForgotPassword = () => {
    navigate("/forgot");
  };

  const handleHelpCenter = () => {
    navigate("/help");
  };

  /* ── Demo login ── */
  const handleDemoLogin = (persona: PersonaProfile) => {
    setDemoUser(persona);
    navigate("/demo");
  };

  const headerSlot = <Logo className="h-10 w-auto" />;

  /* ── Standard login form body ── */
  const standardBody = (
    <>
      <AuthInput
        label="Email"
        type="text"
        name="email"
        id="email"
        placeholder="Enter your Email or Username"
      />
      <div className="flex flex-col gap-2">
        <AuthPasswordInput
          label="Password"
          name="password"
          id="password"
          placeholder="Enter your password"
        />
        <div className="flex justify-end">
          <a
            href="#"
            className="text-sm text-blue-600 no-underline transition-colors hover:underline dark:text-blue-400"
            onClick={(e) => {
              e.preventDefault();
              handleForgotPassword();
            }}
          >
            Forgot password?
          </a>
        </div>
      </div>
      <AuthButton onClick={handleLogin} className="w-full">
        Login
      </AuthButton>

      {/* ── Divider ── */}
      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
        <span className="mx-3 text-xs font-medium text-slate-400 dark:text-slate-500">OR</span>
        <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
      </div>

      {/* ── Explore Scenarios CTA ── */}
      <button
        type="button"
        onClick={() => setShowDemoPanel(true)}
        className="group flex w-full items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50/50 px-5 py-3.5 text-sm font-semibold text-indigo-600 transition-all hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-500/5 dark:text-indigo-400 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
        Explore Demo Scenarios
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
          {personas.length} personas
        </span>
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Still need help? Contact{" "}
        <a
          href="#"
          className="text-blue-600 no-underline hover:underline dark:text-blue-400"
          onClick={(e) => {
            e.preventDefault();
            handleHelpCenter();
          }}
        >
          Help Center
        </a>
      </p>
    </>
  );

  return (
    <AuthLayout>
      <AuthFormShell
        headerSlot={headerSlot}
        title="Login"
        bodySlot={standardBody}
      />

      {/* ── Demo Scenario Picker Modal ── */}
      {showDemoPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDemoPanel(false)}
            aria-hidden
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Explore Scenarios
                </h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Pick a persona to explore the portal
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoPanel(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Persona list */}
            <div className="max-h-[60vh] overflow-y-auto p-3">
              <div className="flex flex-col gap-1.5">
                {personas.map((persona) => {
                  const color = SCENARIO_COLORS[persona.scenario] ?? "#6b7280";
                  const fmt = Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => handleDemoLogin(persona)}
                      className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent p-4 text-left transition-all hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {/* Avatar */}
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {persona.name.charAt(0)}
                      </span>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {persona.name}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: color }}
                          >
                            {SCENARIO_LABELS[persona.scenario]}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Age {persona.age} · {fmt.format(persona.balance)} · Score {persona.retirementScore}
                        </p>
                      </div>

                      {/* Arrow */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-300 dark:text-slate-600" aria-hidden>
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
              <p className="text-center text-xs text-slate-400">
                No password required — click any persona to explore instantly.
              </p>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

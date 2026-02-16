import { useCallback, useSyncExternalStore } from "react";
import type { PersonaProfile } from "@/mock/personas";
import { DEMO_USER_KEY } from "@/mock/personas";

/* ─────────────────────────────────────────────────────────────────────────
   useDemoUser — reactive hook for the demo persona stored in localStorage.
   Uses useSyncExternalStore so every component re-renders when the
   persona changes (even from another tab).

   IMPORTANT: getSnapshot must return a *referentially stable* value so
   React doesn't re-render infinitely. We cache the parsed object and only
   update it when the raw JSON string changes.
   ───────────────────────────────────────────────────────────────────────── */

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/* Cached snapshot — avoids re-parsing & new references on every call */
let cachedRaw: string | null = null;
let cachedValue: PersonaProfile | null = null;

function getSnapshot(): PersonaProfile | null {
  const raw = localStorage.getItem(DEMO_USER_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedValue = raw ? (JSON.parse(raw) as PersonaProfile) : null;
    } catch {
      cachedValue = null;
    }
  }
  return cachedValue;
}

function getServerSnapshot(): PersonaProfile | null {
  return null;
}

/** Set a new demo persona (or clear it). Triggers re-render in all consumers. */
export function setDemoUser(user: PersonaProfile | null) {
  if (user) {
    const json = JSON.stringify(user);
    localStorage.setItem(DEMO_USER_KEY, json);
    cachedRaw = json;
    cachedValue = user;
    console.log(`%c✦ Active Demo Persona: ${user.scenario}`, "color:#0b5fff;font-weight:bold");
  } else {
    localStorage.removeItem(DEMO_USER_KEY);
    cachedRaw = null;
    cachedValue = null;
  }
  emitChange();
}

/** Clear the demo persona. */
export function clearDemoUser() {
  setDemoUser(null);
}

/** Reactive hook that returns the current demo persona (or null). */
export function useDemoUser(): PersonaProfile | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Convenience hook that also exposes setter. */
export function useDemoUserActions() {
  const user = useDemoUser();
  const set = useCallback((u: PersonaProfile | null) => setDemoUser(u), []);
  const clear = useCallback(() => clearDemoUser(), []);
  return { user, setUser: set, clearUser: clear };
}

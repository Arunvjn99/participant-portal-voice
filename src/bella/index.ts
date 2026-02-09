/**
 * Core AI - Voice assistant screen (from participant portal)
 *
 * Usage:
 *   import BellaScreen from './bella';
 *
 *   <BellaScreen onClose={() => navigate('/dashboard')} />
 *
 * Host app must:
 * - Set VITE_GEMINI_API_KEY for Gemini fallback (general questions when no scripted flow active)
 * - Browser SpeechRecognition and speechSynthesis (Chrome, Safari, Edge)
 */
export { default as BellaScreen } from "./BellaScreen";
export type { BellaScreenProps } from "./BellaScreen";

/** Risk tolerance scale 1–5 from AI Investment Profile wizard */
export type RiskTolerance = 1 | 2 | 3 | 4 | 5;

/** Investment time horizon from wizard */
export type InvestmentHorizon =
  | "< 5 years"
  | "5–10 years"
  | "10–20 years"
  | "20+ years";

/** Investment involvement preference from wizard */
export type InvestmentPreference =
  | "prefer recommended"
  | "adjust allocations"
  | "full manual"
  | "advisor assistance";

/** AI Investment Profile captured before Investments step */
export interface InvestmentProfile {
  riskTolerance: RiskTolerance;
  investmentHorizon: InvestmentHorizon;
  investmentPreference: InvestmentPreference;
}

/** Default profile when user skips wizard */
export const DEFAULT_INVESTMENT_PROFILE: InvestmentProfile = {
  riskTolerance: 3,
  investmentHorizon: "10–20 years",
  investmentPreference: "prefer recommended",
};

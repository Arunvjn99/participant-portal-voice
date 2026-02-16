export interface PlanFeature {
  label: string;
  value: string;
}

export interface PlanMetrics {
  growth: number;        // 0-100
  taxEfficiency: number; // 0-100
  flexibility: number;   // 1-5 (Dot scale)
}

export type PlanTheme = 'violet' | 'blue' | 'slate' | 'amber';

export interface PlanData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  match: string;
  taxContext: string;
  features: PlanFeature[];
  confidenceScore: number;
  isRecommended: boolean;
  isEligible: boolean; // New: determines availability
  ineligibilityReason?: string; // New: explanation for lock
  tags: string[];
  metrics: PlanMetrics;
  emotionalCopy: string;
  theme: PlanTheme;
}

export interface UserProfile {
  name: string;
  age: number;
  salary: string;
  retirementAge: number;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  goal: string;
}
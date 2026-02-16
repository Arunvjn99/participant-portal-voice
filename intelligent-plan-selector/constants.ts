import { PlanData, UserProfile } from './types';

export const USER_PROFILE: UserProfile = {
  name: "Alex",
  age: 28,
  salary: "$142,000",
  retirementAge: 65,
  riskProfile: "Moderate",
  goal: "Long-term Wealth"
};

export const PLANS: PlanData[] = [
  {
    id: 'roth-401k',
    title: 'Roth 401(k)',
    subtitle: 'Pay taxes now',
    description: 'You pay taxes on this money now. It grows tax-free, and you won\'t pay any taxes when you withdraw it in retirement.',
    match: 'Employer Match Eligible',
    taxContext: 'Post-Tax',
    confidenceScore: 94,
    isRecommended: true,
    isEligible: true,
    features: [
      { label: 'Contribution', value: 'After Taxes' },
      { label: 'Growth', value: 'Tax-Free' },
      { label: 'Withdrawal', value: 'Tax-Free' },
    ],
    tags: ['Best Match'],
    metrics: { growth: 95, taxEfficiency: 98, flexibility: 2 },
    emotionalCopy: "Best for tax-free growth over time.",
    theme: 'violet'
  },
  {
    id: 'trad-401k',
    title: 'Traditional 401(k)',
    subtitle: 'Pay taxes later',
    description: 'You put in money before taxes. This lowers your taxes today, but you will pay taxes when you take the money out later.',
    match: 'Employer Match Eligible',
    taxContext: 'Pre-Tax',
    confidenceScore: 78,
    isRecommended: false,
    isEligible: true,
    features: [
      { label: 'Contribution', value: 'Before Taxes' },
      { label: 'Growth', value: 'Pay Later' },
      { label: 'Withdrawal', value: 'Taxed' },
    ],
    tags: ['Standard'],
    metrics: { growth: 82, taxEfficiency: 75, flexibility: 3 },
    emotionalCopy: "Best for lowering your taxes right now.",
    theme: 'blue'
  },
  {
    id: 'after-tax',
    title: 'After-Tax 401(k)',
    subtitle: 'Save extra',
    description: 'Save more than the standard limit allows. You only pay taxes on the investment growth when you take it out.',
    match: 'No Match',
    taxContext: 'Post-Tax',
    confidenceScore: 64,
    isRecommended: false,
    isEligible: true,
    features: [
      { label: 'Contribution', value: 'After Taxes' },
      { label: 'Growth', value: 'Pay Later' },
      { label: 'Limit', value: 'High' },
    ],
    tags: ['High earners'],
    metrics: { growth: 88, taxEfficiency: 60, flexibility: 4 },
    emotionalCopy: "Save more than the usual limits allow.",
    theme: 'slate'
  },
  {
    id: 'mega-backdoor',
    title: 'Mega Backdoor',
    subtitle: 'Advanced Strategy',
    description: 'A complex method to move extra savings into a tax-free account. Not everyone is eligible for this.',
    match: 'No Match',
    taxContext: 'Conversion',
    confidenceScore: 0,
    isRecommended: false,
    isEligible: false,
    ineligibilityReason: "This plan is not available based on your current profile.",
    features: [
      { label: 'Complexity', value: 'High' },
      { label: 'Growth', value: 'Tax-Free' },
      { label: 'Access', value: 'Limited' },
    ],
    tags: ['Not Available'],
    metrics: { growth: 0, taxEfficiency: 0, flexibility: 0 },
    emotionalCopy: "Advanced way to maximize tax savings.",
    theme: 'amber'
  }
];
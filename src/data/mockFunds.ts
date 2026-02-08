import type { Fund, AssetClass } from "../types/investment";

/**
 * Mock investment funds data
 */
export const MOCK_FUNDS: Fund[] = [
  {
    id: "fund-1",
    name: "S&P 500 Index Fund",
    ticker: "SP500",
    assetClass: "US Large Cap",
    expenseRatio: 0.03,
    riskLevel: 5,
    expectedReturn: 10.2,
    description: "Tracks the S&P 500 index, providing broad exposure to large-cap US stocks",
  },
  {
    id: "fund-2",
    name: "Total Stock Market Index",
    ticker: "TSM",
    assetClass: "US Large Cap",
    expenseRatio: 0.04,
    riskLevel: 5,
    expectedReturn: 10.0,
    description: "Diversified exposure to the entire US stock market",
  },
  {
    id: "fund-3",
    name: "Mid Cap Growth Fund",
    ticker: "MCG",
    assetClass: "US Mid Cap",
    expenseRatio: 0.45,
    riskLevel: 6,
    expectedReturn: 11.5,
    description: "Focuses on mid-sized companies with growth potential",
  },
  {
    id: "fund-4",
    name: "Small Cap Value Fund",
    ticker: "SCV",
    assetClass: "US Small Cap",
    expenseRatio: 0.38,
    riskLevel: 7,
    expectedReturn: 12.0,
    description: "Invests in undervalued small-cap companies",
  },
  {
    id: "fund-5",
    name: "International Stock Index",
    ticker: "INTL",
    assetClass: "International",
    expenseRatio: 0.08,
    riskLevel: 6,
    expectedReturn: 9.5,
    description: "Broad international stock market exposure",
  },
  {
    id: "fund-6",
    name: "Emerging Markets Fund",
    ticker: "EM",
    assetClass: "International",
    expenseRatio: 0.12,
    riskLevel: 8,
    expectedReturn: 13.0,
    description: "Exposure to emerging market economies",
  },
  {
    id: "fund-7",
    name: "Total Bond Market Index",
    ticker: "BOND",
    assetClass: "Bonds",
    expenseRatio: 0.03,
    riskLevel: 2,
    expectedReturn: 4.5,
    description: "Diversified exposure to US investment-grade bonds",
  },
  {
    id: "fund-8",
    name: "Treasury Inflation-Protected Securities",
    ticker: "TIPS",
    assetClass: "Bonds",
    expenseRatio: 0.05,
    riskLevel: 2,
    expectedReturn: 4.0,
    description: "Government bonds that protect against inflation",
  },
  {
    id: "fund-9",
    name: "Real Estate Investment Trust",
    ticker: "REIT",
    assetClass: "Real Estate",
    expenseRatio: 0.12,
    riskLevel: 5,
    expectedReturn: 8.5,
    description: "Diversified real estate investment trust",
  },
  {
    id: "fund-10",
    name: "Money Market Fund",
    ticker: "MMF",
    assetClass: "Cash",
    expenseRatio: 0.10,
    riskLevel: 1,
    expectedReturn: 2.5,
    description: "Low-risk cash equivalent investment",
  },
];

/**
 * Get fund by ID
 */
export const getFundById = (id: string): Fund | undefined => {
  return MOCK_FUNDS.find((fund) => fund.id === id);
};

/**
 * Get funds by asset class
 */
export const getFundsByAssetClass = (assetClass: AssetClass): Fund[] => {
  return MOCK_FUNDS.filter((fund) => fund.assetClass === assetClass);
};

// Re-export for convenience
export type { AssetClass } from "../types/investment";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { LoanFundAllocation } from "../../types/loan";

interface InvestmentBreakdownTableProps {
  allocations: LoanFundAllocation[];
  totalLabel?: string;
  totalAmount: number;
  className?: string;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

/**
 * Table for loan source allocation. Total must match loan amount.
 */
export function InvestmentBreakdownTable({
  allocations,
  totalLabel = "Total",
  totalAmount,
  className = "",
}: InvestmentBreakdownTableProps) {
  const reduced = useReducedMotion();

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" role="table" aria-label="Investment breakdown">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Fund</th>
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 text-right">Amount</th>
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((row, i) => (
              <motion.tr
                key={row.fundId}
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="border-b border-slate-100 dark:border-slate-700"
              >
                <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{row.fundName}</td>
                <td className="px-4 py-2 tabular-nums text-right text-slate-700 dark:text-slate-300">{formatCurrency(row.amount)}</td>
                <td className="px-4 py-2 tabular-nums text-right text-slate-600 dark:text-slate-400">{row.percentage.toFixed(1)}%</td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-medium dark:border-slate-700 dark:bg-slate-800/80">
              <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{totalLabel}</td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-900 dark:text-slate-100" colSpan={2}>
                {formatCurrency(totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

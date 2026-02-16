import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { PaymentSetupData } from "../../types/loan";

interface BankDetailsFormProps {
  value: PaymentSetupData | null;
  onChange: (data: Partial<PaymentSetupData>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

/**
 * ACH routing + account number. Fully typed, aria labels, keyboard navigable.
 */
export function BankDetailsForm({
  value,
  onChange,
  errors = {},
  disabled = false,
}: BankDetailsFormProps) {
  const reduced = useReducedMotion();
  const routing = value?.routingNumber ?? "";
  const account = value?.accountNumber ?? "";
  const accountType = value?.accountType ?? "checking";

  return (
    <motion.div
      className="space-y-4"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div>
        <label htmlFor="loan-routing" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Routing number
        </label>
        <input
          id="loan-routing"
          type="text"
          inputMode="numeric"
          autoComplete="routing-number"
          value={routing}
          onChange={(e) => onChange({ routingNumber: e.target.value.replace(/\D/g, "").slice(0, 9) })}
          disabled={disabled}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          aria-label="Routing number (9 digits)"
          aria-invalid={!!errors.routingNumber}
          aria-describedby={errors.routingNumber ? "loan-routing-error" : undefined}
        />
        {errors.routingNumber && (
          <p id="loan-routing-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.routingNumber}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="loan-account" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Account number
        </label>
        <input
          id="loan-account"
          type="text"
          inputMode="numeric"
          autoComplete="account-number"
          value={account}
          onChange={(e) => onChange({ accountNumber: e.target.value.replace(/\D/g, "").slice(0, 17) })}
          disabled={disabled}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          aria-label="Account number"
          aria-invalid={!!errors.accountNumber}
          aria-describedby={errors.accountNumber ? "loan-account-error" : undefined}
        />
        {errors.accountNumber && (
          <p id="loan-account-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.accountNumber}
          </p>
        )}
      </div>
      <div>
        <fieldset className="space-y-2" aria-label="Account type">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">Account type</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="loan-account-type"
              value="checking"
              checked={accountType === "checking"}
              onChange={() => onChange({ accountType: "checking" })}
              disabled={disabled}
              className="rounded-full border-slate-300 text-blue-600 focus:ring-blue-500"
              aria-label="Checking"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Checking</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="loan-account-type"
              value="savings"
              checked={accountType === "savings"}
              onChange={() => onChange({ accountType: "savings" })}
              disabled={disabled}
              className="rounded-full border-slate-300 text-blue-600 focus:ring-blue-500"
              aria-label="Savings"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Savings</span>
          </label>
        </fieldset>
      </div>
    </motion.div>
  );
}

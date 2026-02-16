# Loan Flow Audit — 401(k) Participant Portal

## STEP 1 — FIND EXISTING LOAN FLOW

### Search results

| Term | Location |
|------|----------|
| **Loan** | `BellaScreen.tsx`, `loanApplicationAgent.ts`, `bella/lib/loanCalculator.ts`, `pages/transactions/applications/loan/*`, `TransactionApplicationRouter`, `QuickActions`, `AccountSnapshot`, `RecentTransactions`, `transactionSteps`, types |
| **TakeLoan** | `QuickActions.tsx` — label "Take Loan" (no component name) |
| **LoanFlow** | Not found (no dedicated LoanFlow container) |
| **LoanCalculator** | `src/bella/lib/loanCalculator.ts` — max loan, terms, validation, amortization (monthly only) |
| **TransactionModule** | Not found (transaction flow uses `TransactionApplication` + `TransactionApplicationRouter`) |
| **LoanService** | Not found (no API layer; in-memory `transactionStore` only) |

---

### Entry point

- **Web UI:** `QuickActions` → "Take Loan" links to `/transactions/loan/start`.  
- **Router:** `router.tsx` → `/transactions/:transactionType/start` and `/transactions/:transactionType/:transactionId` render `TransactionApplicationRouter`.  
- **Router behavior:** For `transactionType === "loan"`, `getStepDefinitions("loan")` returns 4 steps; for `/transactions/loan/start` the router creates a draft via `transactionStore.createDraft("loan")` and redirects to `/transactions/loan/:draftId`.  
- **Container:** `TransactionApplication` (generic) with `steps` = EligibilityStep, LoanAmountStep, RepaymentTermsStep, ReviewStep.  
- **Voice:** `BellaScreen.tsx` — loan flow is driven by `loanApplicationAgent.ts` (state machine: START → ELIGIBILITY → RULES → AMOUNT → PURPOSE → TERM → REVIEW → CONFIRMED). Entry: user says they want a loan → `isApplyingForLoan` true, `loanState` set.

---

### Routing

- **Defined in:** `src/app/router.tsx` (createBrowserRouter).  
- **Relevant routes:**  
  - `/transactions/loan/start` → create draft, redirect to `/transactions/loan/:id`  
  - `/transactions/loan/:transactionId` → `TransactionApplicationRouter` → `TransactionApplication` with loan steps.  
- **No dedicated `/loan` route;** loan is one of several transaction types under `/transactions/:transactionType/...`.

---

### State management

- **Transaction (web):** Local only. `TransactionApplication` holds `currentStep` (useState) and `stepData` (useState). No global store for loan form data.  
- **Draft persistence:** `transactionStore` (in-memory) holds draft transaction by id; step data is not persisted to store (only in component state).  
- **Voice (Bella):** `useState<LoanState | null>(loanState)` and related flags in `BellaScreen`; `loanApplicationAgent.getLoanResponse(state, input)` returns next state. No shared store with web loan flow.

---

### API integration

- **None.** `transactionStore` is in-memory. `handleSubmit` in `TransactionApplicationRouter` and `LoanApplication.tsx` only do `console.log(..., { transaction, data })`. No `LoanService` or backend call.

---

### Existing validation

- **Bella / agent:** `bella/lib/loanCalculator.ts`: `validateLoanAmount(amount, maxLoan)`, `validateLoanTerm(termYears)`. Used inside `loanApplicationAgent` at AMOUNT and TERM steps.  
- **Web transaction flow:** Step components are placeholders; no validation. `TransactionStepDefinition` supports optional `validate?: (data: any) => boolean | Promise<boolean>`, but no step defines it.  
- **No** ACH, document, or investment allocation validation.

---

## What exists

- Entry: QuickActions "Take Loan" → `/transactions/loan/start` → draft redirect → `TransactionApplication` with 4 placeholder steps.  
- Routing: Generic transaction routes; loan uses same pattern as other types.  
- State: Local step index + stepData in `TransactionApplication`; no global loan state.  
- Calculator (Bella): `bella/lib/loanCalculator.ts` — `calculateMaxLoan`, `calculateLoanTerms`, `getAmortizationSchedule`, `validateLoanAmount`, `validateLoanTerm`; **monthly payments only** (fixed 12 payments/year).  
- Agent: Full voice flow (eligibility → rules → amount → purpose → term → review → confirm) with validation and refusals.  
- UI: `TransactionFlowStepper`, `DashboardLayout`, `DashboardCard`; Framer Motion used elsewhere (e.g. PersonalizePlanModal, SuccessEnrollmentModal).  
- Data: `accountOverview.ts` has `vestedBalance`, `outstandingLoan`; no plan config object for loan limits.

---

## What is broken

- **Placeholder steps:** EligibilityStep, LoanAmountStep, RepaymentTermsStep, ReviewStep have no real UI or logic (only "will be implemented here" text).  
- **Submit:** `onSubmit` uses `any` and `console.log`; no submission, no typing.  
- **No eligibility gate:** No pre-check before step 1; no `LoanIneligibleState`.  
- **Missing steps:** No Payment Setup (ACH), Investment Breakdown, Documents/Compliance, or Confirmation step.  
- **Calculator:** Monthly only; no biweekly/semimonthly, no origination fee, no payoff date or net disbursement.  
- **Limits:** IRS max/min/term hardcoded in `bella/lib/loanCalculator.ts`; not plan-config-driven.  
- **No validation:** No step-level validation; user can click Next through empty/invalid data.

---

## What needs refactor

- **Centralize calculator:** Single `utils/loanCalculator.ts` with payroll frequency, origination fee, full amortization, payoff date, net disbursement; used by both web and (optionally) Bella.  
- **Plan-driven limits:** Min/max amount, term, fees from plan config (or feature flags), not only constants.  
- **Replace with 6-step flow:** LoanBasicsStep, PaymentSetupStep, InvestmentBreakdownStep, DocumentsComplianceStep, LoanReviewStep, ConfirmationStep; internal step state in a dedicated LoanFlow container.  
- **Validation:** Per-step validators; block Next until valid; typed step data (no `any`).  
- **Eligibility:** `services/loanEligibility.ts` + `LoanIneligibleState` before step 1.  
- **Remove:** All `console.log` from submit path; type `onSubmit` and step data.

---

## What can be reused

- **Transaction routing & draft:** `TransactionApplicationRouter`, `transactionStore.createDraft("loan")`, and `/transactions/loan/:id` pattern.  
- **Transaction type:** `Transaction` and `TransactionType` from `types/transactions.ts`.  
- **Calculator core:** `bella/lib/loanCalculator.ts` — reuse and extend `calculateMaxLoan`, `validateLoanAmount`, `validateLoanTerm`, amortization logic (generalize to payment frequency).  
- **Layout:** `DashboardLayout`, `DashboardHeader`, `DashboardCard`; existing transaction-application CSS classes.  
- **Motion:** Framer Motion + `useReducedMotion` pattern from existing components.  
- **Config:** Extend `config/transactionSteps.ts` for 6 loan steps, or keep loan steps in a loan-specific config used by LoanFlow.

---

## New folder structure (implemented)

```
src/
  types/
    loan.ts                    # Loan flow types (step data, eligibility, plan config)
  config/
    loanPlanConfig.ts          # Plan-driven limits (DEFAULT_LOAN_PLAN_CONFIG)
  utils/
    loanCalculator.ts          # Full calculator (frequency, fee, amortization, payoff, netDisbursement)
    loanValidation.ts          # Per-step validators
  services/
    loanEligibility.ts         # checkLoanEligibility(user, plan, account)
  components/
    loan/
      index.ts
      LoanStepLayout.tsx
      LoanSummaryCard.tsx
      LoanProgressStepper.tsx
      LoanAmountSlider.tsx
      AmortizationTable.tsx
      InvestmentBreakdownTable.tsx
      DocumentUploadCard.tsx
      BankDetailsForm.tsx
      DisclosureAccordion.tsx
      LoanReviewSection.tsx
      LoanIneligibleState.tsx
      steps/
        LoanBasicsStep.tsx
        PaymentSetupStep.tsx
        InvestmentBreakdownStep.tsx
        DocumentsComplianceStep.tsx
        LoanReviewStep.tsx
        ConfirmationStep.tsx
  pages/
    transactions/
      applications/
        LoanFlow.tsx           # Parent container (internal step state, 6 steps)
        TransactionApplicationRouter.tsx  # Other transaction types
```

Routing: `/transactions/loan/start` and `/transactions/loan/:transactionId` render `LoanFlow` (router.tsx). Loan "Take Loan" → start → create draft → redirect to `/transactions/loan/:draftId`.

Bella and voice flow can continue using `bella/agents/loanApplicationAgent.ts` and `bella/lib/loanCalculator.ts` (or later switch to shared `utils/loanCalculator.ts`).

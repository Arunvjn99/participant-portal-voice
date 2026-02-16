import { useCallback } from "react";
import type { LoanFlowData, LoanPlanConfig, LoanDocumentMeta } from "../../../types/loan";
import { LoanStepLayout, LoanSummaryCard, DocumentUploadCard, DisclosureAccordion } from "../index";
import { DEFAULT_LOAN_PLAN_CONFIG } from "../../../config/loanPlanConfig";

interface DocumentsComplianceStepProps {
  data: LoanFlowData;
  onDataChange: (patch: Partial<LoanFlowData>) => void;
  planConfig: LoanPlanConfig;
  userMarried?: boolean;
}

export function DocumentsComplianceStep({
  data,
  onDataChange,
  planConfig,
  userMarried = false,
}: DocumentsComplianceStepProps) {
  const config = planConfig ?? DEFAULT_LOAN_PLAN_CONFIG;
  const basics = data.basics;
  const documents = data.documents ?? {
    documents: [],
    acknowledgments: { terms: false, disclosure: false },
  };

  const requiredTypes: string[] = ["LoanAgreement"];
  if (basics?.loanPurpose === "Residential") requiredTypes.push("PurchaseAgreement");
  if (basics?.loanPurpose === "Hardship") requiredTypes.push("HardshipDocument");
  if (config.requiresSpousalConsent && userMarried) requiredTypes.push("SpousalConsent");

  const handleFiles = useCallback(
    (type: string) => (files: File[]) => {
      const newDocs: LoanDocumentMeta[] = files.map((f, i) => ({
        id: `${type}-${Date.now()}-${i}`,
        type,
        name: f.name,
        size: f.size,
        uploadedAt: new Date().toISOString(),
      }));
      const existing = documents.documents.filter((d) => d.type !== type);
      onDataChange({
        documents: {
          ...documents,
          documents: [...existing, ...newDocs],
        },
      });
    },
    [documents, onDataChange]
  );

  const summaryRows = basics
    ? [
        { label: "Loan amount", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(basics.loanAmount) },
        { label: "Purpose", value: basics.loanPurpose ?? "General" },
      ]
    : [];

  return (
    <LoanStepLayout sidebar={summaryRows.length > 0 ? <LoanSummaryCard title="Summary" rows={summaryRows} /> : undefined}>
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Documents</h2>
          <div className="space-y-4">
            <DocumentUploadCard
              documentType="Loan agreement"
              required
              onFilesAccepted={handleFiles("LoanAgreement")}
              accepted={documents.documents.filter((d) => d.type === "LoanAgreement")}
            />
            {basics?.loanPurpose === "Residential" && (
              <DocumentUploadCard
                documentType="Purchase agreement"
                required
                onFilesAccepted={handleFiles("PurchaseAgreement")}
                accepted={documents.documents.filter((d) => d.type === "PurchaseAgreement")}
              />
            )}
            {basics?.loanPurpose === "Hardship" && (
              <DocumentUploadCard
                documentType="Hardship document"
                required
                onFilesAccepted={handleFiles("HardshipDocument")}
                accepted={documents.documents.filter((d) => d.type === "HardshipDocument")}
              />
            )}
            {config.requiresSpousalConsent && userMarried && (
              <DocumentUploadCard
                documentType="Spousal consent"
                required
                onFilesAccepted={handleFiles("SpousalConsent")}
                accepted={documents.documents.filter((d) => d.type === "SpousalConsent")}
              />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Compliance acknowledgments</h2>
          <DisclosureAccordion
            items={[
              {
                id: "terms",
                title: "Loan terms and conditions",
                content: "By checking below you acknowledge that you have read and agree to the loan terms and conditions.",
                defaultOpen: true,
              },
              {
                id: "disclosure",
                title: "Disclosure",
                content: "You understand that repayment is through payroll deduction and that leaving employment may require immediate repayment.",
              },
            ]}
          />
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={documents.acknowledgments.terms ?? false}
                onChange={(e) =>
                  onDataChange({
                    documents: {
                      ...documents,
                      acknowledgments: { ...documents.acknowledgments, terms: e.target.checked },
                    },
                  })
                }
                aria-label="I agree to the loan terms and conditions"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">I agree to the loan terms and conditions.</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={documents.acknowledgments.disclosure ?? false}
                onChange={(e) =>
                  onDataChange({
                    documents: {
                      ...documents,
                      acknowledgments: { ...documents.acknowledgments, disclosure: e.target.checked },
                    },
                  })
                }
                aria-label="I acknowledge the disclosure"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">I acknowledge the disclosure.</span>
            </label>
          </div>
        </div>
      </div>
    </LoanStepLayout>
  );
}

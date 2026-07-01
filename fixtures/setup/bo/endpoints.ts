export const BO_ENDPOINTS = {
  invoiceListing: "/invoices?",
  createInvoice: "/invoices?agency=",
  referenceSearch: "/invoices/internal-references/search?",
  referenceSearchAdf: "/invoices/internal-references/search?referenceType=ADF",
  referenceSearchContract:
    "/invoices/internal-references/search?referenceType=CT",
  saveAsDraft: "/save-as-draft",
} as const;

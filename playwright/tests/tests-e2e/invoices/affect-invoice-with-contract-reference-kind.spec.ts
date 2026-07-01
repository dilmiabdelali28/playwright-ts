import fs from "node:fs";
import path from "node:path";

import { TEST_CONFIG } from "@helpers/common/test-config";

import { createBoApiContext, setupInvoiceWithContract } from "$fixtures/setup";

import { test } from "../../../helpers/auth/session.fixture";
import {
  BoInvoicePage,
  formatFrDate,
} from "../../../pages/invoice/bo-invoice.page";

// Source migration: invoices/affectInvoiceWithContractReferenceKind.feature
// Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

type ContractScenario = {
  title: string;
  paymentMeans: "TRANSFER" | "SELF_PRINTED_CHECK" | "DIRECT_DEBIT";
  creditNote?: boolean;
  shouldAccount?: boolean;
  setDebitDate?: boolean;
};

const scenarios: ContractScenario[] = [
  {
    title: 'E2E - affect invoice with "contrat virement" as internal reference',
    paymentMeans: "TRANSFER",
    shouldAccount: true,
  },
  {
    title:
      'E2E - affect invoice with "contrat Lettre chèque" as internal reference',
    paymentMeans: "SELF_PRINTED_CHECK",
    shouldAccount: true,
  },
  {
    title:
      'E2E - affect invoice with "contrat Prélèvement" as internal reference',
    paymentMeans: "DIRECT_DEBIT",
    setDebitDate: true,
  },
  {
    title:
      'E2E - count invoice "Avoir" with "contrat virement" as internal reference',
    paymentMeans: "TRANSFER",
    creditNote: true,
    shouldAccount: true,
  },
  {
    title:
      'E2E - count invoice "Avoir" with "contrat Lettre chèque" as internal reference',
    paymentMeans: "SELF_PRINTED_CHECK",
    creditNote: true,
    shouldAccount: true,
  },
];

for (const scenario of scenarios) {
  test(
    scenario.title,
    { tag: ["@bo", "@invoice", "@copro", "@smoke"] },
    async ({ sessionFor, boUser, boAccessToken }) => {
      const sofian = await sessionFor("bo:sofian");
      const invoicePage = new BoInvoicePage(sofian);
      const pdfPath = path.resolve(TEST_CONFIG.fixturesDir, "pdf/minimal.pdf");
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`Missing invoice fixture file: ${pdfPath}`);
      }

      const invoiceFixture =
        await test.step("Create invoice fixture with contract", async () =>
          setupInvoiceWithContract(
            createBoApiContext(
              sofian.request,
              boUser.boApiBaseUrl,
              boAccessToken,
            ),
            {
              origin: "MANUAL",
              paymentMeans: scenario.paymentMeans,
              amountTTC: "100",
              amountHT: "90",
            },
          ));

      await test.step("Create new invoice from upload + select contract reference", async () => {
        await invoicePage.openReceivedInvoicesDashboard();
        await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);
        const created = await invoicePage.createInvoiceFromPdf(pdfPath);
        if (!created) {
          throw new Error("Invoice creation entrypoint is not available.");
        }
        await invoicePage.fillBaseFields(
          `AutoPW-CT-${Date.now()}`,
          formatFrDate(new Date()),
        );
        await invoicePage.selectReferenceKind("Contrat");
        const selected = await invoicePage.selectReferenceTarget(
          invoiceFixture.contractNumber,
          "CT",
        );
        if (!selected) {
          throw new Error("Unable to select contract internal reference.");
        }
      });

      await test.step("Apply scenario-specific fields", async () => {
        await invoicePage.fillInvoiceAmounts("100", "90");
        if (scenario.creditNote) {
          await invoicePage.setCreditNote();
        }
        if (scenario.setDebitDate) {
          await invoicePage.setDebitDate(formatFrDate(new Date()));
        }
      });

      await test.step("Verify account button and account when required", async () => {
        const action = await invoicePage.assertPrimaryInvoiceActionVisible();
        if (scenario.shouldAccount) {
          if (action === "account") {
            const accounted = await invoicePage.accountInvoice();
            if (!accounted) {
              throw new Error("Accounting confirmation dialog not available.");
            }
          } else {
            const transferred = await invoicePage.transferInvoiceToManager();
            if (!transferred) {
              throw new Error("Transfer confirmation dialog not available.");
            }
          }
        }
      });
    },
  );
}

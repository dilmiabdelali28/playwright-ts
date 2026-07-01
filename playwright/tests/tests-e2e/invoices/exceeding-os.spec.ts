import fs from "node:fs";
import path from "node:path";

import { TEST_CONFIG } from "@helpers/common/test-config";

import { test } from "../../../helpers/auth/session.fixture";
import {
  BoInvoicePage,
  formatFrDate,
} from "../../../pages/invoice/bo-invoice.page";

// Source migration: invoices/exceedingOS.feature
// Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

const CONTRACT_REFERENCE = "CT00013559";

test(
  "E2E - transfer invoice with exceeding workorder amount above 5%",
  { tag: ["@bo", "@invoice", "@dashboard", "@copro", "@smoke"] },
  async ({ sessionFor }) => {
    // ── Contextes ────────────────────────────────────────────────────────────
    const sofian = await sessionFor("bo:sofian"); // ACCOUNTANT

    const invoicePage = new BoInvoicePage(sofian);
    const pdfPath = path.resolve(TEST_CONFIG.fixturesDir, "pdf/minimal.pdf");
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Missing invoice fixture file: ${pdfPath}`);
    }

    // ── Sofian : création de la facture ──────────────────────────────────────
    await test.step("Sofian opens the received invoices dashboard", async () => {
      await invoicePage.openReceivedInvoicesDashboard();
      await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);
    });

    await test.step("Sofian creates a new invoice and selects the contract reference", async () => {
      await invoicePage.createInvoiceFromPdf(pdfPath);
      await invoicePage.fillBaseFields(
        `AutoPW-EX-${Date.now()}`,
        formatFrDate(new Date()),
      );
      await invoicePage.selectReferenceKind("Contrat");

      // Capture contract amount from the reference search API response
      const contractResponsePromise = sofian.waitForResponse(
        (r) =>
          r
            .url()
            .includes(
              "/invoices/internal-references/search?referenceType=CT",
            ) && r.status() === 200,
        { timeout: TEST_CONFIG.timeouts.long },
      );

      await invoicePage.selectReferenceTarget(CONTRACT_REFERENCE, "CT");

      const contractResponse = await contractResponsePromise;
      const body = (await contractResponse.json()) as Array<{
        amount?: { value?: number };
      }>;
      const contractAmountCents = body[0]?.amount?.value ?? 0;
      if (contractAmountCents === 0) {
        throw new Error(
          `Contract ${CONTRACT_REFERENCE} returned amount=0; check API response.`,
        );
      }
      const contractAmount = contractAmountCents / 100;

      await invoicePage.fillAmountAboveFivePercent(contractAmount);
    });

    // ── Vérification ─────────────────────────────────────────────────────────
    await test.step("The exceeding section is displayed and transfer button is visible", async () => {
      await invoicePage.assertExceedingSectionVisible();
      await invoicePage.assertPrimaryInvoiceActionVisible();
    });
  },
);

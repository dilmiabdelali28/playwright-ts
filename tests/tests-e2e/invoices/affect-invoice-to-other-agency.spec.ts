import fs from "node:fs";
import path from "node:path";

import { loadBoUserFromFixtures } from "@helpers/auth/bo-auth";
import { TEST_CONFIG } from "@helpers/common/test-config";

import { createBoApiContext, setupInvoiceWithContract } from "$fixtures/setup";

import { test } from "../../../helpers/auth/session.fixture";
import { BoInvoicePage } from "../../../pages/invoice/bo-invoice.page";

// Source migration: invoices/affectInvoiceToOtherAgency.feature
// Filter: (@inDev OR @indev) AND not @quarantine

test(
  "E2E - Affect new agency to invoice",
  { tag: ["@bo", "@invoice", "@copro"] },
  async ({ sessionFor, boAccessToken }) => {
    // ── Contextes ────────────────────────────────────────────────────────────
    const sofian = await sessionFor("bo:sofian"); // ACCOUNTANT
    const boUser = loadBoUserFromFixtures("Sofian", TEST_CONFIG.fixturesDir);
    const invoicePage = new BoInvoicePage(sofian);
    const pdfPath = path.resolve(TEST_CONFIG.fixturesDir, "pdf/minimal.pdf");
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Missing invoice fixture file: ${pdfPath}`);
    }

    // ── Setup : création de la facture via fixture ────────────────────────────
    const invoiceFixture = await test.step("Create invoice fixture", async () =>
      setupInvoiceWithContract(
        createBoApiContext(sofian.request, boUser.boApiBaseUrl, boAccessToken),
        {
          origin: "MANUAL",
          paymentMeans: "TRANSFER",
          amountTTC: "100",
          amountHT: "90",
        },
      ));

    // ── Sofian : premier changement de cabinet ────────────────────────────────
    await test.step("Sofian opens the invoice and changes agency to AGENCE DU GRAND PARIS & STATES", async () => {
      await invoicePage.openInvoiceDetail(
        boUser.boBaseUrl,
        invoiceFixture.invoiceId,
      );
      await invoicePage.changeAgency("AGENCE DU GRAND PARIS & STATES");
      await invoicePage.saveAsDraft();
    });

    // ── Sofian : deuxième changement de cabinet ───────────────────────────────
    await test.step("Sofian re-opens the invoice and changes agency to FONCIA AGENCE CENTRALE", async () => {
      await invoicePage.openReceivedInvoicesDashboard();
      await invoicePage.openInvoiceFromReceivedListing(
        invoiceFixture.invoiceId,
        invoiceFixture.invoiceNumber,
      );
      await invoicePage.changeAgency("FONCIA AGENCE CENTRALE");
      await invoicePage.saveAsDraft();
    });

    // ── Vérification ─────────────────────────────────────────────────────────
    await test.step("The invoice appears with FONCIA AGENCE CENTRALE in the received listing", async () => {
      await invoicePage.openReceivedInvoicesDashboard();
      await invoicePage.setAgencyIfVisible("FONCIA AGENCE CENTRALE");
      await invoicePage.openInvoiceFromReceivedListing(
        invoiceFixture.invoiceId,
        invoiceFixture.invoiceNumber,
      );
      await invoicePage.assertCurrentAgency("FONCIA AGENCE CENTRALE");
    });
  },
);

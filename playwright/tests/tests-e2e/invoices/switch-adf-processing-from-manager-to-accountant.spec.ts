import fs from "node:fs";
import path from "node:path";

import { loadBoUserFromFixtures } from "@helpers/auth/bo-auth";
import { TEST_CONFIG } from "@helpers/common/test-config";

import { createBoApiContext, setupAdfReference } from "$fixtures/setup";

import { test } from "../../../helpers/auth/session.fixture";
import { BoEntriesPage } from "../../../pages/invoice/bo-entries.page";
import {
  BoInvoicePage,
  formatFrDate,
} from "../../../pages/invoice/bo-invoice.page";

// Source migration: invoices/SwitchADFProcessingFromManagerToAccountant.feature
// Filter: (@monitoring) AND not @quarantine

test(
  "E2E - Update ADF bloc of the invoice and check it to be saved and accounted",
  { tag: ["@bo", "@invoice", "@dashboard", "@copro", "@monitoring"] },
  async ({ sessionFor, boAccessToken }) => {
    const sofian = await sessionFor("bo:sofian");
    const boUser = loadBoUserFromFixtures("Sofian", TEST_CONFIG.fixturesDir);

    const invoicePage = new BoInvoicePage(sofian);
    const entriesPage = new BoEntriesPage(sofian);
    const pdfPath = path.resolve(TEST_CONFIG.fixturesDir, "pdf/minimal.pdf");
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Missing invoice fixture file: ${pdfPath}`);
    }

    const adfNumber =
      await test.step("Create ADF Externe reference via API", () =>
        setupAdfReference(
          createBoApiContext(
            sofian.request,
            boUser.boApiBaseUrl,
            boAccessToken,
          ),
        ));

    const invoiceNumber = `AutoPW-ADF-${Date.now()}`;

    await test.step("Sofian opens the received invoices dashboard", async () => {
      await invoicePage.openReceivedInvoicesDashboard();
      await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);
    });

    await test.step("Sofian creates a new ADF Externe invoice", async () => {
      await invoicePage.createInvoiceFromPdf(pdfPath);
      await invoicePage.fillBaseFields(invoiceNumber, formatFrDate(new Date()));
      await invoicePage.selectReferenceKind("Appel de fonds externes");
      const selected = await invoicePage.selectReferenceTarget(
        adfNumber,
        "ADF",
      );
      if (!selected) {
        throw new Error("Unable to select ADF internal reference.");
      }
    });

    await test.step("Sofian fills invoice amount and due date", async () => {
      await invoicePage.fillAmountAndDueDate("100", formatFrDate(new Date()));
    });

    await test.step("Sofian accounts the invoice", async () => {
      const confirmed = await invoicePage.accountInvoice();
      if (!confirmed) {
        throw new Error("Accounting confirmation dialog not available.");
      }
    });

    await test.step("The invoice appears in the accounting-entered dashboard", async () => {
      await entriesPage.goto();
      await entriesPage.assertInvoiceAccounted(invoiceNumber);
    });
  },
);

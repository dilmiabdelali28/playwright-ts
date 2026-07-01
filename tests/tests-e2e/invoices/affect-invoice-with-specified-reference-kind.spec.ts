import fs from "node:fs";
import path from "node:path";

import { TEST_CONFIG } from "@helpers/common/test-config";

import { createBoApiContext, setupAdfReference } from "$fixtures/setup";

import { expect, test } from "../../../helpers/auth/session.fixture";
import {
  BoInvoicePage,
  formatFrDate,
} from "../../../pages/invoice/bo-invoice.page";

// Source migration: invoices/affectInvoiceWithSpecifiedReferenceKind.feature
// Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

test(
  'E2E - count invoice with "contrat" as reference kind',
  { tag: ["@bo", "@invoice", "@copro", "@smoke"] },
  async ({ sessionFor }) => {
    const sofian = await sessionFor("bo:sofian");
    const invoicePage = new BoInvoicePage(sofian);
    const pdfPath = path.resolve(TEST_CONFIG.fixturesDir, "pdf/minimal.pdf");
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Missing invoice fixture file: ${pdfPath}`);
    }

    await invoicePage.openReceivedInvoicesDashboard();
    await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);
    const created = await invoicePage.createInvoiceFromPdf(pdfPath);
    if (!created) {
      throw new Error("Invoice creation entrypoint is not available.");
    }
    await invoicePage.fillBaseFields(
      `AutoPW-Specified-CT-${Date.now()}`,
      formatFrDate(new Date()),
    );
    await invoicePage.selectReferenceKind("Contrat");
    const selected = await invoicePage.selectReferenceTarget("CT", "CT");
    if (!selected) {
      throw new Error("Unable to select contract internal reference.");
    }
    await invoicePage.fillInvoiceAmounts("40", "36");
    await invoicePage.assertPrimaryInvoiceActionVisible();
  },
);

test(
  'E2E - count invoice with "Appel de fonds externes" as reference kind',
  { tag: ["@bo", "@invoice", "@copro", "@smoke"] },
  async ({ sessionFor, boUser, boAccessToken }) => {
    const sofian = await sessionFor("bo:sofian");
    const invoicePage = new BoInvoicePage(sofian);
    const pdfPath = path.resolve(TEST_CONFIG.fixturesDir, "pdf/minimal.pdf");
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Missing invoice fixture file: ${pdfPath}`);
    }

    const adfNumber = await test.step("Create ADF reference fixture", () =>
      setupAdfReference(
        createBoApiContext(sofian.request, boUser.boApiBaseUrl, boAccessToken),
      ));

    await test.step("When I open the received invoices dashboard", async () => {
      const opened = await invoicePage.openReceivedInvoicesDashboard();
      expect(
        opened,
        "Factures menu not available for current user.",
      ).toBeTruthy();
      await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);
    });

    await test.step("When I upload a PDF to create an invoice", async () => {
      const created = await invoicePage.createInvoiceFromPdf(pdfPath);
      expect(
        created,
        "Invoice creation entrypoint not available.",
      ).toBeTruthy();
    });

    await test.step("When I fill the invoice base fields", async () => {
      await invoicePage.fillBaseFields(
        `AutoPW-Specified-ADF-${Date.now()}`,
        formatFrDate(new Date()),
      );
    });

    await test.step("When I select ADF as reference kind and target", async () => {
      await invoicePage.selectReferenceKind("Appel de fonds externes");
      const selected = await invoicePage.selectReferenceTarget(
        adfNumber,
        "ADF",
      );
      expect(
        selected,
        "No ADF reference available or reference target is disabled.",
      ).toBeTruthy();
    });

    await test.step("When I fill the amount and due date", async () => {
      await invoicePage.fillAmountAndDueDate("100", formatFrDate(new Date()));
    });

    await test.step("Then the primary invoice action is visible", async () => {
      await invoicePage.assertPrimaryInvoiceActionVisible();
    });
  },
);

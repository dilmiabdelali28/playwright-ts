import fs from "node:fs";
import path from "node:path";

import { TEST_CONFIG } from "@helpers/common/test-config";

import { createBoApiContext, setupAdfReference } from "$fixtures/setup";

import { expect, test } from "../../../helpers/auth/session.fixture";
import {
  BoInvoicePage,
  formatFrDate,
} from "../../../pages/invoice/bo-invoice.page";

// Source migration: invoices/affectInvoiceWithADFReferenceKind.feature
// Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

test(
  "E2E - account invoice with ADF externe as internal reference",
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
        `AutoPW-ADF-${Date.now()}`,
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

    await test.step("Then the invoice is accounted successfully", async () => {
      const confirmed = await invoicePage.accountInvoice();
      expect(
        confirmed,
        "Accounting confirmation dialog not available.",
      ).toBeTruthy();
    });
  },
);

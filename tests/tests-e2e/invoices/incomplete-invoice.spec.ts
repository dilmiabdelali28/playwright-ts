import fs from "node:fs";
import path from "node:path";

import { loadPlaywrightAdbUser } from "@helpers/auth/adb-login";
import { getOktaAccessTokenWithRetry } from "@helpers/auth/bo-auth";
import { TEST_CONFIG } from "@helpers/common/test-config";

import { createAdbApiContext, setupIncidentWorkorder } from "$fixtures/setup";

import { test } from "../../../helpers/auth/session.fixture";
import { AdbPortfolioInvoicePage } from "../../../pages/adb/portfolio-invoice.page";
import {
  BoInvoicePage,
  formatFrDate,
} from "../../../pages/invoice/bo-invoice.page";

// Source migration: invoices/incompleteInvoice.feature
// Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

// Seed IDs from dev1 dataset (copro building)
const SEED = {
  supplierId: "5e5db02c91b57c8259795815",
  expenseTypeId: "5e5dafdde9e68082cdfdde8d",
  buildingId: "5e5db02d00f3a5d6687b0a73",
  allocationKeyId: "652fd26cc0565420bcad3754",
  budgetId: "690ba874a6b99f76ebd33626",
  // Foncia reference codes used for BO UI search
  supplierRef: "400002387",
  buildingRef: "500178298",
} as const;

test.describe("incomplete invoice", () => {
  test(
    "E2E - create and treat incomplete invoice",
    { tag: ["@bo", "@invoice", "@copro", "@smoke"] },
    async ({ sessionFor }) => {
      // ── Contextes ──────────────────────────────────────────────────────────
      const celine = await sessionFor("adb:celine"); // COPRO_MANAGER
      const sofian = await sessionFor("bo:sofian"); // ACCOUNTANT

      const invoicePage = new BoInvoicePage(sofian);
      const portfolioPage = new AdbPortfolioInvoicePage(celine);

      const pdfPath = path.resolve(TEST_CONFIG.fixturesDir, "pdf/minimal.pdf");
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`Missing invoice fixture file: ${pdfPath}`);
      }

      // Shared invoice number so Celine can find what Sofian created
      const invoiceNumber = `AutoPW-INC-${Date.now()}`;

      // ── Celine : création de la mission d'incident avec OS ─────────────────
      const workorderNumber =
        await test.step("Celine creates an incident mission with workorder via API", async () => {
          const adbUser = loadPlaywrightAdbUser(
            "Celine",
            TEST_CONFIG.fixturesDir,
          );
          const celineToken = await getOktaAccessTokenWithRetry(celine);
          if (!celineToken) {
            throw new Error("Unable to resolve ADB access token for Celine.");
          }

          const number = await setupIncidentWorkorder(
            createAdbApiContext(
              celine.request,
              adbUser.adbApiBaseUrl,
              celineToken,
            ),
            {
              supplierId: SEED.supplierId,
              expenseTypeId: SEED.expenseTypeId,
              buildingId: SEED.buildingId,
              allocationKeyId: SEED.allocationKeyId,
              budgetId: SEED.budgetId,
            },
          );
          if (!number) {
            throw new Error("Workorder creation failed.");
          }
          return number;
        });

      // ── Sofian : création et transfert d'une facture incomplète ───────────
      await test.step("Sofian opens the received invoices dashboard", async () => {
        await invoicePage.openReceivedInvoicesDashboard();
        await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);
      });

      await test.step("Sofian creates an incomplete invoice without reference and transfers it to copro manager", async () => {
        await invoicePage.createInvoiceFromPdf(pdfPath);
        await invoicePage.fillBaseFields(
          invoiceNumber,
          formatFrDate(new Date()),
        );
        await invoicePage.setSupplierBySearch(SEED.supplierRef);
        await invoicePage.setBuildingBySearch(SEED.buildingRef);
        await invoicePage.fillInvoiceAmounts("193", "174");
        const transferred = await invoicePage.transferInvoiceToManager();
        if (!transferred) {
          throw new Error("Transfer confirmation dialog not available.");
        }
      });

      // ── Celine : traitement de la facture incomplète ──────────────────────
      await test.step("Celine finds the incomplete invoice in her ADB portfolio", async () => {
        await portfolioPage.gotoToHandle();
        await portfolioPage.openIncompleteInvoice(invoiceNumber);
      });

      await test.step("Celine verifies the invoice amounts", async () => {
        await portfolioPage.assertAmounts("193", "174");
      });

      await test.step("Celine selects the OS reference to complete the invoice", async () => {
        await portfolioPage.selectReferenceKind("Ordre de service");
        const selected =
          await portfolioPage.selectReferenceTarget(workorderNumber);
        if (!selected) {
          throw new Error(
            `Unable to select OS reference ${workorderNumber} on incomplete invoice.`,
          );
        }
      });

      await test.step("Celine saves and counts the invoice", async () => {
        await portfolioPage.saveAndCount();
      });

      // ── Vérification finale ───────────────────────────────────────────────
      await test.step("The invoice is processed in the portfolio listing", async () => {
        await portfolioPage.goto();
        await portfolioPage.assertInvoiceProcessed();
      });
    },
  );

  test(
    "E2E - create incomplete invoice",
    { tag: ["@bo", "@invoice", "@copro", "@smoke"] },
    async ({ sessionFor }) => {
      // ── Contextes ──────────────────────────────────────────────────────────
      const sofian = await sessionFor("bo:sofian"); // ACCOUNTANT

      const invoicePage = new BoInvoicePage(sofian);
      const pdfPath = path.resolve(TEST_CONFIG.fixturesDir, "pdf/minimal.pdf");
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`Missing invoice fixture file: ${pdfPath}`);
      }

      // ── Sofian : création d'une facture sans type de référence ────────────
      await test.step("Sofian opens the received invoices dashboard", async () => {
        await invoicePage.openReceivedInvoicesDashboard();
        await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);
      });

      await test.step("Sofian creates a new invoice without reference kind", async () => {
        await invoicePage.createInvoiceFromPdf(pdfPath);
        await invoicePage.fillBaseFields(
          `AutoPW-INC-${Date.now()}`,
          formatFrDate(new Date()),
        );
        await invoicePage.setSupplierBySearch(SEED.supplierRef);
        await invoicePage.setBuildingBySearch(SEED.buildingRef);
        await invoicePage.fillInvoiceAmounts("193", "174");
      });

      await test.step("Sofian transfers the incomplete invoice to copro manager", async () => {
        const transferred = await invoicePage.transferInvoiceToManager();
        if (!transferred) {
          throw new Error("Transfer confirmation dialog not available.");
        }
      });
    },
  );
});

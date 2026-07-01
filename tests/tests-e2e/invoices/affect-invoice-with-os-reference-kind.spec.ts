import fs from "node:fs";
import path from "node:path";

import { loadPlaywrightAdbUser } from "@helpers/auth/adb-login";
import { getOktaAccessTokenWithRetry } from "@helpers/auth/bo-auth";
import { TEST_CONFIG } from "@helpers/common/test-config";

import {
  createAdbApiContext,
  setupIncidentWorkorder,
  setupRepairWorkorder,
} from "$fixtures/setup";

import { expect, test } from "../../../helpers/auth/session.fixture";
import { AdbPortfolioInvoicePage } from "../../../pages/adb/portfolio-invoice.page";
import {
  BoInvoicePage,
  formatFrDate,
} from "../../../pages/invoice/bo-invoice.page";

type IncidentScenario = {
  title: string;
  supplierId: string;
  expenseTypeId: string;
  buildingId: string;
  allocationKeyId: string;
  budgetId: string;
  creditNote?: boolean;
};

const incidentScenarios: IncidentScenario[] = [
  {
    title:
      'E2E - affect invoice with "ordre de service Dépannage et réparation" whose supplier type is "virement"',
    supplierId: "5e5db02cdea6cf7a23794f15",
    expenseTypeId: "5e5dafddddc3915ebbfdde32",
    buildingId: "5e5db02d00f3a5d6687b0a73",
    allocationKeyId: "652fd26cc0565420bcad3754",
    budgetId: "65af9b9be35f7333b53c3733",
  },
  {
    title:
      'E2E - affect invoice with "ordre de service Dépannage et réparation" whose supplier type is "Lettre chèque"',
    supplierId: "5e5db02c6e4e9e0ab2794f07",
    expenseTypeId: "5e5dafddddc3915ebbfdde32",
    buildingId: "5e5db02d00f3a5d6687b0a73",
    allocationKeyId: "652fd26cc0565420bcad3754",
    budgetId: "65af9b9be35f7333b53c3733",
  },
  {
    title:
      'E2E - affect invoice "Avoir" with "ordre de service Dépannage et réparation" whose supplier type is "virement"',
    supplierId: "5e5db02cdea6cf7a23794f15",
    expenseTypeId: "5e5dafddddc3915ebbfdde32",
    buildingId: "5e5db02d00f3a5d6687b0a73",
    allocationKeyId: "652fd26cc0565420bcad3754",
    budgetId: "65af9b9be35f7333b53c3733",
    creditNote: true,
  },
  {
    title:
      'E2E - affect invoice "Avoir" with "ordre de service Dépannage et réparation" whose supplier type is "Lettre chèque"',
    supplierId: "5e5db02c6e4e9e0ab2794f07",
    expenseTypeId: "5e5dafddddc3915ebbfdde32",
    buildingId: "5e5db02d00f3a5d6687b0a73",
    allocationKeyId: "652fd26cc0565420bcad3754",
    budgetId: "65af9b9be35f7333b53c3733",
    creditNote: true,
  },
];

test.describe("affect invoice with all OS types", () => {
  // Source migration: invoices/affectInvoiceWithOSReferenceKind.feature
  // Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

  test(
    'E2E - affect invoice with "ordre de service travaux" whose supplier type is "virement"',
    { tag: ["@smoke"] },
    async ({ sessionFor }) => {
      // Tags: @smoke
      const invoiceNumber = `AutoPW-OS-${Date.now()}`;
      const travauxSupplierId = "5e5db02cdea6cf7a23794f15";
      const codificationBudget = "Travaux à réaliser - RAVALEMENT FACADE RUE";
      const codificationAmount = 50;

      const workorder =
        await test.step("Create repair mission workorder in ADB", async () => {
          const celine = await sessionFor("adb:celine");
          const adbUser = loadPlaywrightAdbUser(
            "Celine",
            TEST_CONFIG.fixturesDir,
          );
          const adbAccessToken = await getOktaAccessTokenWithRetry(celine);
          if (!adbAccessToken) {
            throw new Error("Unable to resolve ADB access token for Celine.");
          }
          return setupRepairWorkorder(
            createAdbApiContext(
              celine.request,
              adbUser.adbApiBaseUrl,
              adbAccessToken,
            ),
            { supplierId: travauxSupplierId },
          );
        });

      expect(workorder.number).toBeTruthy();

      await test.step("Create BO invoice and affect it to manager", async () => {
        const sofian = await sessionFor("bo:sofian");
        const invoicePage = new BoInvoicePage(sofian);
        const pdfPath = path.resolve(
          TEST_CONFIG.fixturesDir,
          "pdf/minimal.pdf",
        );
        if (!fs.existsSync(pdfPath)) {
          throw new Error(`Missing invoice fixture file: ${pdfPath}`);
        }

        const opened = await invoicePage.openReceivedInvoicesDashboard();
        if (!opened) {
          throw new Error("Factures menu not available for current user.");
        }

        await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);

        const created = await invoicePage.createInvoiceFromPdf(pdfPath);
        if (!created) {
          throw new Error("Invoice creation entrypoint is not available.");
        }

        await invoicePage.fillBaseFields(
          invoiceNumber,
          formatFrDate(new Date()),
        );
        await invoicePage.selectReferenceKind("Ordre de service");

        const selected = await invoicePage.selectReferenceTarget(
          workorder.number,
          "OS",
        );
        if (!selected) {
          throw new Error(
            `Unable to select OS internal reference for workorder ${workorder.number}.`,
          );
        }

        // The ADB codification step splits the invoice over two lines of 50
        // each (TTC and HT), so the invoice totals must be 100/100 for the
        // "Enregistrer" button to enable.
        await invoicePage.fillInvoiceAmounts("100", "100");

        const action = await invoicePage.assertPrimaryInvoiceActionVisible();
        expect(action).toBe("affect");

        const affected = await invoicePage.affectInvoiceToManager();
        expect(affected).toBeTruthy();
      });

      const debtorNumber =
        await test.step("Complete the invoice codification and count it in ADB", async () => {
          const celine = await sessionFor("adb:celine");
          const portfolioPage = new AdbPortfolioInvoicePage(celine);

          await portfolioPage.gotoToHandle();
          await portfolioPage.openIncompleteInvoice(invoiceNumber);
          await portfolioPage.addCodificationLine(
            codificationBudget,
            codificationAmount,
          );
          return portfolioPage.saveAndCountCodification();
        });

      expect(debtorNumber).toBeTruthy();

      await test.step("Verify the OS accounting lines in BO", async () => {
        const sofian = await sessionFor("bo:sofian");
        const invoicePage = new BoInvoicePage(sofian);

        await invoicePage.goToAccountingEntries();
        await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);
        await invoicePage.filterAccountingLinesByOs(
          debtorNumber,
          workorder.label,
        );
        await invoicePage.assertOsAccountingLines(debtorNumber);
      });
    },
  );

  for (const scenario of incidentScenarios) {
    test(scenario.title, { tag: ["@smoke"] }, async ({ sessionFor }) => {
      // Tags: @smoke

      const workorderNumber =
        await test.step("Create incident mission workorder in ADB", async () => {
          const celine = await sessionFor("adb:celine");
          const adbUser = loadPlaywrightAdbUser(
            "Celine",
            TEST_CONFIG.fixturesDir,
          );
          const adbAccessToken = await getOktaAccessTokenWithRetry(celine);
          if (!adbAccessToken) {
            throw new Error("Unable to resolve ADB access token for Celine.");
          }
          return setupIncidentWorkorder(
            createAdbApiContext(
              celine.request,
              adbUser.adbApiBaseUrl,
              adbAccessToken,
            ),
            {
              supplierId: scenario.supplierId,
              expenseTypeId: scenario.expenseTypeId,
              buildingId: scenario.buildingId,
              allocationKeyId: scenario.allocationKeyId,
              budgetId: scenario.budgetId,
            },
          );
        });

      expect(workorderNumber).toBeTruthy();

      await test.step("Create BO invoice and transfer it to manager", async () => {
        const sofian = await sessionFor("bo:sofian");
        const invoicePage = new BoInvoicePage(sofian);
        const pdfPath = path.resolve(
          TEST_CONFIG.fixturesDir,
          "pdf/minimal.pdf",
        );
        if (!fs.existsSync(pdfPath)) {
          throw new Error(`Missing invoice fixture file: ${pdfPath}`);
        }

        const opened = await invoicePage.openReceivedInvoicesDashboard();
        if (!opened) {
          throw new Error("Factures menu not available for current user.");
        }

        await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);

        const created = await invoicePage.createInvoiceFromPdf(pdfPath);
        if (!created) {
          throw new Error("Invoice creation entrypoint is not available.");
        }

        await invoicePage.fillBaseFields(
          `AutoPW-OS-${Date.now()}`,
          formatFrDate(new Date()),
        );
        await invoicePage.selectReferenceKind("Ordre de service");

        const selected = await invoicePage.selectReferenceTarget(
          workorderNumber,
          "OS",
        );
        if (!selected) {
          throw new Error(
            `Unable to select OS internal reference for workorder ${workorderNumber}.`,
          );
        }

        if (scenario.creditNote) {
          await invoicePage.setCreditNote();
        }

        await invoicePage.fillInvoiceAmounts("100", "90");

        const action = await invoicePage.assertPrimaryInvoiceActionVisible();
        expect(action).toBe("affect");

        const affected = await invoicePage.affectInvoiceToManager();
        expect(affected).toBeTruthy();
      });
    });
  }
});

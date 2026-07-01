import fs from "node:fs";
import path from "node:path";

import { TEST_CONFIG } from "@helpers/common/test-config";

import { test } from "../../../helpers/auth/session.fixture";
import { AdbContractPage } from "../../../pages/adb/contract.page";
import { BoEntriesPage } from "../../../pages/invoice/bo-entries.page";
import {
  BoInvoicePage,
  formatFrDate,
} from "../../../pages/invoice/bo-invoice.page";

// Source migration: invoices/affectInvoiceInfullPropertyManagementBuilding.feature
// Filter: (@monitoring) AND not @quarantine

const FULL_PROPERTY_BUILDING_ID = "5e5db02d10c0c4fe7f7b07b9";

test(
  "E2E - affect invoice with transfer contract to a full property management building",
  { tag: ["@bo", "@invoice", "@dashboard", "@copro", "@monitoring"] },
  async ({ sessionFor }) => {
    // ── Contextes ────────────────────────────────────────────────────────────
    const karine = await sessionFor("adb:karine"); // PROPERTY_MANAGEMENT_MANAGER
    const sofian = await sessionFor("bo:sofian"); // ACCOUNTANT

    const contractPage = new AdbContractPage(karine);
    const invoicePage = new BoInvoicePage(sofian);
    const entriesPage = new BoEntriesPage(sofian);

    const pdfPath = path.resolve(TEST_CONFIG.fixturesDir, "pdf/minimal.pdf");
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Missing invoice fixture file: ${pdfPath}`);
    }

    // ── Karine : création du contrat ─────────────────────────────────────────
    let contractNumber: string;

    await test.step("Karine creates a transfer contract on the full property building", async () => {
      contractNumber = await contractPage.createTransferContract({
        buildingId: FULL_PROPERTY_BUILDING_ID,
      });
    });

    // ── Sofian : affectation de la facture ───────────────────────────────────
    await test.step("Sofian opens the received invoices dashboard", async () => {
      await invoicePage.openReceivedInvoicesDashboard();
      await invoicePage.setAgencyIfVisible("FONCIA AGENCE CENTRALE");
    });

    await test.step("Sofian creates a new invoice with the contract as reference", async () => {
      await invoicePage.createInvoiceFromPdf(pdfPath);
      await invoicePage.fillBaseFields(
        `AutoPW-FPM-${Date.now()}`,
        formatFrDate(new Date()),
      );
      await invoicePage.selectReferenceKind("Contrat");
      const selected = await invoicePage.selectReferenceTarget(
        contractNumber,
        "CT",
      );
      if (!selected) {
        throw new Error("Unable to select contract internal reference.");
      }
      await invoicePage.fillInvoiceAmounts("100", "90");
    });

    await test.step("Sofian accounts the invoice", async () => {
      await invoicePage.assertPrimaryInvoiceActionVisible();
      const confirmed = await invoicePage.accountInvoice();
      if (!confirmed) {
        throw new Error("Accounting confirmation dialog not available.");
      }
    });

    // ── Vérification comptable ───────────────────────────────────────────────
    await test.step("The invoice appears in the accounting entries linked to the contract", async () => {
      await entriesPage.goto();
      await entriesPage.assertInvoiceAttachedToContract(contractNumber);
    });
  },
);

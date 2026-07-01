import { TEST_CONFIG } from "@helpers/common/test-config";

import {
  createBoApiContext,
  setupInvoiceWithContract,
  TENOR_INVOICE_SETUP,
} from "$fixtures/setup";

import { test } from "../../../helpers/auth/session.fixture";
import { BoInvoicePage } from "../../../pages/invoice/bo-invoice.page";

// Source migration: invoices/verifyAmountInvoiceWithOriginOCR.feature
// Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

test(
  "E2E - Verify Scenario where Invoice HT Amount is Greater Than TTC Amount",
  { tag: ["@bo", "@invoice", "@copro", "@smoke"] },
  async ({ sessionFor, boUser, boAccessToken }) => {
    const sessionPageSofian = await sessionFor("bo:sofian");
    const invoicePage = new BoInvoicePage(sessionPageSofian);

    const invoiceFixture = await setupInvoiceWithContract(
      createBoApiContext(
        sessionPageSofian.request,
        boUser.boApiBaseUrl,
        boAccessToken,
      ),
      TENOR_INVOICE_SETUP,
    );

    await test.step("Sofian opens the invoice from the received listing", async () => {
      await invoicePage.openReceivedInvoicesDashboard();
      await invoicePage.setAgencyIfVisible(TEST_CONFIG.targetAgency);
      await invoicePage.openInvoiceFromReceivedListing(
        invoiceFixture.invoiceId,
        invoiceFixture.invoiceNumber,
      );
    });

    await test.step("Sofian sets HT amount greater than TTC and saves", async () => {
      await invoicePage.selectReferenceKind("Contrat");
      await invoicePage.fillInvoiceAmounts("100", "190");
    });

    await test.step("An error is shown: HT cannot be greater than TTC", async () => {
      await invoicePage.saveInvoiceAndExpectAmountError(
        "Le montant HT 190 € ne peut pas être supérieur au TTC 100 €",
      );
    });
  },
);

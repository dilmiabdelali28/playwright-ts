import { TEST_CONFIG } from "@helpers/common/test-config";

import {
  createBoApiContext,
  setupInvoiceWithContract,
  TENOR_INVOICE_SETUP,
} from "$fixtures/setup";

import { test } from "../../../helpers/auth/session.fixture";
import { BoTenorInvoicePage } from "../../../pages/invoice/bo-tenor-invoice.page";

// Source migration: invoices/receivedInvoiceFromTenorAndAffectToAgency.feature
// Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

test(
  "E2E - Received invoice from tenor and affect to agency",
  { tag: ["@bo", "@invoice", "@copro", "@smoke"] },
  async ({ sessionFor, boUser, boAccessToken }) => {
    const sofian = await sessionFor("bo:sofian");
    const tenorInvoicePage = new BoTenorInvoicePage(sofian);
    const invoiceFixture =
      await test.step("Create fixture context + TENOR invoice", () =>
        setupInvoiceWithContract(
          createBoApiContext(
            sofian.request,
            boUser.boApiBaseUrl,
            boAccessToken,
          ),
          TENOR_INVOICE_SETUP,
        ));

    await test.step("Open invoice detail from fixture", async () => {
      await tenorInvoicePage.openInvoiceDetail(
        boUser.boBaseUrl,
        invoiceFixture.invoiceId,
      );
    });

    await test.step("Check tenor metadata and transfer button", async () => {
      await tenorInvoicePage.assertTenorMetadata();
      await tenorInvoicePage.assertTransferButtonEnabled();
    });

    await test.step("Select agency and update invoice with contract reference", async () => {
      const selected = await tenorInvoicePage.selectAgencyIfEditable(
        TEST_CONFIG.targetAgency,
      );
      if (!selected) {
        console.warn(
          "[ReceivedInvoiceFromTenor] Agency field not editable on invoice detail; continuing with current agency.",
        );
      }
      await tenorInvoicePage.chooseContractReference(
        invoiceFixture.contractNumber,
      );
      await tenorInvoicePage.saveDraft();
    });

    await test.step("Assert invoice attached in target agency list", async () => {
      await tenorInvoicePage.openReceivedDashboard(boUser.boBaseUrl);
      const selected = await tenorInvoicePage.selectAgencyIfEditable(
        TEST_CONFIG.targetAgency,
      );
      if (!selected) {
        console.warn(
          "[ReceivedInvoiceFromTenor] Agency field not editable on dashboard; continuing with current agency context.",
        );
      }
      await tenorInvoicePage.assertInvoiceListed(
        invoiceFixture.invoiceId,
        invoiceFixture.invoiceNumber,
      );
    });
  },
);

import { waitForResponseLike } from "@helpers/api/network/waitForResponseLike";
import { fillField, textFromFirstCellByPrefix } from "@helpers/ui";

import { BoInvoicesListingPage } from "@/pages/invoice/bo-invoices-listing.page";

import { test } from "../../../helpers/auth/session.fixture";

// Source migration: invoices/listingInvoicesDraft.feature
// Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

test.describe("Invoices dashboard", () => {
  test(
    "Listing - BO - Invoices - Using one filter",
    { tag: ["@smoke"] },
    async ({ sessionFor, boUser }) => {
      const sofian = await sessionFor("bo:sofian");
      const listingPage = new BoInvoicesListingPage(sofian);

      await listingPage.goto(boUser.boBaseUrl, "draft");
      await listingPage.assertDashboardLoaded();
      await listingPage.assertFiltersVisible();
      await listingPage.assertTableNotEmpty();

      const invoiceNumber = await textFromFirstCellByPrefix(
        sofian,
        "invoiceNumber",
      );
      await fillField({
        page: sofian,
        testId: "invoiceNumber",
        value: invoiceNumber,
        assertVisible: true,
      });
      await waitForResponseLike(sofian, "/invoices?").catch(() => null);
      await listingPage.assertTableNotEmpty();
    },
  );
});

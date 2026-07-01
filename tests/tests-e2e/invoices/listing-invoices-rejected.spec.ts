import { BoInvoicesListingPage } from "@/pages/invoice/bo-invoices-listing.page";

import { test } from "../../../helpers/auth/session.fixture";

// Source migration: invoices/listingInvoicesRejected.feature
// Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

test.describe("Invoices dashboard", () => {
  test(
    "Listing - BO - Invoices - No filter",
    { tag: ["@smoke"] },
    async ({ sessionFor, boUser }) => {
      const sofian = await sessionFor("bo:sofian");
      const listingPage = new BoInvoicesListingPage(sofian);

      await listingPage.goto(boUser.boBaseUrl, "rejected");
      await listingPage.assertDashboardLoaded();
      await listingPage.assertColumnsVisible();
      await listingPage.assertFiltersVisible();
      await listingPage.assertInvoiceTabsVisible();
      await listingPage.assertTableNotEmpty();
    },
  );
});

import { BoInvoicesListingPage } from "@/pages/invoice/bo-invoices-listing.page";

import { test } from "../../../helpers/auth/session.fixture";

// Source migration: invoices/listingInvoicesDeleted.feature
// Filter: (@smoke OR @inDev OR @indev) AND not @quarantine

test.describe("Invoices dashboard", () => {
  test(
    "Listing - BO - Invoices - Using multi filters",
    { tag: ["@smoke"] },
    async ({ sessionFor, boUser }) => {
      const sofian = await sessionFor("bo:sofian");
      const listingPage = new BoInvoicesListingPage(sofian);

      await listingPage.goto(boUser.boBaseUrl, "deleted");
      await listingPage.assertDashboardLoaded();
      await listingPage.assertFiltersVisible();
      await listingPage.assertTableNotEmpty();
      const searchData = await listingPage.captureSearchData();
      await listingPage.applyMultiFilters(searchData);
      await listingPage.assertTableNotEmpty();
    },
  );
});

import {
  CO_OWNER_FILTERS,
  type CoOwnerFilterKey,
  CoOwnerListingPage,
} from "@/pages/adb/customers/co-owner/co-owner-listing.page";

import { test } from "../../../../helpers/auth/session.fixture";

// Source migration: customers/coOwner/listing.feature

test(
  "Listing - Co-owner - No filter",
  { tag: ["@listing", "@copro", "@customer"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const listing = new CoOwnerListingPage(celine);

    await test.step('she goes to the dashboard "portfolio/co-owner"', async () => {
      await listing.goto();
      await listing.waitForCoOwners();
    });

    await test.step("she should see the listing page title", async () => {
      await listing.assertTitle();
    });

    await test.step("she should see table column names", async () => {
      await listing.assertColumns([
        "Identifiant",
        "Compte(s)",
        "Civilité",
        "Nom",
        "Adresse",
        "Téléphone",
        "Email",
      ]);
    });

    await test.step("she should see the listing filters", async () => {
      await listing.assertFilters();
    });

    await test.step("the table should not be empty", async () => {
      await listing.assertTableNotEmpty();
    });
  },
);

test(
  "Listing - Co-owner - Empty list",
  { tag: ["@listing", "@copro", "@customer"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const listing = new CoOwnerListingPage(celine);

    await test.step('she goes to the dashboard "portfolio/co-owner"', async () => {
      await listing.goto();
      await listing.waitForCoOwners();
    });

    await test.step("she searches in listing by invalid id", async () => {
      await listing.fillFilter(
        CO_OWNER_FILTERS.CO_OWNER_CUSTOMER,
        "invalid data",
      );
    });

    await test.step("the table should be empty", async () => {
      await listing.assertTableEmpty();
    });
  },
);

test(
  "Listing - Co-owner - Using one filter",
  { tag: ["@listing", "@copro", "@customer"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const listing = new CoOwnerListingPage(celine);

    const filterKeys: CoOwnerFilterKey[] = [
      "CO_OWNER_CUSTOMER",
      "CO_OWNER_ACCOUNT",
      "CO_OWNER_CIVILITY",
      "CO_OWNER_NAME",
      "CO_OWNER_ADDRESS",
      "CO_OWNER_PHONE",
      "CO_OWNER_EMAIL",
    ];

    await test.step('she goes to the dashboard "portfolio/co-owner"', async () => {
      await listing.goto();
      await listing.waitForCoOwners();
    });

    const item = listing.firstItem;

    await test.step("each listing filter should work independently", async () => {
      for (const key of filterKeys) {
        const filter = CO_OWNER_FILTERS[key];
        const value = filter.fillValue(item);
        if (!value) {
          continue;
        }

        await listing.fillFilter(filter, value);
        if (filter.verifyValue) {
          await listing.assertRowContains(filter.verifyValue(item));
        }
        await listing.clearFilter(filter);
      }
    });
  },
);

test(
  "Listing - Co-owner - Using multi filters",
  { tag: ["@listing", "@copro", "@customer", "@smoke"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const listing = new CoOwnerListingPage(celine);

    const searchKeys: CoOwnerFilterKey[] = [
      "CO_OWNER_CUSTOMER",
      "CO_OWNER_ACCOUNT",
      "CO_OWNER_CIVILITY",
      "CO_OWNER_NAME",
      "CO_OWNER_ADDRESS",
      "CO_OWNER_PHONE",
      "CO_OWNER_EMAIL",
    ];

    const resultKeys: CoOwnerFilterKey[] = [
      "CO_OWNER_CUSTOMER",
      "CO_OWNER_ACCOUNT",
      "CO_OWNER_NAME",
      "CO_OWNER_ADDRESS",
      "CO_OWNER_PHONE",
      "CO_OWNER_EMAIL",
    ];

    await test.step('she goes to the dashboard "portfolio/co-owner"', async () => {
      await listing.goto();
      await listing.waitForCoOwners();
    });

    const item = listing.firstItem;

    await test.step("she searches listing lego by filters", async () => {
      for (const key of searchKeys) {
        const filter = CO_OWNER_FILTERS[key];
        const value = filter.fillValue(item);
        if (value) {
          await listing.fillFilter(filter, value);
        }
      }
    });

    await test.step("she should see the lego listing results", async () => {
      for (const key of resultKeys) {
        const filter = CO_OWNER_FILTERS[key];
        if (filter.verifyValue) {
          await listing.assertRowContains(filter.verifyValue(item));
        }
      }
    });
  },
);

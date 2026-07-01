import { test } from "@helpers/auth/session.fixture";

import {
  UNIT_FILTERS,
  type UnitFilterKey,
  UnitListingPage,
} from "@/pages/adb/units/unit-listing.page";

// Source migration: cypress/functionalTests/estates/units/listing.feature
// Tags: @adb @units @listing

test(
  "Listing - ADB - Units - No filter",
  { tag: ["@adb", "@units", "@listing"] },
  async ({ sessionFor }) => {
    const alexandre = await sessionFor("adb:Alexandre");
    const listing = new UnitListingPage(alexandre);

    await test.step('he goes to the dashboard "portfolio/unit"', async () => {
      await listing.goto();
      await listing.waitForUnits();
    });

    await test.step("he should see the listing page title", async () => {
      await listing.assertTitle();
    });

    await test.step("he should see table column names", async () => {
      await listing.assertColumns([
        "N˚ lot",
        "Adresse",
        "Principal",
        "Surface habitable",
        "Surface imposable",
        "Loi Carrez",
        "Pièces",
        "Type",
      ]);
    });

    await test.step("he should see the listing filters", async () => {
      await listing.assertFilters();
    });

    await test.step("the table should not be empty", async () => {
      await listing.assertTableNotEmpty();
    });
  },
);

test(
  "Listing - ADB - Units - Using one filter",
  { tag: ["@adb", "@units", "@listing"] },
  async ({ sessionFor }) => {
    const alexandre = await sessionFor("adb:Alexandre");
    const listing = new UnitListingPage(alexandre);

    const filterKeys: UnitFilterKey[] = [
      "UNIT_COOWNERSHIP_BY_LAWS_ID",
      "UNIT_ADDRESS",
      "UNIT_TYPE",
    ];

    await test.step('he goes to the dashboard "portfolio/unit"', async () => {
      await listing.goto();
      await listing.waitForUnits();
    });

    const item = listing.firstItem;

    await test.step("each listing filter should work independently", async () => {
      for (const key of filterKeys) {
        const filter = UNIT_FILTERS[key];
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
  "Listing - ADB - Units - Using multi filters",
  { tag: ["@adb", "@units", "@listing", "@smoke"] },
  async ({ sessionFor }) => {
    const alexandre = await sessionFor("adb:Alexandre");
    const listing = new UnitListingPage(alexandre);

    const searchKeys: UnitFilterKey[] = [
      "UNIT_COOWNERSHIP_BY_LAWS_ID",
      "UNIT_ADDRESS",
    ];

    await test.step('he goes to the dashboard "portfolio/unit"', async () => {
      await listing.goto();
      await listing.waitForUnits();
    });

    const item = listing.firstItem;

    await test.step("he searches listing by filters", async () => {
      for (const key of searchKeys) {
        const filter = UNIT_FILTERS[key];
        const value = filter.fillValue(item);
        if (value) {
          await listing.fillFilter(filter, value);
        }
      }
    });

    await test.step("he should see the listing results", async () => {
      for (const key of searchKeys) {
        const filter = UNIT_FILTERS[key];
        if (filter.verifyValue) {
          await listing.assertRowContains(filter.verifyValue(item));
        }
      }
    });
  },
);

import {
  BUILDING_FILTERS,
  BuildingFilterKey,
  BuildingListingPage,
} from "@/pages/adb/building/building-listing.page";

import { test } from "../../../../helpers/auth/session.fixture";

test(
  "Listing - ADB - Buildings - No filter",
  { tag: ["@adb", "@building", "@listing"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const listing = new BuildingListingPage(celine);

    await test.step('she goes to the dashboard "portfolio/building"', async () => {
      await listing.goto();
      await listing.waitForBuildings();
    });

    await test.step("she should see the listing page title", async () => {
      await listing.assertTitle();
    });

    await test.step("she should see table column names", async () => {
      await listing.assertColumns([
        "Type",
        "Identifiant",
        "Adresse",
        "Régime",
        "Gestionnaire",
        "Arrêté comptable",
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
  "Listing - ADB - Buildings - Empty list",
  { tag: ["@adb", "@building", "@listing"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const listing = new BuildingListingPage(celine);

    await test.step('she goes to the dashboard "portfolio/building"', async () => {
      await listing.goto();
      await listing.waitForBuildings();
    });

    await test.step("she searches in listing by invalid id", async () => {
      await listing.fillFilter(
        BUILDING_FILTERS.BUILDING_NUMBER,
        "INVALID_ID_000",
      );
    });

    await test.step("the table should be empty", async () => {
      await listing.assertTableEmpty();
    });
  },
);

test(
  "Listing - ADB - Buildings - Using one filter",
  { tag: ["@adb", "@building", "@listing"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const listing = new BuildingListingPage(celine);

    await test.step('she goes to the dashboard "portfolio/building"', async () => {
      await listing.goto();
      await listing.waitForBuildings();
    });

    const item = listing.firstItem;

    const filterKeys: BuildingFilterKey[] = [
      "BUILDING_NUMBER",
      "BUILDING_ADDRESS",
      "BUILDING_ASSOCIATE",
    ];

    await test.step("each listing filter should work independently", async () => {
      for (const key of filterKeys) {
        const filter = BUILDING_FILTERS[key];
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
  "Listing - ADB - Buildings - Using multi filters",
  { tag: ["@adb", "@building", "@listing", "@smoke"] },
  async ({ sessionFor }) => {
    test.setTimeout(180000);

    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const listing = new BuildingListingPage(celine);

    await test.step('she goes to the dashboard "portfolio/building"', async () => {
      await listing.goto();
      await listing.waitForBuildings();
    });

    const item = listing.firstItem;

    const searchKeys: BuildingFilterKey[] = [
      "BUILDING_NUMBER",
      "BUILDING_ADDRESS",
      "BUILDING_ASSOCIATE",
    ];

    const resultKeys: BuildingFilterKey[] = [
      "BUILDING_NUMBER",
      "BUILDING_ADDRESS",
      "BUILDING_ASSOCIATE",
    ];

    await test.step("she searches listing by filters", async () => {
      for (const key of searchKeys) {
        const filter = BUILDING_FILTERS[key];
        const value = filter.fillValue(item);
        if (value) {
          await listing.fillFilter(filter, value);
        }
      }
    });

    await test.step("she should see the listing results", async () => {
      for (const key of resultKeys) {
        const filter = BUILDING_FILTERS[key];
        if (filter.verifyValue) {
          await listing.assertRowContains(filter.verifyValue(item));
        }
      }
    });
  },
);

import { test } from "@helpers/auth/session.fixture";

import { resolveFirstUnitId } from "@/pages/adb/units/unit-listing.page";
import { assertUnitSectionElements } from "@/pages/adb/units/unit-section.assertions";
import { UnitPage } from "@/pages/adb/units/unit.page";

// Source migration: cypress/functionalTests/estates/units/viewUnitPages.feature
// Tags: @adb @unit @viewPages

const UNIT_PAGES = [
  { pageName: "Informations", pageTitle: "DONNÉES CLÉS" },
  { pageName: "Contacts internes", pageTitle: "CONTACTS INTERNES" },
  { pageName: "Diagnostics", pageTitle: "Description Appartement" },
] as const;

test.describe("Unit pages — view and content smoke", () => {
  let unitId: string;

  test.beforeEach(async ({ sessionFor }) => {
    test.setTimeout(120000);
    const alexandre = await sessionFor("adb:Alexandre");
    unitId = await resolveFirstUnitId(alexandre);
  });

  for (const { pageName, pageTitle } of UNIT_PAGES) {
    test(
      `Display - Unit - Pages - Verify "${pageName}" page title`,
      { tag: ["@adb", "@unit", "@viewPages", "@smoke"] },
      async ({ sessionFor }) => {
        const alexandre = await sessionFor("adb:Alexandre");
        const unitPage = new UnitPage(alexandre);

        await unitPage.gotoUnit(`unit/${unitId}`);
        await unitPage.accessUnitSection(pageName);
        await unitPage.assertPageTitle(pageName, pageTitle);
      },
    );
  }

  test(
    "Display - Unit - Pages - Verify Meters page contents",
    { tag: ["@adb", "@unit", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const alexandre = await sessionFor("adb:Alexandre");
      const unitPage = new UnitPage(alexandre);

      await unitPage.gotoUnit(`unit/${unitId}`);
      await unitPage.accessUnitSection("Compteurs");
      await unitPage.assertTableColumnNames([
        "numero",
        "type",
        "Unité de mesure",
      ]);
      await assertUnitSectionElements(alexandre, "Compteurs");
    },
  );

  test(
    "Display - Unit - Pages - Verify Diagnostics page contents",
    { tag: ["@adb", "@unit", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const alexandre = await sessionFor("adb:Alexandre");
      const unitPage = new UnitPage(alexandre);

      await unitPage.gotoUnit(`unit/${unitId}`);
      await unitPage.accessUnitSection("Diagnostics");
      await unitPage.assertTableColumnNames([
        "Type",
        "Réalisé le",
        "Expire le",
        "Source",
      ]);
      await assertUnitSectionElements(alexandre, "Diagnostics");
    },
  );
});

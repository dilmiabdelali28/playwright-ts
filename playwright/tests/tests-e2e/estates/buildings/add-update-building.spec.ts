import { loadPlaywrightAdbUser } from "@helpers/auth/adb-login";
import { TEST_CONFIG } from "@helpers/common/test-config";
import { goto, searchEmeriaTableRowWithRetry } from "@helpers/ui";

import {
  FixtureService,
  getBuildingId,
} from "$fixtures/services/fixture.service";
import {
  BuildingInformationsPage,
  type BuildingFormData,
} from "@/pages/adb/building/building-informations.page";
import { BuildingPage } from "@/pages/adb/building/building.page";

import { test } from "../../../../helpers/auth/session.fixture";

// Source migration: cypress/functionalTests/estates/buildings/addUpdateBuilding.feature
// Tags: @adb @building

const fixtureService = new FixtureService();

const BUILDING_FORM_DATA: BuildingFormData = {
  buildingName: "CypressTestBuilding",
  primaryAddress: "cypressPrimaryAddress",
  secondaryAddress: "CypressSecondaryAddress",
  zipCode: "92800",
  city: "Puteaux",
  sector: "La défense",
};

test(
  "Building - add new building",
  { tag: ["@adb", "@building", "@smoke"] },
  async ({ sessionFor }) => {
    const alexandre = await sessionFor("adb:Alexandre");
    const adbUser = loadPlaywrightAdbUser("Alexandre", TEST_CONFIG.fixturesDir);
    const buildingPage = new BuildingPage(alexandre);
    const informationsPage = new BuildingInformationsPage(alexandre);

    const rentalManagementFixture =
      await test.step("And a base building has been created", () =>
        fixtureService.createBaseBuilding(alexandre));
    const baseBuildingId = getBuildingId(rentalManagementFixture);

    await test.step("When she navigates to the building page", async () => {
      await buildingPage.gotoBuilding(`building/${baseBuildingId}`);
    });

    await test.step('And she accesses building "Informations Générales"', async () => {
      await buildingPage.accessBuildingSection("Informations Générales");
    });

    await test.step("And she adds new building", async () => {
      await informationsPage.addNewBuilding(buildingPage);
    });

    await test.step('And she accesses building "Bâtiment A"', async () => {
      await buildingPage.accessBuildingSection("Bâtiment A");
    });

    let buildingNumber = "";

    await test.step("And she updates building", async () => {
      buildingNumber =
        await informationsPage.updateBuilding(BUILDING_FORM_DATA);
    });

    await test.step('And she goes to the dashboard "portfolio/building"', async () => {
      await goto({
        page: alexandre,
        baseUrl: adbUser.adbBaseUrl,
        path: "portfolio/building",
      });
    });

    await test.step("And she searches ADB buildings by buildingNumber", async () => {
      await searchEmeriaTableRowWithRetry(alexandre, {
        filterTestId: "number",
        searchValue: buildingNumber,
      });
    });

    await test.step('And she accesses building "Informations Générales"', async () => {
      await buildingPage.accessBuildingSection("Informations Générales");
    });

    await test.step('And she accesses building "CypressTestBuilding"', async () => {
      await buildingPage.accessBuildingSection(BUILDING_FORM_DATA.buildingName);
    });

    await test.step("Then she checks results of updated building", async () => {
      await informationsPage.assertBuildingFormValues(BUILDING_FORM_DATA);
    });

    await test.step("And she removes Building", async () => {
      await informationsPage.removeBuilding();
    });
  },
);

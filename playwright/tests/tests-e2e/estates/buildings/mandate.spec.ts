import {
  FixtureService,
  getBuildingId,
} from "$fixtures/services/fixture.service";
import { BuildingMandatePage } from "@/pages/adb/building/building-mandate.page";
import { BuildingPage } from "@/pages/adb/building/building.page";

import { test } from "../../../../helpers/auth/session.fixture";

// Source migration: cypress/functionalTests/estates/buildings/mandate.feature
// Tags: @adb @copro @building @mandate

const fixtureService = new FixtureService();

test(
  "E2E - Update the building mandate number",
  { tag: ["@adb", "@copro", "@building", "@mandate", "@smoke"] },
  async ({ sessionFor }) => {
    const camille = await sessionFor("adb:Camille");
    const buildingPage = new BuildingPage(camille);
    const mandatePage = new BuildingMandatePage(camille, buildingPage);

    const coOwnershipBuildingFixture =
      await test.step("And a building existing with 1 coOwnership mandate (ACTIVE)", () =>
        fixtureService.createCoOwnershipBuilding(camille, ["ACTIVE"]));
    const buildingId = getBuildingId(coOwnershipBuildingFixture);

    await test.step("When she lands on building mandate page", async () => {
      await mandatePage.landOnMandatePage(buildingId);
    });

    await test.step('And she accesses building "Mandat & honoraires"', async () => {
      await mandatePage.accessMandateAndFees();
    });

    await test.step("And User updates mandate number", async () => {
      await mandatePage.updateMandateNumber();
    });

    await test.step("Then the mandate number should be successfully updated", async () => {
      await mandatePage.assertMandateNumberUpdated();
    });
  },
);

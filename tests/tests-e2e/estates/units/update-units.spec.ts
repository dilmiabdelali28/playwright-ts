import { test } from "@helpers/auth/session.fixture";

import { FixtureService, getUnitId } from "$fixtures/services/fixture.service";
import { UnitInformationsPage } from "@/pages/adb/units/unit-informations.page";
import { UnitPage } from "@/pages/adb/units/unit.page";

// Source migration: cypress/functionalTests/estates/units/updateUnits.feature
// Tags: @adb @unit @smoke

const fixtureService = new FixtureService();

const ADDRESS_UPDATE = {
  addressInformation: "1 ere étage appartement 5",
  building: "A",
  floor: "1",
  staircase: "oui",
  district: "A",
  sector: "secteur2",
};

test(
  "Update Units Information on Unit Pages",
  { tag: ["@adb", "@unit", "@smoke"] },
  async ({ sessionFor }) => {
    test.setTimeout(180000);

    const alexandre = await sessionFor("adb:Alexandre");
    const unitPage = new UnitPage(alexandre);
    const informationsPage = new UnitInformationsPage(alexandre);

    const rentalManagementFixture =
      await test.step("And a base building has been created", () =>
        fixtureService.createBaseBuilding(alexandre));
    const unitId = getUnitId(rentalManagementFixture);

    await test.step("And he goes to the page units", async () => {
      await unitPage.gotoUnit(`unit/${unitId}`);
      await unitPage.accessUnitSection("Informations");
    });

    await test.step("When he updates address section of unit", async () => {
      await informationsPage.updateAddress(ADDRESS_UPDATE);
    });

    await test.step("Then he should see all updates for the unit", async () => {
      await informationsPage.assertAddressUpdate(ADDRESS_UPDATE);
    });
  },
);

test(
  "Update new general equipment",
  { tag: ["@adb", "@unit", "@smoke"] },
  async ({ sessionFor }) => {
    test.setTimeout(180000);

    const alexandre = await sessionFor("adb:Alexandre");
    const unitPage = new UnitPage(alexandre);
    const informationsPage = new UnitInformationsPage(alexandre);

    const rentalManagementFixture =
      await test.step("And a base building has been created", () =>
        fixtureService.createBaseBuilding(alexandre));
    const unitId = getUnitId(rentalManagementFixture);

    await test.step("And he goes to the page units", async () => {
      await unitPage.gotoUnit(`unit/${unitId}`);
      await unitPage.accessUnitSection("Informations");
    });

    await test.step('When he updates the new general equipment "Double vitrage"', async () => {
      await informationsPage.addGeneralEquipment("Double vitrage");
    });

    await test.step("Then he should see all updates for the general equipment", async () => {
      await informationsPage.assertGeneralEquipment("Double vitrage");
    });

    await test.step("When he deletes a general equipment", async () => {
      await informationsPage.deleteGeneralEquipment();
    });

    await test.step("Then the general equipment does not exist", async () => {
      await informationsPage.assertNoGeneralEquipment();
    });
  },
);

import {
  FixtureService,
  getBuildingId,
} from "$fixtures/services/fixture.service";
import { BuildingMandatePage } from "@/pages/adb/building/building-mandate.page";
import { BuildingPage } from "@/pages/adb/building/building.page";

import { test } from "../../../../helpers/auth/session.fixture";

// Source migration: cypress/functionalTests/estates/buildings/trusteeContractMandate.feature
// Tags: @adb @copro @building @mandate

const fixtureService = new FixtureService();

const FEES_COLUMNS = [
  "Honoraire procédure judiciaire",
  "Tarif FONCIA AGENCE CENTRALE HT",
  "Unité Barème",
  "Prix HT",
  "Unité Grille",
];

test(
  "E2E - checking different mandates status of building created with only active mandate",
  { tag: ["@adb", "@copro", "@building", "@mandate", "@smoke"] },
  async ({ sessionFor }) => {
    const camille = await sessionFor("adb:Camille");
    const buildingPage = new BuildingPage(camille);
    const mandatePage = new BuildingMandatePage(camille, buildingPage);

    const coOwnershipBuildingFixture =
      await test.step("And a building existing with 1 coOwnership mandate (ACTIVE)", () =>
        fixtureService.createCoOwnershipBuilding(camille, ["ACTIVE"]));
    const buildingId = getBuildingId(coOwnershipBuildingFixture);

    await test.step("And she lands on building mandate page", async () => {
      await mandatePage.landOnMandatePage(buildingId);
    });

    await test.step('And she accesses building "Mandat & honoraires" page', async () => {
      await mandatePage.accessMandateAndFees();
    });

    await test.step("Then the building should not have a previous mandate", async () => {
      await mandatePage.assertNoPreviousMandate();
    });

    await test.step("And mandate number should be editable", async () => {
      await mandatePage.assertMandateNumberEditable();
    });

    await test.step("And the building should have a mandate in progress", async () => {
      await mandatePage.assertMandateInProgress();
    });

    await test.step("And the building should have fees and pricingScales", async () => {
      await mandatePage.assertFeesAndPricingScales(FEES_COLUMNS);
    });

    await test.step("And the Building should not have a coming mandate", async () => {
      await mandatePage.assertNoComingMandate();
    });
  },
);

test(
  "E2E - checking different mandates status of building created active, contrat to edit and close mandate",
  { tag: ["@adb", "@copro", "@building", "@mandate", "@smoke"] },
  async ({ sessionFor }) => {
    const camille = await sessionFor("adb:Camille");
    const buildingPage = new BuildingPage(camille);
    const mandatePage = new BuildingMandatePage(camille, buildingPage);

    const coOwnershipBuildingFixture =
      await test.step("And a building existing with 3 coOwnership mandate (CLOSE, CONTRACT_TO_EDIT, ACTIVE)", () =>
        fixtureService.createCoOwnershipBuilding(camille, [
          "CLOSE",
          "CONTRACT_TO_EDIT",
          "ACTIVE",
        ]));
    const buildingId = getBuildingId(coOwnershipBuildingFixture);

    await test.step("And she lands on building mandate page", async () => {
      await mandatePage.landOnMandatePage(buildingId);
    });

    await test.step('When she accesses building "Mandat & honoraires"', async () => {
      await mandatePage.accessMandateAndFees();
    });

    await test.step("Then the building should have 3 mandates", async () => {
      await mandatePage.assertThreeMandates([
        "Mandats précedents",
        "Mandat en cours",
        "Mandat à venir",
      ]);
    });

    await test.step("When she validates contrat in the coming mandate", async () => {
      await mandatePage.validateContractInComingMandate();
    });

    await test.step("And the building should have fees and pricingScales", async () => {
      await mandatePage.assertFeesAndPricingScales(FEES_COLUMNS);
    });

    await test.step("Then mandate information should be no longer modified", async () => {
      await mandatePage.assertMandateInformationsNotModified();
    });
  },
);

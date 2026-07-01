import {
  FixtureService,
  getBuildingId,
} from "$fixtures/services/fixture.service";
import { BuildingPage } from "@/pages/adb/building/building.page";
import {
  type MissionRepairInfos,
  MaintenanceLogMissionRepairPage,
  type StepMissionRepair,
} from "@/pages/adb/building/maintenance-log-mission-repair.page";
import { MaintenanceLogPage } from "@/pages/adb/building/maintenance-log.page";

import { test } from "../../../../helpers/auth/session.fixture";

// Source migration: cypress/functionalTests/estates/buildings/maintenanceLog.feature
// Tags: @adb @copro @building

const fixtureService = new FixtureService();

const DEFAULT_INFOS_MISSION_REPAIR: MissionRepairInfos = {
  generalAssemblyDateDateField: "01/01/2021",
  deliveredAtDateField: "01/01/2021",
  votedBudgetAmountField: "1000",
  labelTextField: "test",
};

// The list cells render the dates in short form (DD/MM/YY).
const DISPLAYED_INFOS_MISSION_REPAIR: MissionRepairInfos = {
  ...DEFAULT_INFOS_MISSION_REPAIR,
  generalAssemblyDateDateField: "01/01/21",
  deliveredAtDateField: "01/01/21",
};

const DEFAULT_STEP_MISSION_REPAIR: StepMissionRepair = {
  label: "chantier 1",
  fullname: "Fullname",
  address1: "Address1",
  address2: "Address2",
  zipCode: "ZipCode",
  city: "City",
  phoneNumber: "PhoneNumber",
  email: "email@gmail.com",
};

const NEW_LABEL = "New label";

test(
  "E2E - Generate a building maintenance log file",
  { tag: ["@adb", "@copro", "@building", "@smoke"] },
  async ({ sessionFor }) => {
    const camille = await sessionFor("adb:Camille");
    const buildingPage = new BuildingPage(camille);
    const maintenanceLogPage = new MaintenanceLogPage(camille, buildingPage);

    const maintenanceLogBuildingFixture =
      await test.step("Given a co-ownership building with budgets and contracts", () =>
        fixtureService.createMaintenanceLogBuilding(camille));
    const buildingId = getBuildingId(maintenanceLogBuildingFixture);

    await test.step("And she accesses maintenance log of building", () =>
      maintenanceLogPage.accessMaintenanceLog(buildingId));

    await test.step("When she generates a new maintenance log file", () =>
      maintenanceLogPage.generateMaintenanceLog());

    await test.step("Then she should see the generated file and can publish/download it", () =>
      maintenanceLogPage.assertGeneratedLogIsListedAndActionable());

    await test.step("When she publishes the maintenance log file", () =>
      maintenanceLogPage.publishMaintenanceLog());

    await test.step("Then she should see the maintenance log file is published", () =>
      maintenanceLogPage.assertMaintenanceLogIsPublished());
  },
);

test(
  "E2E - Toggle contracts and generate a building maintenance log file",
  { tag: ["@adb", "@copro", "@building", "@smoke"] },
  async ({ sessionFor }) => {
    const camille = await sessionFor("adb:Camille");
    const buildingPage = new BuildingPage(camille);
    const maintenanceLogPage = new MaintenanceLogPage(camille, buildingPage);

    const maintenanceLogBuildingFixture =
      await test.step("Given a co-ownership building with budgets and contracts", () =>
        fixtureService.createMaintenanceLogBuilding(camille));
    const buildingId = getBuildingId(maintenanceLogBuildingFixture);

    await test.step("And she accesses maintenance log of building", () =>
      maintenanceLogPage.accessMaintenanceLog(buildingId));

    await test.step("When she toggles a contract on the maintenance log page", () =>
      maintenanceLogPage.toggleRandomContractAndAssertPersisted());

    await test.step("And she generates a new maintenance log file", () =>
      maintenanceLogPage.generateMaintenanceLog());

    await test.step("Then she should see the generated file and can publish/download it", () =>
      maintenanceLogPage.assertGeneratedLogIsListedAndActionable());
  },
);

test(
  "E2E - Add and delete a new mission repair",
  { tag: ["@adb", "@copro", "@building", "@smoke"] },
  async ({ sessionFor }) => {
    const camille = await sessionFor("adb:Camille");
    const buildingPage = new BuildingPage(camille);
    const maintenanceLogPage = new MaintenanceLogPage(camille, buildingPage);
    const missionRepairPage = new MaintenanceLogMissionRepairPage(camille);

    const maintenanceLogBuildingFixture =
      await test.step("Given a co-ownership building with budgets and contracts", () =>
        fixtureService.createMaintenanceLogBuilding(camille));
    const buildingId = getBuildingId(maintenanceLogBuildingFixture);

    await test.step("And she accesses maintenance log of building", () =>
      maintenanceLogPage.accessMaintenanceLog(buildingId));

    await test.step("When she adds a new mission repair", async () => {
      await missionRepairPage.addMissionRepair(DEFAULT_INFOS_MISSION_REPAIR);
      await missionRepairPage.sendMissionRepair();
    });

    await test.step("Then she should see the mission repair", () =>
      missionRepairPage.assertMissionRepair(0, DISPLAYED_INFOS_MISSION_REPAIR));

    await test.step("When she edits the mission repair", () =>
      missionRepairPage.editMissionRepairLabel(NEW_LABEL));

    await test.step("Then she should see the mission repair edited", () =>
      missionRepairPage.assertMissionRepairEdited(NEW_LABEL));

    await test.step("When she deletes the mission repair", () =>
      missionRepairPage.deleteMissionRepair());

    await test.step("Then she should not see the mission repair", () =>
      missionRepairPage.assertMissionRepairNotExists());
  },
);

test(
  "E2E - Add and delete a new mission repair with one step",
  { tag: ["@adb", "@copro", "@building", "@smoke"] },
  async ({ sessionFor }) => {
    const camille = await sessionFor("adb:Camille");
    const buildingPage = new BuildingPage(camille);
    const maintenanceLogPage = new MaintenanceLogPage(camille, buildingPage);
    const missionRepairPage = new MaintenanceLogMissionRepairPage(camille);

    const maintenanceLogBuildingFixture =
      await test.step("Given a co-ownership building with budgets and contracts", () =>
        fixtureService.createMaintenanceLogBuilding(camille));
    const buildingId = getBuildingId(maintenanceLogBuildingFixture);

    await test.step("And she accesses maintenance log of building", () =>
      maintenanceLogPage.accessMaintenanceLog(buildingId));

    await test.step("When she adds a new mission repair with a new step", async () => {
      await missionRepairPage.addMissionRepair(DEFAULT_INFOS_MISSION_REPAIR);
      await missionRepairPage.addStep(0, DEFAULT_STEP_MISSION_REPAIR);
      await missionRepairPage.sendMissionRepair();
    });

    await test.step("Then she should see the mission repair with a step", () =>
      missionRepairPage.assertMissionRepair(1, DISPLAYED_INFOS_MISSION_REPAIR));

    await test.step("When she edits the step of the mission repair", () =>
      missionRepairPage.editMissionRepairStep());

    await test.step("And she deletes the mission repair", () =>
      missionRepairPage.deleteMissionRepair());

    await test.step("Then she should not see the mission repair", () =>
      missionRepairPage.assertMissionRepairNotExists());
  },
);

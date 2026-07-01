import { TEST_CONFIG } from "@helpers/common/test-config";

import {
  FixtureService,
  getCoOwnerIdByName,
  getBuildingAddress,
  getBuildingName,
} from "$fixtures/services/fixture.service";
import { AgAgendaManagementPage } from "@/pages/adb/mission/ag/ag-agenda-management.page";
import { AgAttendancePage } from "@/pages/adb/mission/ag/ag-attendance.page";
import { AgBudgetPage } from "@/pages/adb/mission/ag/ag-budget.page";
import { AgSignaturesPage } from "@/pages/adb/mission/ag/ag-signatures.page";
import { AgSynthesisPage } from "@/pages/adb/mission/ag/ag-synthesis.page";
import { AgVotePage } from "@/pages/adb/mission/ag/ag-vote.page";
import { MissionAgPage } from "@/pages/adb/mission/ag/mission-ag.page";
import type {
  AttendanceCounterExpectation,
  MissionAgVoteConfig,
  ResolutionRow,
} from "@/pages/adb/mission/ag/mission-ag.types";
import { MissionSidebarPage } from "@/pages/adb/mission/mission-sidebar.page";
import { AccountantsPreparationPage } from "@/pages/bo/accountants-preparation.page";

import { test } from "../../../../helpers/auth/session.fixture";

// Source migration: cypress/functionalTests/missions/generalAssembly/ago.feature
// Tags: @adb @copro @e2e @ag @smoke @deleteFixture

const fixtureService = new FixtureService();

const BUILDING_NAME = "Immeuble pour AGO";

const MISSION_PROPS = {
  type: "Ordinaire",
  specificity: "Standard",
  defaultAllocationKey: "001 - CHARGES GENERALES",
} as const;

const AGO_RESOLUTIONS: ResolutionRow[] = [
  {
    number: "1",
    type: "Election du bureau",
    label: "ÉLECTION DU PRÉSIDENT DE SÉANCE",
  },
  { number: "2", type: "Election du bureau", label: "ÉLECTION DU SCRUTATEUR" },
  {
    number: "3",
    type: "Election du bureau",
    label: "ÉLECTION D'UN SECRÉTAIRE",
  },
  { number: "4", type: "Comptabilité", label: "@accountingPeriodLabel4" },
  { number: "5", type: "Gestion", label: "QUITUS AU SYNDIC" },
  {
    number: "6",
    type: "Mandat de syndic",
    label: "DÉSIGNATION DU SYNDIC FONCIA -",
  },
  {
    number: "7",
    type: "Conseil syndical",
    label:
      "COMPTE RENDU DU CONSEIL SYNDICAL SUR SES MISSIONS ET AVIS RENDUS AU COURS DE L'EXERCICE ECOULE",
  },
  {
    number: "8",
    type: "Conseil syndical",
    label: "DÉSIGNATION DES MEMBRES DU CONSEIL SYNDICAL",
  },
  {
    number: "9",
    type: "Gestion",
    label: "MODALITÉS DE CONSULTATION DU CONSEIL SYNDICAL",
  },
  {
    number: "10",
    type: "Gestion",
    label: "MISE EN CONCURRENCE DES MARCHÉS ET CONTRATS",
  },
  { number: "11", type: "Comptabilité", label: "@accountingPeriodLabel11" },
  { number: "12", type: "Comptabilité", label: "@accountingPeriodLabel12" },
  {
    number: "13",
    type: "Comptabilité",
    label: "AJUSTEMENT DU MONTANT DE L'AVANCE DE TRESORERIE",
  },
  { number: "14", type: "Comptabilité", label: "@accountingPeriodLabel14" },
  {
    number: "15",
    type: "Gestion",
    label:
      "PARTICIPATION A DISTANCE AUX ASSEMBLEES GENERALES POUR LES ASSEMBLEES GENERALES A VENIR",
  },
  { number: "16", type: "Solutions différenciantes", label: "OPTION 24/7" },
  {
    number: "17",
    type: "Solutions différenciantes",
    label:
      "INFORMATION : ENVOI DEMATERIALISE DES CONVOCATIONS ET PROCES VERBAUX D'ASSEMBLEES GENERALES",
  },
  {
    number: "18",
    type: "Solutions différenciantes",
    label:
      "AUTORISATION A DONNER AU SYNDIC DE CONTRACTER AU NOM DU SYNDICAT, AVEC LA SOCIETE TECH-WAY",
  },
  {
    number: "19",
    type: "Gestion",
    label:
      "INSTALLATION D'UN DEFIBRILLATEUR AUTOMATISE EXTERNE DANS LA COPROPRIETE ET SOUSCRIPTION DU CONTRAT DE MAINTENANCE",
  },
];

const UNION_COUNCIL_SUB_RESOLUTIONS: ResolutionRow[] = [
  {
    number: "8.0",
    type: "Conseil syndical",
    label: "DÉSIGNATION DES MEMBRES DU CONSEIL SYNDICAL",
  },
  {
    number: "8.1",
    type: "Conseil syndical",
    label:
      "Candidature de ... (en cas de candidature(s) supplémentaire(s) en séance)",
  },
];

const ATTENDANCE_COUNTERS: AttendanceCounterExpectation = {
  presentCoOwnersCount: "2 / 2",
  presentCoOwnersPercentage: "1 500 / 1 500",
  vpcCoOwnersCount: "0 / 2",
  vpcCoOwnersPercentage: "0 / 1 500",
  totalCoOwnersCount: "2 / 2",
  totalCoOwnersPercentage: "1 500 / 1 500",
};

const VOTE_CONFIG: MissionAgVoteConfig = {
  resolutionsCount: 19,
  coownersCount: 2,
  coownersPresent: 2,
  resolutionsToBeVoted: [1, 2, 3, 5, 10, 11],
};

test.use({
  actionTimeout: 15_000,
  navigationTimeout: 15_000,
});

test(
  "E2E - Create a new AGO mission",
  { tag: ["@adb", "@copro", "@e2e", "@ag", "@smoke"] },
  async ({ sessionFor }) => {
    test.setTimeout(900000);

    const camille = await sessionFor("adb:Camille");
    const yazid = await sessionFor("bo:Yazid");

    const missionAgPage = new MissionAgPage(camille);
    const missionSidebar = new MissionSidebarPage(camille);
    const agSynthesisPage = new AgSynthesisPage(camille);
    const agBudgetPage = new AgBudgetPage(camille);
    const agAgendaPage = new AgAgendaManagementPage(camille);
    const agAttendancePage = new AgAttendancePage(camille);
    const agVotePage = new AgVotePage(camille);
    const agSignaturesPage = new AgSignaturesPage(camille);
    const accountantsPreparationPage = new AccountantsPreparationPage(yazid);

    const agoMissionBuildingFixture =
      await test.step("Given a whole building existing for an AGO mission", () =>
        fixtureService.createAgoMissionBuilding(camille, BUILDING_NAME));

    const buildingName = getBuildingName(agoMissionBuildingFixture);
    const buildingAddress = getBuildingAddress(agoMissionBuildingFixture);
    const zipcode = `${buildingAddress.zipCode.slice(0, 2)} ${buildingAddress.zipCode.slice(2)}`;
    const bobCoOwnerId = getCoOwnerIdByName(
      agoMissionBuildingFixture,
      "Bob Playwright",
    );
    const maryCoOwnerId = getCoOwnerIdByName(
      agoMissionBuildingFixture,
      "Mary Playwright",
    );

    await test.step("When she creates a new AG mission", async () => {
      await missionAgPage.gotoMissionsListing();
      await missionAgPage.createAgMission({
        ...MISSION_PROPS,
        buildingName,
      });
    });

    await test.step("And she goes to the created mission", async () => {
      await missionAgPage.visitMissionPage();
    });

    await test.step("And she chooses the AG location", async () => {
      await agSynthesisPage.open();
      await agSynthesisPage.verifyAgTypeSection(
        MISSION_PROPS.type,
        MISSION_PROPS.specificity,
        MISSION_PROPS.defaultAllocationKey,
      );

      await agSynthesisPage.selectAgLocation({
        locationType: "Immeuble",
        address: buildingAddress.address1,
        city: buildingAddress.city,
        zipcode,
      });
    });

    await test.step("And she adds and sends the AG date to CS", async () => {
      await agSynthesisPage.addAgDate();
      await agSynthesisPage.sendAgConvocationToCouncil();
    });

    await test.step("Then the AG location and the AG date should be set", async () => {
      await agSynthesisPage.verifyAgLocationSection({
        locationName: buildingAddress.buildingName,
        address: buildingAddress.address1,
        city: buildingAddress.city,
        zipcode,
      });
      await agSynthesisPage.verifyAgDate();
    });

    await test.step('When Yazid opens the tab "Copropriété"', async () => {
      await accountantsPreparationPage.openCoproTab();
    });

    await test.step('And he goes to the accountants preparation page with accounting periods "À venir"', async () => {
      await accountantsPreparationPage.gotoAccountantsPreparation("À venir");
    });

    await test.step('And he selects smartly the agency "FONCIA AGENCE CENTRALE"', async () => {
      await accountantsPreparationPage.selectAgencySmartly(
        TEST_CONFIG.targetAgency,
      );
    });

    await test.step("And he searches and selects the accounting period with context", async () => {
      await accountantsPreparationPage.searchAndSelectAccountingPeriod(
        buildingAddress.address1,
      );
    });

    await test.step('And he navigates to the "Documents" step in the sidebar', async () => {
      await accountantsPreparationPage.openDocumentsStep();
    });

    await test.step("And he updates accounting period documents", async () => {
      await accountantsPreparationPage.updateAccountingDocuments();
    });

    await test.step("When Camille goes to the created mission", async () => {
      await missionAgPage.visitMissionPage();
    });

    await test.step('And she navigates to the "Validation du budget" step in the sidebar', async () => {
      await agBudgetPage.open();
    });

    await test.step("And she validates the budget", async () => {
      await agBudgetPage.validateBudget();
    });

    await test.step('When she navigates to the "Gestion de l\'ordre du jour" step in the sidebar', async () => {
      await agAgendaPage.open();
    });

    await test.step("And the AGO resolutions table contains the following resolutions", async () => {
      await agAgendaPage.assertAgoResolutionsTable(
        AGO_RESOLUTIONS,
        missionAgPage.accountingExercises,
      );
    });

    await test.step("And the AGO union council table contains the following sub-resolutions", async () => {
      await agAgendaPage.assertUnionCouncilSubResolutions(
        UNION_COUNCIL_SUB_RESOLUTIONS,
        missionAgPage.resolutionsSnapshot?.resolutions[19]?.label,
      );
    });

    await test.step("And she checks all selected resolutions and sub-resolutions titles", async () => {
      await agAgendaPage.checkAllSelectedAgoResolutionTitles();
    });

    await test.step('When she updates AG "Ordinaire" resolutions', async () => {
      await agAgendaPage.updateAgResolutions([{ number: "6", addPdf: "yes" }]);
    });

    await test.step("And she deletes the resolution", async () => {
      await agAgendaPage.deleteResolution(
        "APPROBATION DES COMPTES DE L'EXERCICE DU",
        true,
      );
    });

    await test.step("And she generates and sends the AG convocation", async () => {
      await agAgendaPage.generateAgConvocation(missionAgPage.missionId);
      await agAgendaPage.sendAgConvocation(missionAgPage.missionId);
      await missionSidebar.assertMissionStatus("Convoquée", "AGconvoquée");
    });

    await test.step("When she starts the AG attendance", async () => {
      await agAttendancePage.open();
      await agAttendancePage.startAgAttendance(missionAgPage.missionId);
    });

    await test.step("And she updates AG attendance with context", async () => {
      await agAttendancePage.setCoOwnerAttendance(bobCoOwnerId, "present");
      await agAttendancePage.setCoOwnerAttendance(maryCoOwnerId, "present");
    });

    await test.step("And she checks the attendance counters", async () => {
      await agAttendancePage.assertAttendanceCounters(ATTENDANCE_COUNTERS);
    });

    await test.step("And she starts the AG", async () => {
      await agAttendancePage.startAg();
      await missionSidebar.assertMissionStatus("En cours");
    });

    await test.step('And she starts the AG "Ordinaire" and terminates votes', async () => {
      await agVotePage.open();
      await agVotePage.startAgAndTerminateVotes(VOTE_CONFIG);
    });

    await test.step("And she generates the PV", async () => {
      await agVotePage.generatePv(missionAgPage.missionId);
    });

    await test.step("And she downloads the AG minutes", async () => {
      await agVotePage.downloadAgMinutes();
    });

    await test.step("And she terminates the PV with status PV à faire signer", async () => {
      await agVotePage.endPv();
    });

    await test.step("And she sends the ag minutes to officers for signature", async () => {
      await agSignaturesPage.open();
      await agSignaturesPage.sendMinutesToOfficeMembers();
    });

    // Then officers should receive the emails
    // (non migré — étape commentée dans cypress/functionalTests/missions/generalAssembly/ago.feature)
  },
);

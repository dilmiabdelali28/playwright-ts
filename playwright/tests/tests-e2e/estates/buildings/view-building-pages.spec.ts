import { assertBuildingSectionElements } from "@/pages/adb/building/building-section.assertions";
import { BuildingPage } from "@/pages/adb/building/building.page";

import { test } from "../../../../helpers/auth/session.fixture";

// Source migration: cypress/functionalTests/estates/buildings/viewBuildingPages.feature
// Tags: @adb @building @viewPages

const BUILDING_ID_MAIN = "6909ea6da8e96435cb9271a6";
const BUILDING_ID_DEFAULT = "5e5db02d22a9ea1d6b7b08d5";
const BUILDING_ID_MISSIONS = "696522c6867f7ff9ac0315d4";
const BUILDING_ID_PRIVATE_CHARGES = "5e5db02d09e0c31b1c7b067e";

const MAIN_BUILDING_PAGES = [
  { pageName: "Contacts internes", pageTitle: "CONTACTS INTERNES" },
  { pageName: "Fiche identité", pageTitle: "Informations Générales" },
  { pageName: "Informations Générales", pageTitle: "Informations Générales" },
  { pageName: "Bâtiment 1", pageTitle: "Bâtiment 1" },
  { pageName: "Missions", pageTitle: "Missions" },
  { pageName: "Tickets", pageTitle: "Tickets" },
  { pageName: "Équipements", pageTitle: "Équipements" },
  { pageName: "Diagnostics", pageTitle: "Diagnostics" },
  { pageName: "Salariés", pageTitle: "Salariés" },
  { pageName: "Mandat", pageTitle: "Mandat & honoraires" },
  { pageName: "Contrats", pageTitle: "Informations contrats" },
  { pageName: "Comptes", pageTitle: "CHARGES COURANTES" },
  { pageName: "Comptes bancaires", pageTitle: "Comptes bancaires" },
  { pageName: "Carnet d'entretien", pageTitle: "CARNET D'ENTRETIEN" },
  {
    pageName: "Soldes des copropriétaires",
    pageTitle: "Soldes des copropriétaires",
  },
  {
    pageName: "Clés de répartition &",
    pageTitle: "Clés de répartition & copropriétaires",
  },
  { pageName: "Documents", pageTitle: "Documents" },
  {
    pageName: "Échéancier",
    pageTitle: "Échéancier budget Charges courantes",
  },
  {
    pageName: "Charges courantes",
    pageTitle: "Échéancier budget Charges courantes",
  },
  {
    pageName: "Avance de trésorerie",
    pageTitle: "Échéancier budget Avance de trésorerie",
  },
  {
    pageName: "Fonds travaux",
    pageTitle: "Échéancier budget Fonds travaux",
  },
  {
    pageName: "Travaux à réaliser",
    pageTitle: "Échéancier budget Travaux à réaliser",
  },
] as const;

test.describe("Building pages — view and content smoke", () => {
  for (const { pageName, pageTitle } of MAIN_BUILDING_PAGES) {
    test(
      `Display - Building - Pages - Verify "${pageName}" page title`,
      { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
      async ({ sessionFor }) => {
        const celine = await sessionFor("adb:Celine");
        const buildingPage = new BuildingPage(celine);

        await buildingPage.gotoBuilding(`building/${BUILDING_ID_MAIN}`, {
          waitForFeatures: true,
        });
        await buildingPage.accessBuildingSection(pageName);
        await buildingPage.assertPageTitle(pageName, pageTitle);
      },
    );
  }

  test(
    "Display - Building - Pages - Verify contract page contents",
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_DEFAULT}`);
      await buildingPage.accessBuildingSection("Contrats");
      await buildingPage.assertTableColumnNames([
        "Infos",
        "Description",
        "N° contrat",
        "Fournisseur",
        "Date de début",
        "Date de fin",
      ]);
      await assertBuildingSectionElements(celine, "Contrats");
    },
  );

  test(
    "Display - Building - Pages - Verify Salary page contents",
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_DEFAULT}`);
      await buildingPage.accessBuildingSection("Salariés");
      await buildingPage.assertLegoTableColumnNames([
        "Statut",
        "Catégorie",
        "Identité",
        "Type de contrat",
        "Depuis le",
        "Date d'échéance",
        "Horaires",
        "Contrat",
      ]);
      await assertBuildingSectionElements(celine, "Salariés");
    },
  );

  test(
    "Display - Building - Pages - Verify tickets page contents",
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_DEFAULT}`);
      await buildingPage.accessBuildingSection("Tickets");
      await buildingPage.assertTableColumnNames([
        "Référence",
        "Objet",
        "Créé le",
        "Prénom Nom / Dénomination sociale",
        "Modifié par",
        "Gestionnaire",
        "Statut",
      ]);
      await buildingPage.assertTableNotEmpty();
      await assertBuildingSectionElements(celine, "Tickets");
    },
  );

  test(
    "Display - Building - Pages - Verify Missions page contents",
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_MISSIONS}`);
      await buildingPage.accessBuildingSection("Missions");
      await buildingPage.assertTableColumnNames([
        "Identifiant",
        "Intitulé",
        "Type",
        "Gestionnaire",
        "Modifié le",
        "Statut",
      ]);
      await buildingPage.assertTableNotEmpty();
      await assertBuildingSectionElements(celine, "Missions");
    },
  );

  test(
    "Display - Building - Pages - Verify Equipments page contents",
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_DEFAULT}`);
      await buildingPage.accessBuildingSection("Équipements");
      await assertBuildingSectionElements(celine, "Équipements");
    },
  );

  test(
    "Display - Building - Pages - Verify Diagnostics page contents",
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_DEFAULT}`);
      await buildingPage.accessBuildingSection("Diagnostics");
      await assertBuildingSectionElements(celine, "Diagnostics");
    },
  );

  test(
    "Display - Building - Pages - Verify Documents page contents",
    { tag: ["@adb", "@building", "@viewPages"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_DEFAULT}`);
      await buildingPage.accessBuildingSection("Documents");
      await assertBuildingSectionElements(celine, "Documents");
    },
  );

  test(
    'Display - Building - Pages - Verify "Dépenses" page title',
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(
        `building/${BUILDING_ID_PRIVATE_CHARGES}`,
      );
      await buildingPage.accessBuildingSection("Dépenses");
      await buildingPage.assertPageTitle("Dépenses", "Dépenses privatives");
    },
  );

  test(
    "Display - Building - Pages - Verify Comptes page contents",
    { tag: ["@adb", "@building", "@viewPages"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_DEFAULT}`);
      await buildingPage.accessBuildingSection("Comptes");
      await assertBuildingSectionElements(celine, "Comptes");
    },
  );

  test(
    "Display - Building - Pages - Verify Comptes bancaires page contents",
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_MISSIONS}`);
      await buildingPage.accessBuildingSection("Comptes bancaires");
      await assertBuildingSectionElements(celine, "Comptes bancaires");
      await buildingPage.assertPageNotContainsText(
        "Vous n\u2019avez aucun compte courant principal",
      );
    },
  );

  test(
    "Display - Building - Pages - Verify Soldes des copropriétaires page contents",
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_MISSIONS}`);
      await buildingPage.accessBuildingSection("Soldes des copropriétaires");
      await assertBuildingSectionElements(celine, "Soldes des copropriétaires");
      await buildingPage.assertTableColumnNames([
        "Numéro de compte",
        "Nom",
        "Solde",
      ]);
      await buildingPage.assertTableNotEmpty();
    },
  );

  test(
    "Display - Building - Pages - Verify Clés de répartition & copropriétaires page contents",
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_DEFAULT}`);
      await buildingPage.accessBuildingSection("Clés de répartition &");
      await buildingPage.assertTableColumnNames([
        "Copropriétaires",
        "Numéro client",
        "Nombre de lots",
        "Gestion locative",
        "Tantièmes",
      ]);
      await buildingPage.assertTableNotEmpty();
      await buildingPage.goToUnitView();
      await buildingPage.openFirstUnitSheet();
      await buildingPage.assertUnitPageTitle("Informations", "DONNÉES CLÉS");
    },
  );

  test(
    "Display - Building - Pages - Verify Soldes des compteurs page contents",
    { tag: ["@adb", "@building", "@viewPages", "@smoke"] },
    async ({ sessionFor }) => {
      const celine = await sessionFor("adb:Celine");
      const buildingPage = new BuildingPage(celine);

      await buildingPage.gotoBuilding(`building/${BUILDING_ID_MAIN}`);
      await buildingPage.accessBuildingSection("Soldes des compteurs");
      await assertBuildingSectionElements(celine, "Soldes des compteurs");
      await buildingPage.assertTableColumnNames([
        "Lot",
        "Copropriétaires",
        "Solde compteur",
        "Mobilisable",
        "Mobilisé",
      ]);
      await buildingPage.assertTableNotEmpty();
    },
  );
});

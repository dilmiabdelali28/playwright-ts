import { test } from "../../../helpers/auth/session.fixture";
import { BoHomePage } from "../../../pages/bo/view-accounting.page";

test(
  "Check accounting pages - all links displayed",
  {
    tag: ["@smoke"],
  },
  async ({ sessionFor }) => {
    const sofian = await sessionFor("bo:Sofian");
    const boHomePage = new BoHomePage(sofian);

    // ========================
    // 🟢 ENCAISSEMENT
    // ========================

    await boHomePage.checkCategory("ENCAISSEMENT", [
      {
        label: "Virements espace client",
        href: "/natixis-payments/processing",
      },
      { label: "Virements Edenred", href: "/edenred/transfers/to-process" },
      { label: "Virements entrants", href: "/affectation/transfers/probables" },
      { label: "Chèques entrants", href: "/affectation/checks/to-process" },
      {
        label: "Encaissements sans remise",
        href: "/incomes/depositless/processed",
      },
      { label: "Dépôts d'espèces", href: "/incomes/cash/to-process" },
      { label: "Prélèvements", href: "/debits/to-process" },
      {
        label: "Banques partenaires virements de l'espace client",
        href: "/partner-banks-myfoncia",
      },
      { label: "Historique CB", href: "/dalenys-transactions/in-accounting" },
    ]);

    // ========================
    // 🔵 DÉCAISSEMENT
    // ========================
    await boHomePage.checkCategory("DÉCAISSEMENT", [
      { label: "Factures à intégrer", href: "/invoices/a-integrer/received" },
      { label: "Factures à échéance", href: "/invoices/accounting-entered" },
      { label: "Saisie d'une OB", href: "/saisie-ob" },
      { label: "Paiements émis", href: "/issued-payments/transfers" },
    ]);

    // ========================
    // 🟡 BANQUE
    // ========================
    await boHomePage.checkCategory("BANQUE", [
      { label: "Rapprochement bancaire", href: "/bank-reconciliations/active" },
      {
        label: "Frais bancaires et rejets de paiement",
        href: "/bank-fees-and-payment-rejections/bank-fees-to-handle",
      },
      { label: "Intérêts bancaires", href: "/bank-interests/pending" },
      { label: "Fichiers Kyriba émis", href: "/kyriba/files/:type" },
    ]);

    // ========================
    // 🟣 CONSULTATIONS
    // ========================
    await boHomePage.checkCategory("CONSULTATIONS", [
      { label: "Consultation des écritures comptables", href: "/entries" },
      { label: "Consultation du solde des comptes", href: "/balance-comptes" },
      {
        label: "Visualisation du chiffre d'affaires",
        href: "/turnover/history",
      },
      { label: "Contrôles comptables", href: "/accounting-controls" },
    ]);

    // ========================
    // 🏢 ONGLET COPROPRIÉTÉ
    // ========================
    await boHomePage.openTab("Copropriété");

    await boHomePage.checkCategory("PRÉPARATION AG", [
      {
        label: "Préparation et justification des comptes",
        href: "/exercises/TO_PREPARE",
      },
      {
        label: "Répartition des comptes",
        href: "/repartition-comptes/validated-by-trustee",
      },
    ]);

    await boHomePage.checkCategory("VIE DE LA COPROPRIÉTÉ", [
      { label: "Budgets", href: "/budgets?filters[kind]=CURRENT_EXPENSES" },
      { label: "Avis de mutation", href: "/mutation/management/avis" },
      { label: "DPV", href: "/missions-coownership-transfer" },
    ]);

    await boHomePage.checkCategory("AUTRES", [
      { label: "Gestion des indices", href: "/indexes-update/fees" },
      {
        label: "Rétrocession des honoraires",
        href: "/retrocessions-fees-coownership/building-fee",
      },
      { label: "Salaires", href: "/pagardim" },
      { label: "Transferts d'immeubles", href: "/building-transfers" },
      {
        label: "Perte de mandats COPRO",
        href: "/mission?filters[kind]=MissionMandateLoss",
      },
      {
        label: "Emprunts collectifs",
        href: "/mission?filters[kind]=MissionCollectiveLoan",
      },
    ]);

    // ========================
    // 🏠 ONGLET GESTION LOCATIVE
    // ========================
    await boHomePage.openTab("Gestion locative");

    await boHomePage.checkCategory("PROPRIÉTAIRE", [
      { label: "Acomptes", href: "/deposits/to-pay" },
      { label: "CRG", href: "/operating-lease-reports/conventional" },
      { label: "Transferts de lots", href: "/units-transfers" },
      { label: "Indemnisation sinistres GLI", href: "/rgi-compensation/todo" },
      {
        label: "Aide à la déclaration des revenus fonciers",
        href: "/lessor-tax-declaration-listing",
      },
      {
        label: "Gérance pure / préparation des comptes",
        href: "/full-property-management",
      },
      {
        label: "Récupération taxes foncières / TOM",
        href: "/lessor-property-and-waste-taxes",
      },
    ]);

    await boHomePage.checkCategory("LOCATAIRE", [
      {
        label: "Validation et 1er appels",
        href: "/first-rent-issuance/to-call",
      },
      { label: "Reprises de bail", href: "/tenants-lease-back/to-validate" },
      { label: "Appels de loyers", href: "/rent-issuance/to-call" },
      { label: "Réalisation des ACL", href: "/tenant-leave-balance/todo" },
      {
        label: "Révision et indexation des loyers",
        href: "/rent-reviews/conventional",
      },
      {
        label: "Régularisation des charges locatives",
        href: "/expenses-regularization/todo",
      },
    ]);

    await boHomePage.checkCategory("AUTRES", [
      { label: "Honoraires de location", href: "/rental-fees/in-process" },
      {
        label: "Rétrocession des honoraires",
        href: "/retrocessions-fees-gl/fee",
      },
      { label: "Fichiers CAF", href: "/caf-files" },
    ]);

    // ========================
    // ⚖️ ONGLET CONTENTIEUX
    // ========================
    await boHomePage.openTab("Contentieux");

    await boHomePage.checkCategory("DOSSIER CONTENTIEUX", [
      {
        label: "Dossier contentieux en Gestion Locative",
        href: "/recoveries/rental/automatic",
      },
      {
        label: "Dossier contentieux en Copropriété",
        href: "/recoveries/coownership/automatic",
      },
      { label: "Edition de liste d'impayés", role: "button" },
    ]);

    await boHomePage.checkCategory("FACTURATION", [
      { label: "Honoraires de contentieux (Copropriété)", role: "button" },
    ]);

    await boHomePage.checkCategory("RELANCES CONTENTIEUX", [
      {
        label: "Relances en gestion locative",
        href: "/reminders/rental/to-process",
      },
      {
        label: "Relances en copropriété",
        href: "/reminders/coownership/to-process",
      },
    ]);
  },
);

import { CoOwnerCustomerPage } from "@/pages/adb/customers/co-owner/co-owner-page.page";

import { test } from "../../../../helpers/auth/session.fixture";

// Source migration: customers/coOwner/viewCoOwnersPage.feature

const BASE_TAGS = ["@adb", "@customer", "@viewPages"];

test(
  "Display - Customers - Pages - Verify Addresses page contents",
  { tag: [...BASE_TAGS, "@smoke"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step('she goes to the page "customer/.../co-owner"', async () => {
      await customer.goto("/customer/5e5db02d5ca01a2b327b11f0/co-owner");
    });

    await test.step('she accesses the customer "coowner" profile "Destinataires" page', async () => {
      await customer.openProfilePage("Destinataires");
    });

    await test.step('she clicks on card "Destinataires"', async () => {
      await customer.clickAddressCard();
    });

    await test.step('she should see each elements of the section "Destinataires"', async () => {
      await customer.assertElementsVisible([
        "LayoutSidenavCenter",
        "civility",
        "lastName",
        "firstName",
        "address.address1",
        "address.zipCode",
        "address.city",
        "address.countryCode",
        "mobilePhone",
        "email",
      ]);
    });
  },
);

test(
  "Display - Customers - Pages - Verify Account page contents",
  { tag: [...BASE_TAGS, "@smoke"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step('she goes to the page "customer/.../co-owner"', async () => {
      await customer.goto("/customer/5e5db02d5ca01a2b327b11f0/co-owner");
    });

    await test.step('she accesses the customer "coowner" profile "Comptes" page', async () => {
      await customer.openProfilePage("Comptes");
    });

    await test.step("she should see table column names", async () => {
      await customer.assertColumns([
        "Compte",
        "Immeuble",
        "Adresse",
        "Solde au",
      ]);
    });

    await test.step("the table should not be empty", async () => {
      await customer.assertTableNotEmpty();
    });

    await test.step('she should see each elements of the section "Comptes"', async () => {
      await customer.assertElementsVisible([
        "button-open-dialog-account-situation",
      ]);
    });
  },
);

test(
  "Display - Customers - Pages - Verify Documents page contents",
  { tag: BASE_TAGS },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step('she goes to the page "customer/.../co-owner"', async () => {
      await customer.goto("/customer/5e5db02d5ca01a2b327b11f0/co-owner");
    });

    await test.step('she accesses the customer "coowner" profile "Documents" page', async () => {
      await customer.openProfilePage("Documents");
    });

    await test.step('she should see each elements of the section "Documents"', async () => {
      await customer.assertElementsVisible(["LayoutSidenavCenter"]);
    });
  },
);

test(
  "Display - Customers - Pages - Verify Missions page contents",
  { tag: [...BASE_TAGS, "@smoke"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step('she goes to the page "customer/.../co-owner"', async () => {
      await customer.goto("/customer/5e5db02d5ca01a2b327b11f0/co-owner");
    });

    await test.step('she accesses the customer "coowner" profile "Missions" page', async () => {
      await customer.openProfilePage("Missions");
    });

    await test.step("she should see table column names", async () => {
      await customer.assertColumns([
        "Identifiant",
        "Intitulé",
        "Type",
        "Gestionnaire",
        "Modifié le",
        "Statut",
      ]);
    });

    await test.step('she should see each elements of the section "Missions"', async () => {
      await customer.assertElementsVisible([
        "number",
        "label",
        "selectType",
        "single-search--associate",
        "selectStatut",
        "table-pagination",
      ]);
    });
  },
);

test(
  "Display - Customers - Pages - Verify Co-owner page contents",
  { tag: [...BASE_TAGS, "@smoke"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step('she goes to the page "customer/.../co-owner"', async () => {
      await customer.goto("/customer/5e5db02d5ca01a2b327b11f0/co-owner");
    });

    await test.step('she accesses the customer "coowner" profile "Lots" page', async () => {
      await customer.openProfilePage("Lots");
    });

    await test.step("she should see the buildings table columns", async () => {
      await customer.assertColumns(["Immeuble", "Adresse", "Tantièmes", "CS"]);
      await customer.assertTableNotEmpty();
    });

    await test.step("she should see the units table columns", async () => {
      await customer.assertColumns([
        "N˚ lot",
        "Localisation",
        "Date d'acquisition",
        "Date de transfert",
        "Type de bien",
        "Pièces",
        "Surface",
        "Gestion locative",
        "Tantièmes",
      ]);
      await customer.assertTableNotEmpty();
    });

    await test.step("she should see the accounts table columns", async () => {
      await customer.assertColumns([
        "N° compte copropriétaire",
        "Nom de compte",
        "Type",
        "Statut",
        "Bascule",
        "Lots",
        "Mode de paiement",
        "IBAN virtuel",
      ]);
    });

    await test.step('she should see each elements of the section "Lots"', async () => {
      await customer.assertElementsVisible(["pagination"]);
    });
  },
);

test(
  "Display - Customers - Pages - Verify Dashboard - Identity - page contents",
  { tag: [...BASE_TAGS, "@smoke"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step('she goes to the page "customer/.../co-owner"', async () => {
      await customer.goto("/customer/5e5db02d5ca01a2b327b11f0/co-owner");
    });

    await test.step('she accesses the customer dashboard "Fiche identité" page', async () => {
      await customer.openDashboardPage("Fiche identité");
    });

    await test.step('she should see each elements of the section "Fiche identité"', async () => {
      await customer.assertElementsVisible([
        "LayoutSidenavCenter",
        "Card",
        "cardTitle",
        "civility",
        "lastName",
        "firstName",
        "address.address1",
        "address.zipCode",
        "address.city",
        "mobilePhone",
        "email",
      ]);
    });
  },
);

test(
  "Display - Customers - Pages - Verify Dashboard - Contacts - page contents",
  { tag: [...BASE_TAGS, "@smoke"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step('she goes to the page "customer/.../co-owner"', async () => {
      await customer.goto("/customer/5e5db02d5ca01a2b327b11f0/co-owner");
    });

    await test.step('she accesses the customer dashboard "Contacts" page', async () => {
      await customer.openDashboardPage("Contacts");
    });

    await test.step("she should see table column names", async () => {
      await customer.assertColumns([
        "Nom",
        "Addresse",
        "Email",
        "Téléphone",
        "Profession",
      ]);
    });

    await test.step('she should see each elements of the section "Contacts"', async () => {
      await customer.assertElementsVisible([
        "LayoutSidenavCenter",
        "Card",
        "CardHeader",
        "cardTitle",
      ]);
    });
  },
);

test(
  "Display - Customers - Pages - Verify Dashboard - Tickets - page contents",
  { tag: [...BASE_TAGS, "@smoke"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step('she goes to the page "customer/.../co-owner"', async () => {
      await customer.goto("/customer/5e5db02d5ca01a2b327b11f0/co-owner");
    });

    await test.step('she accesses the customer dashboard "Tickets" page', async () => {
      await customer.openDashboardPage("Tickets");
    });

    await test.step("she should see table column names", async () => {
      await customer.assertColumns([
        "Référence",
        "Source",
        "Immeuble",
        "Objet",
        "Créé le",
        "Modifié par",
        "Statut",
      ]);
    });

    await test.step('she should see each elements of the section "Tickets"', async () => {
      await customer.assertElementsVisible([
        "ticketNumber",
        "source",
        "building",
        "category",
        "createdAt",
        "status",
      ]);
    });
  },
);

test(
  "Display - Customers - Pages - Verify Dashboard - Missions - page contents",
  { tag: [...BASE_TAGS, "@smoke"] },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step('she goes to the page "customer/.../co-owner"', async () => {
      await customer.goto("/customer/5e5db02d5ca01a2b327b11f0/co-owner");
    });

    await test.step('she accesses the customer dashboard "Missions" page', async () => {
      await customer.openDashboardPage("Missions");
    });

    await test.step("she should see table column names", async () => {
      await customer.assertColumns([
        "Identifiant",
        "Intitulé",
        "Type",
        "Gestionnaire",
        "Modifié le",
        "Statut",
      ]);
    });

    await test.step('she should see each elements of the section "Missions"', async () => {
      await customer.assertElementsVisible([
        "number",
        "label",
        "selectType",
        "single-search--associate",
        "selectStatut",
        "table-pagination",
      ]);
    });
  },
);

test(
  "Display - Customers with several accounts - Pages - Verify Provisions page contents",
  { tag: BASE_TAGS },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step("she goes to the multi-account co-owner page", async () => {
      await customer.goto("/customer/5e5db02dffa82fd3f67b4d7b/co-owner");
    });

    await test.step('she accesses the customer "coowner" profile "Documents" page', async () => {
      await customer.openProfilePage("Documents");
    });

    await test.step("she selects the second co-owner's account", async () => {
      await customer.selectSecondAccount();
    });

    await test.step('she clicks on "provisionCalls" card', async () => {
      await customer.openDocumentCategory("provisionCalls");
    });

    await test.step('she should see each elements of the section "Provisions"', async () => {
      await customer.assertElementsVisible(["originalFilename", "category"]);
    });
  },
);

test(
  "Display - Customers with several accounts - Pages - Verify Assemblée générale page contents",
  { tag: BASE_TAGS },
  async ({ sessionFor }) => {
    const celine = await test.step('Celine is logged in "ADB"', () =>
      sessionFor("adb:Celine"));
    const customer = new CoOwnerCustomerPage(celine);

    await test.step("she goes to the multi-account co-owner page", async () => {
      await customer.goto("/customer/5e5db02dffa82fd3f67b4d7b/co-owner");
    });

    await test.step('she accesses the customer "coowner" profile "Documents" page', async () => {
      await customer.openProfilePage("Documents");
    });

    await test.step("she selects the second co-owner's account", async () => {
      await customer.selectSecondAccount();
    });

    await test.step('she clicks on "generalAssembly" card', async () => {
      await customer.openDocumentCategory("generalAssembly");
    });

    await test.step('she should see each elements of the section "Assemblée générale"', async () => {
      await customer.assertElementsVisible([
        "originalFilename",
        "generalAssemblyYearSelect",
        "category",
      ]);
    });
  },
);

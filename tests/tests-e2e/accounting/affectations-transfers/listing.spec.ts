import {
  AffectationTransfersPage,
  extractFilters,
  extractTransferItem,
} from "@/pages/adb/affectation-transfers/affectation-transfers.page";

import { test } from "../../../../helpers/auth/session.fixture";
import { expect } from "../../../../report/base.fixture";

let transfersPage: AffectationTransfersPage;

test.beforeEach(async ({ sessionFor }) => {
  const sofian = await sessionFor("bo:sofian");
  transfersPage = new AffectationTransfersPage(sofian);
});

test("Listing - BO - Affectation-transfers - Non-affectés - No filter", async () => {
  await transfersPage.goto("/affectation/transfers/manuals");

  await transfersPage.assertPageTitle("Encaissement des virements");
  await transfersPage.assertLegoTableColumnNamesVisible([
    "Cabinet",
    "Métier",
    "Compte bancaire",
    "Date",
    "Ref virement",
    "Libellé virement",
    "Montant",
    "Modifier l'affectation",
  ]);
  await transfersPage.assertCategoriesVisible();
  await transfersPage.assertTableNotEmpty();
});

test("Listing - BO - Affectation-transfers - Historique des Affectations - No filter", async () => {
  await transfersPage.goto("/affectation/transfers/history");
  await transfersPage.assertPageTitle("Encaissement des virements");
  await transfersPage.assertLegoTableColumnNamesVisible([
    "Cabinet",
    "Métier",
    "Compte bancaire",
    "Date",
    "Ref virement",
    "Libellé virement",
    "Montant",
    "Affectation",
    "Bénéficiaire(s)",
    "Annuler l'affectation",
  ]);
  await transfersPage.assertCategoriesVisible();
  await transfersPage.assertTableNotEmpty();
});

test(
  "Listing - BO - Affectation-transfers - Non-affectés - Using multi filte",
  {
    tag: ["@smoke"],
  },
  async () => {
    const transfersPromise = transfersPage.waitForTransfers("manuals");

    await transfersPage.goto("/affectation/transfers/manuals");

    const responseBody = await transfersPromise;
    const item = extractTransferItem(responseBody);
    expect(item).toBeTruthy();

    await transfersPage.assertTableNotEmpty();

    const bankAccountFilter = extractFilters(item, "bankAccount");
    const referenceFilter = extractFilters(item, "bankTransferReference");
    const labelFilter = extractFilters(item, "label");

    await transfersPage.applyFilters(bankAccountFilter);
    await transfersPage.applyFilters(referenceFilter);
    await transfersPage.applyFilters(labelFilter);

    await transfersPage.assertTableNotEmpty();
  },
);

test(
  "Listing - BO - Affectation-transfers - Historique des Affectations - Using multi filter",
  {
    tag: ["@smoke"],
  },
  async () => {
    const transfersPromise = transfersPage.waitForTransfers("history");
    await transfersPage.goto("/affectation/transfers/history");

    const responseBody = await transfersPromise;
    const item = extractTransferItem(responseBody);
    expect(item).toBeTruthy();

    await transfersPage.assertTableNotEmpty();

    const bankAccountFilter = extractFilters(item, "bankAccount");
    const referenceFilter = extractFilters(item, "bankTransferReference");
    const labelFilter = extractFilters(item, "label");

    await transfersPage.applyFilters(bankAccountFilter);
    await transfersPage.applyFilters(referenceFilter);
    await transfersPage.applyFilters(labelFilter);

    await transfersPage.assertTableNotEmpty();
  },
);

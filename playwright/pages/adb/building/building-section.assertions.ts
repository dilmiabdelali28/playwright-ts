import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Locator, type Page } from "@playwright/test";

function mainContent(page: Page): Locator {
  return page.getByTestId("LayoutSidenavCenter");
}

function tableFilterBar(scope: Locator): Locator {
  return scope
    .getByRole("table")
    .first()
    .locator("..")
    .locator("> div")
    .first();
}

function muiTextField(
  scope: Locator,
  label: string,
  options: { exact?: boolean } = {},
): Locator {
  return tableFilterBar(scope)
    .getByText(label, { exact: options.exact ?? false })
    .locator("..")
    .getByRole("textbox");
}

type BuildingSectionName =
  | "Contrats"
  | "Salariés"
  | "Tickets"
  | "Missions"
  | "Équipements"
  | "Diagnostics"
  | "Documents"
  | "Comptes"
  | "Comptes bancaires"
  | "Soldes des copropriétaires"
  | "Soldes des compteurs";

export async function assertBuildingSectionElements(
  page: Page,
  section: BuildingSectionName,
): Promise<void> {
  switch (section) {
    case "Contrats":
      await assertContratsSection(page);
      break;
    case "Salariés":
      await assertSalariesSection(page);
      break;
    case "Tickets":
      await assertTicketsSection(page);
      break;
    case "Missions":
      await assertMissionsSection(page);
      break;
    case "Équipements":
      await assertEquipmentsSection(page);
      break;
    case "Diagnostics":
      await assertDiagnosticsSection(page);
      break;
    case "Documents":
      await assertDocumentsSection(page);
      break;
    case "Comptes":
      await assertComptesSection(page);
      break;
    case "Comptes bancaires":
      await assertComptesBancairesSection(page);
      break;
    case "Soldes des copropriétaires":
      await assertSoldesCoproprietairesSection(page);
      break;
    case "Soldes des compteurs":
      await assertSoldesCompteursSection(page);
      break;
    default:
      throw new Error(`Unknown building section: ${section}`);
  }
}

async function assertContratsSection(page: Page): Promise<void> {
  await expect(page.getByTestId("description")).toBeVisible();
  await expect(page.getByTestId("contractNumber")).toBeVisible();
  await expect(page.getByTestId("startingDate")).toBeVisible();
  await expect(page.getByTestId("endingDate")).toBeVisible();
  await expect(page.getByTestId("status")).toBeVisible();
  await expect(page.getByTestId("supplier")).toBeVisible();
  await expect(
    page.getByTestId("button").filter({ hasText: "RÉINITIALISER" }),
  ).toBeVisible();
  await expect(page.getByTestId("addContractButton")).toBeVisible();
  await expect(page.getByTestId("pagination")).toBeVisible();
}

async function assertSalariesSection(page: Page): Promise<void> {
  await expect(
    page.getByTestId("button").filter({ hasText: "Ajouter un salarié" }),
  ).toBeVisible();
}

async function assertTicketsSection(page: Page): Promise<void> {
  await expect(
    page.locator('[data-shadcn="badge"][data-kind="red"]').filter({
      hasText: "à traiter",
    }),
  ).toBeVisible();
  await expect(
    page.locator('[data-shadcn="badge"][data-kind="orange"]').filter({
      hasText: "en cours",
    }),
  ).toBeVisible();
  await expect(page.getByTestId("ticketNumber")).toBeVisible();
  await expect(page.getByTestId("createdAt")).toBeVisible();
  await expect(page.getByTestId("category")).toBeVisible();
  await expect(page.getByTestId("status")).toBeVisible();
  await expect(page.getByTestId("customer")).toBeVisible();
}

async function assertMissionsSection(page: Page): Promise<void> {
  await expect(page.getByTestId("number")).toBeVisible();
  await expect(page.getByTestId("label")).toBeVisible();
  await expect(page.getByTestId("selectType")).toBeVisible();
  await expect(page.getByTestId("selectStatut")).toBeVisible();
  await expect(page.getByTestId("single-search--associate")).toBeVisible();
  await expect(page.getByTestId("table-pagination")).toBeVisible();
}

async function assertEquipmentsSection(page: Page): Promise<void> {
  await expect(
    page.getByRole("button", { name: "Mettre à jour" }).first(),
  ).toBeVisible();
  await expect(page.getByTestId("elevatorCount")).toBeVisible();
  await expect(
    page.locator('input[type="checkbox"][name="heatChoice"]'),
  ).toHaveCount(3);
  await expect(page.locator('input[name="Type de vue"]')).toHaveCount(1);
}

async function assertDiagnosticsSection(page: Page): Promise<void> {
  await clickAccordion(page, "Amiante");
  await expect(
    page.getByRole("button", { name: "Mettre à jour" }).first(),
  ).toBeVisible();
  await expect(page.locator('input[type="radio"]').first()).toBeAttached({
    timeout: TEST_CONFIG.timeouts.medium,
  });

  await clickAccordion(page, "Plomb");
  await expect(page.getByTestId("metadata.CREP_COMMENT")).toBeVisible();

  await clickAccordion(page, "Termites");
  await expect(
    page.getByTestId("metadata.TERMITE_RESEARCH_COMMENT"),
  ).toBeVisible();

  await clickAccordion(page, "Autres risques sanitaires");
  await expect(
    page.getByTestId("metadata.OTHER_DIAGNOSTICS_COMMENT"),
  ).toBeVisible();
}

async function assertDocumentsSection(page: Page): Promise<void> {
  await expect(
    page.getByTestId("button").filter({ hasText: "Ajouter un document" }),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid^="documentCategory-"]').first(),
  ).toBeVisible();
}

async function assertComptesSection(page: Page): Promise<void> {
  await expect(
    page.getByTestId("button").filter({ hasText: "Export XLSX" }),
  ).toBeVisible();
  await expect(
    page.getByTestId("Card").filter({ hasText: "Solde bancaire" }),
  ).toBeVisible();
  await expect(
    page.getByTestId("Card").filter({ hasText: "Solde comptable" }),
  ).toBeVisible();
  await expect(
    page.getByTestId("Card").filter({ hasText: "Solde prévisionnel" }),
  ).toBeVisible();
  await expect(
    page
      .getByTestId("accordionTitle")
      .filter({ hasText: "001 - DEPENSES GENERALES" }),
  ).toBeVisible();
}

async function assertComptesBancairesSection(page: Page): Promise<void> {
  const content = mainContent(page);
  const accountCard = content
    .locator("header")
    .filter({ hasText: /COMPTE/i })
    .locator("..");

  await expect(accountCard.locator("header div").first()).toBeVisible();

  for (const label of [
    "IBAN",
    "ICS",
    "Nº de compte",
    "Code banque",
    "Statut",
  ] as const) {
    await expect(accountCard.getByText(label, { exact: true })).toBeVisible();
  }
}

async function assertSoldesCoproprietairesSection(page: Page): Promise<void> {
  const content = mainContent(page);

  await expect(muiTextField(content, "Numéro de compte")).toBeVisible();
  await expect(muiTextField(content, "Nom", { exact: true })).toBeVisible();
}

async function assertSoldesCompteursSection(page: Page): Promise<void> {
  const content = mainContent(page);

  await expect(content.getByText(/^Solde \d+$/)).toBeVisible();
  await expect(content.getByTestId("accountingAccount")).toBeVisible();
  await expect(content.getByText("Solde compteur par lot")).toBeVisible();
  await expect(content.getByTestId("history")).toBeVisible();
  await expect(content.getByText("Fonds travaux mobilisable")).toBeVisible();
  await expect(content.getByTestId("mobilizable")).toBeVisible();
  await expect(muiTextField(content, "N° de lot")).toBeVisible();
  await expect(muiTextField(content, "Copropriétaire")).toBeVisible();
}

async function clickAccordion(page: Page, section: string): Promise<void> {
  await page
    .getByTestId("AccordionItemHeader")
    .filter({ hasText: section })
    .scrollIntoViewIfNeeded();
  await page
    .getByTestId("AccordionItemHeader")
    .filter({ hasText: section })
    .click();
}

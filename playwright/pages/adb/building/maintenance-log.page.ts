import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Locator, type Page } from "@playwright/test";

import type { BuildingPage } from "./building.page";

const GENERATE_BUTTON_LABEL = "Générer carnet d'entretien";
const GENERATED_ALERT = "Le carnet d'entretien a bien été généré.";
const PUBLISHED_ALERT = "Le carnet d'entretien a bien été publié.";

const GENERATION_TIMEOUT = 90_000;

export class MaintenanceLogPage {
  private publishedLogId: string | null = null;

  constructor(
    private readonly page: Page,
    private readonly buildingPage: BuildingPage,
  ) {}

  async accessMaintenanceLog(buildingId: string): Promise<void> {
    const origin = new URL(this.page.url()).origin;

    const missionRepairs = this.page.waitForResponse(
      (response) =>
        response.url().includes("/maintenance-log/mission-repairs") &&
        response.status() === 200,
      { timeout: TEST_CONFIG.timeouts.long },
    );
    const allocationKeys = this.page.waitForResponse(
      (response) =>
        response.url().includes("/allocation-keys") &&
        response.status() === 200,
      { timeout: TEST_CONFIG.timeouts.long },
    );

    await this.page.goto(`${origin}/building/${buildingId}/maintenance-log`, {
      waitUntil: "domcontentloaded",
    });

    await Promise.all([missionRepairs, allocationKeys]);
  }

  async generateMaintenanceLog(): Promise<void> {
    const generationStarted = this.page.waitForResponse(
      (response) =>
        response.url().includes("/generate-maintenance-log") &&
        response.request().method() === "POST" &&
        response.status() === 201,
      { timeout: TEST_CONFIG.timeouts.long },
    );

    await this.page
      .getByRole("button", { name: GENERATE_BUTTON_LABEL })
      .click();
    await generationStarted;

    await expect(this.page.locator("[data-sonner-toaster]")).toContainText(
      GENERATED_ALERT,
      { timeout: GENERATION_TIMEOUT },
    );
  }

  async assertGeneratedLogIsListedAndActionable(): Promise<void> {
    await expect(this.generatedDocumentLine()).toHaveCount(1);
    await expect(
      this.generatedDocumentLine().locator('[data-testid="publish-file"]'),
    ).toBeEnabled();
    await expect(
      this.generatedDocumentLine().getByTestId("download-file"),
    ).toBeEnabled();
  }

  async publishMaintenanceLog(): Promise<void> {
    const publishResponse = this.page.waitForResponse(
      (response) =>
        /buildings\/.+\/publish-maintenance-log\//.test(response.url()) &&
        response.request().method() === "POST" &&
        response.status() === 200,
      { timeout: TEST_CONFIG.timeouts.long },
    );

    await this.generatedDocumentLine()
      .locator('[data-testid="publish-file"]')
      .click();

    const confirmButton = this.page
      .getByRole("button", { name: "Confirmer" })
      .first();
    await expect(confirmButton).toBeDisabled();

    await this.page.getByTestId("confirmInput").fill("CONFIRMER");
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    const response = await publishResponse;
    const body = (await response.json()) as { _id: string };
    this.publishedLogId = body._id;

    await expect(this.page.locator("[data-sonner-toaster]")).toContainText(
      PUBLISHED_ALERT,
      { timeout: TEST_CONFIG.timeouts.long },
    );
    await expect(
      this.page
        .locator('[data-testid="document-line"]')
        .filter({ hasText: "Publier" }),
    ).toHaveCount(0);
  }

  async assertMaintenanceLogIsPublished(): Promise<void> {
    if (!this.publishedLogId) {
      throw new Error(
        "Cannot assert publication: maintenance log was not published first",
      );
    }

    await this.buildingPage.openSidebarPage("Documents");
    await this.page
      .locator('[data-testid^="documentCategory-"]')
      .filter({ hasText: "Documents de la copropriété" })
      .first()
      .click();

    await expect(
      this.page.locator(`[data-testid="filename-${this.publishedLogId}"]`),
    ).toContainText("carnet d'entretien", {
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(
      this.page.locator(
        `[data-testid="isHiddenOnMyFoncia-${this.publishedLogId}"]`,
      ),
    ).toContainText("Oui");
  }

  async toggleRandomContractAndAssertPersisted(): Promise<void> {
    const rows = this.contractRows();
    // The contracts table loads after the page shell; wait for it to render.
    await expect(rows.first()).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });

    const count = await rows.count();
    expect(
      count,
      "There must be at least one contract to toggle",
    ).toBeGreaterThan(0);

    const index = Math.floor(Math.random() * count);
    const row = rows.nth(index);
    const checkbox = row.getByRole("checkbox");
    // Column "N° contrat" — used to re-find the row after reload.
    const contractNumber = (
      await row.locator('[data-testid$="-contractNumber"]').innerText()
    ).trim();

    const persisted = this.page
      .waitForResponse(
        (response) =>
          response.url().includes("/buildings/") &&
          response.request().method() !== "GET" &&
          response.status() < 400,
        { timeout: TEST_CONFIG.timeouts.long },
      )
      .catch(() => null);

    await checkbox.click();
    await persisted;
    const expectedChecked = await checkbox.isChecked();

    await this.page.reload({ waitUntil: "domcontentloaded" });

    const persistedCheckbox = this.contractRows()
      .filter({ hasText: contractNumber })
      .getByRole("checkbox");
    await expect(persistedCheckbox).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });

    expect(await persistedCheckbox.isChecked()).toBe(expectedChecked);
  }

  private generatedDocumentLine(): Locator {
    // The generated document is named "carnet d'entretien <date>" — the digit
    // after the label avoids matching a building whose name contains the phrase.
    return this.page
      .locator('[data-testid="CardHeader"]')
      .filter({ hasText: /carnet d'entretien \d/i });
  }

  private contractsTable(): Locator {
    return this.page.locator("table").filter({
      has: this.page.getByRole("columnheader", {
        name: "N° contrat fournisseur",
      }),
    });
  }

  private contractRows(): Locator {
    return this.contractsTable().locator("tbody tr");
  }
}

import { waitForGraphqlOperation } from "@helpers/api/network/waitForGraphqlOperation";
import { formatDate } from "@helpers/common/formatDate";
import { TEST_CONFIG } from "@helpers/common/test-config";
import { fillDateField } from "@helpers/ui";
import { expect, type Page } from "@playwright/test";

import type { BuildingPage } from "./building.page";

const SIDEBAR = "[data-testid='LayoutSidenavLeft']";

const PREVIOUS_TAB = "previous-coownership-mandate-tab";
const CURRENT_TAB = "current-coownership-mandate-tab";
const NEXT_TAB = "next-coownership-mandate-tab";

export class BuildingMandatePage {
  constructor(
    private readonly page: Page,
    private readonly buildingPage: BuildingPage,
  ) {}

  /* -------------------- Navigation -------------------- */

  async landOnMandatePage(buildingId: string): Promise<void> {
    const origin = new URL(this.page.url()).origin;
    const featuresPromise = this.page.waitForResponse(
      (response) =>
        response.url().includes("features?agencyId=") &&
        response.status() === 200,
      { timeout: TEST_CONFIG.timeouts.long },
    );

    await this.page.goto(`${origin}/building/${buildingId}/mandate`, {
      waitUntil: "domcontentloaded",
    });
    await featuresPromise;

    await this.page
      .locator(`${SIDEBAR} a`)
      .filter({ hasText: "Mandat" })
      .first()
      .click();
  }

  async accessMandateAndFees(): Promise<void> {
    await this.buildingPage.assertSidebarHeaderVisible();
    await this.buildingPage.openSidebarPage("Mandat & honoraires");
  }

  /* -------------------- Tabs -------------------- */

  async assertNoPreviousMandate(): Promise<void> {
    await expect(this.page.getByTestId(PREVIOUS_TAB)).toHaveCount(0);
  }

  async assertNoComingMandate(): Promise<void> {
    await expect(this.page.getByTestId(NEXT_TAB)).toHaveCount(0);
  }

  async assertMandateInProgress(): Promise<void> {
    await expect(this.page.getByTestId(CURRENT_TAB)).toContainText(
      "Mandat en cours",
    );
  }

  async assertThreeMandates(labels: string[]): Promise<void> {
    const [previousLabel, currentLabel, nextLabel] = labels;

    await expect(this.page.getByTestId(PREVIOUS_TAB)).toContainText(
      previousLabel,
    );
    await expect(this.page.getByTestId(CURRENT_TAB)).toContainText(
      currentLabel,
    );
    await expect(this.page.getByTestId(NEXT_TAB)).toContainText(nextLabel);
  }

  /* -------------------- Mandate number -------------------- */

  private async waitForCurrentMandateFormReady(): Promise<void> {
    await expect(this.page.getByTestId(CURRENT_TAB)).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });

    const numberField = this.page.getByTestId("number");
    await expect(numberField).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(numberField).toBeEnabled({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(
      this.page
        .getByTestId("mandateinformationsBtn")
        .filter({ hasText: "Mettre à jour" }),
    ).toBeEnabled({ timeout: TEST_CONFIG.timeouts.long });
  }

  async assertMandateNumberEditable(): Promise<void> {
    await this.waitForCurrentMandateFormReady();

    const updateResponse = waitForGraphqlOperation(
      this.page,
      "updateCoOwnershipMandate",
    );

    await this.page.getByTestId("number").clear();
    await this.page
      .getByTestId("mandateinformationsBtn")
      .filter({ hasText: "Mettre à jour" })
      .click();

    await updateResponse;
  }

  async updateMandateNumber(): Promise<void> {
    await this.waitForCurrentMandateFormReady();

    const numberField = this.page.getByTestId("number");
    // Unique per run: "789" collides with mandates left by other parallel tests.
    const mandateNumber = `${Date.now()}`;
    await numberField.clear();
    await numberField.fill(mandateNumber);

    const updateResponse = waitForGraphqlOperation(
      this.page,
      "updateCoOwnershipMandate",
    );

    await this.page
      .getByTestId("mandateinformationsBtn")
      .filter({ hasText: "Mettre à jour" })
      .click();

    await updateResponse;
  }

  async assertMandateNumberUpdated(): Promise<void> {
    await expect(this.page.locator("[data-sonner-toaster]")).toContainText(
      "Le mandat a été modifié avec succès",
      { timeout: TEST_CONFIG.timeouts.long },
    );
  }

  /* -------------------- Fees & pricing -------------------- */

  async assertFeesAndPricingScales(columnTitles: string[]): Promise<void> {
    await expect(this.page.getByTestId("accordionTitle")).toContainText(
      "HONORAIRES - GRILLES TARIFAIRES",
    );

    const firstPricingTable = this.page
      .locator('[data-slot="accordion-item"] table')
      .first();

    for (const title of columnTitles) {
      await expect(
        firstPricingTable
          .locator("thead tr th")
          .filter({ hasText: title })
          .first(),
      ).toBeVisible({ timeout: TEST_CONFIG.timeouts.long });
    }
  }

  /* -------------------- Coming mandate validation -------------------- */

  async validateContractInComingMandate(): Promise<void> {
    const today = new Date();
    const inOneYear = new Date(today);
    inOneYear.setFullYear(inOneYear.getFullYear() + 1);

    await this.page.getByTestId(NEXT_TAB).click();
    await this.page.getByTestId("number").fill(`${Date.now()}`);
    const saveButton = this.page
      .getByRole("button", { name: "Sauvegarder" })
      .first();

    await expect(async () => {
      await fillDateField({
        page: this.page,
        testId: "currentMandateBeginningDate",
        value: formatDate(today),
      });
      await fillDateField({
        page: this.page,
        testId: "currentMandateEndDate",
        value: formatDate(inOneYear),
      });
      await expect(
        this.page.getByText("La date est inférieure à la date minimale"),
      ).toHaveCount(0);
      await expect(saveButton).toBeEnabled();
    }).toPass({ timeout: TEST_CONFIG.timeouts.long });

    await saveButton.click();

    await this.page.getByRole("button", { name: "Valider" }).first().click();

    const confirmInput = this.page.getByTestId("confirmInput");
    await expect(confirmInput).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });

    await confirmInput.fill("CONFIRMER");
    await confirmInput.blur();

    const confirmButton = this.page.getByTestId("confirm").first();

    await expect(async () => {
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }
      await expect(confirmInput).toHaveCount(0, {
        timeout: TEST_CONFIG.timeouts.medium,
      });
    }).toPass({ timeout: TEST_CONFIG.timeouts.long });

    await waitForGraphqlOperation(
      this.page,
      "GetBuildingWithCoOwnershipMandatesDetails",
    ).catch(() => undefined);
    await waitForGraphqlOperation(
      this.page,
      "GetBuildingWithPricingsDetails",
    ).catch(() => undefined);
  }

  async assertMandateInformationsNotModified(): Promise<void> {
    const branchField = this.page.getByTestId("branch");
    await expect(branchField).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });

    const branchIsShadcnCombobox =
      (await branchField.getAttribute("data-shadcn")) === "combobox";

    if (branchIsShadcnCombobox) {
      await expect(branchField).toBeDisabled();
    } else {
      await expect(branchField.locator("input")).toBeDisabled();
    }

    const disabledTestIds = [
      "currentMandateBeginningDate",
      "currentMandateEndDate",
      "duration",
      "missionTrusteeCouncilCount",
      "missionVisitCount",
    ];

    for (const testId of disabledTestIds) {
      await expect(this.page.getByTestId(testId)).toBeDisabled();
    }

    const ariaDisabledIds = [
      "missionGeneralAssemblyDuration",
      "missionTrusteeCouncilDuration",
      "missionVisitDuration",
    ];

    for (const id of ariaDisabledIds) {
      const shadcnField = this.page.getByTestId(`select-field-${id}`);

      if ((await shadcnField.count()) > 0) {
        await expect(shadcnField).toBeDisabled();
        continue;
      }

      const muiField = this.page.getByTestId(id);
      if ((await muiField.count()) > 0) {
        await expect(muiField).toHaveClass(/Mui-disabled/);
        continue;
      }

      await expect(this.page.locator(`[id*="${id}"]`)).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }

    await expect(
      this.page.getByRole("button", { name: "Sauvegarder" }).first(),
    ).toBeDisabled();
  }
}

import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Page } from "@playwright/test";

import type { BuildingPage } from "./building.page";

export type BuildingFormData = {
  buildingName: string;
  primaryAddress: string;
  secondaryAddress: string;
  zipCode: string;
  city: string;
  sector: string;
};

const SIDEBAR = "[data-testid='LayoutSidenavLeft']";
const MAX_PHYSICAL_BUILDING_DELETIONS = 10;

export class BuildingInformationsPage {
  constructor(private readonly page: Page) {}

  async deleteBuildingIfExists(buildingPage: BuildingPage): Promise<void> {
    await buildingPage.accessBuildingSection("Informations Générales");

    const physicalBuildingLinks = this.page.locator(
      `${SIDEBAR} a[href*="/details/physicalbuilding/"]`,
    );

    for (
      let deleted = 0;
      deleted < MAX_PHYSICAL_BUILDING_DELETIONS;
      deleted += 1
    ) {
      if ((await physicalBuildingLinks.count()) === 0) {
        return;
      }

      await physicalBuildingLinks.first().click();
      await expect(
        this.page
          .getByTestId("button")
          .filter({ hasText: "Supprimer le bâtiment" }),
      ).toBeVisible({ timeout: TEST_CONFIG.timeouts.medium });
      await this.removeBuilding();
      await buildingPage.accessBuildingSection("Informations Générales");
    }

    throw new Error(
      `Could not delete all physical buildings after ${MAX_PHYSICAL_BUILDING_DELETIONS} attempts`,
    );
  }

  async addNewBuilding(buildingPage: BuildingPage): Promise<void> {
    await this.deleteBuildingIfExists(buildingPage);
    await buildingPage.accessBuildingSection("Informations Générales");
    await expect(this.page.getByTestId("addBuilding")).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await this.page.getByTestId("addBuilding").click();
  }

  async updateBuilding(data: BuildingFormData): Promise<string> {
    await this.page
      .getByTestId("identity.physicalBuildingName")
      .first()
      .fill(data.buildingName);
    await this.page
      .getByTestId("entrances.0.address.address1")
      .first()
      .fill(data.primaryAddress);
    await this.page
      .getByTestId("entrances.0.address.address2")
      .first()
      .fill(data.secondaryAddress);
    await this.page
      .getByTestId("entrances.0.address.zipCode")
      .first()
      .fill(data.zipCode);
    await this.page
      .getByTestId("entrances.0.address.city")
      .first()
      .fill(data.city);
    await this.page
      .getByTestId("entrances.0.alur.districtName")
      .first()
      .fill(data.sector);

    const updateResponse = this.page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        response.url().includes("/buildings/ms-estate/") &&
        response.url().includes("/physicalBuildings/") &&
        response.status() === 200,
      { timeout: TEST_CONFIG.timeouts.long },
    );

    await this.page
      .getByTestId("button")
      .filter({ hasText: "Mettre à jour" })
      .click();

    const response = await updateResponse;
    const body = (await response.json()) as { buildingNumber?: string };

    if (!body.buildingNumber) {
      throw new Error(
        "Building update response did not contain buildingNumber",
      );
    }

    return body.buildingNumber;
  }

  async removeBuilding(): Promise<void> {
    const deleteResponse = this.page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes("/buildings/ms-estate/") &&
        response.url().includes("/physicalBuildings/") &&
        response.status() === 200,
      { timeout: TEST_CONFIG.timeouts.long },
    );

    await this.page
      .getByTestId("button")
      .filter({ hasText: "Supprimer le bâtiment" })
      .click();
    await this.page.locator("[name=confirmInput]").fill("CONFIRMER");
    await this.page.locator("[name=confirmInput]").press("Enter");

    await deleteResponse;
  }

  async assertBuildingFormValues(data: BuildingFormData): Promise<void> {
    await expect(
      this.page.getByTestId("identity.physicalBuildingName").first(),
    ).toHaveValue(data.buildingName);
    await expect(
      this.page.getByTestId("entrances.0.address.address1").first(),
    ).toHaveValue(data.primaryAddress);
    await expect(
      this.page.getByTestId("entrances.0.address.address2").first(),
    ).toHaveValue(data.secondaryAddress);
    await expect(
      this.page.getByTestId("entrances.0.address.zipCode").first(),
    ).toHaveValue(data.zipCode);
    await expect(
      this.page.getByTestId("entrances.0.address.city").first(),
    ).toHaveValue(data.city);
    await expect(
      this.page.getByTestId("entrances.0.alur.districtName").first(),
    ).toHaveValue(data.sector);
  }
}

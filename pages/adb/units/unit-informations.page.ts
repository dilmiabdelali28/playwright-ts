import { waitForRestResponse } from "@helpers/api/network/waitForRestResponse";
import { TEST_CONFIG } from "@helpers/common/test-config";
import { selectDropdownList } from "@helpers/ui";
import { expect, type Locator, type Page } from "@playwright/test";

interface UnitAddressUpdate {
  addressInformation?: string;
  building?: string;
  floor?: string;
  staircase?: string;
  district?: string;
  sector?: string;
}

const ENTRANCE_FIELDS = {
  address2: "entrance.address.address2",
  district: "entrance.alur.districtName",
  sector: "entrance.address.sector",
} as const;

const LOCATION_FIELDS = {
  property: "location.property",
  level: "location.level",
  stairs: "location.stairs",
} as const;

export class UnitInformationsPage {
  constructor(private readonly page: Page) {}

  // =====================
  // LOCATORS — entrance
  // =====================

  private fieldInput(testId: string): Locator {
    return this.page
      .locator(
        `input[data-testid="${testId}"], [data-testid="${testId}"] input, textarea[data-testid="${testId}"], [data-testid="${testId}"] textarea`,
      )
      .first();
  }

  private entranceInput(field: keyof typeof ENTRANCE_FIELDS): Locator {
    return this.fieldInput(ENTRANCE_FIELDS[field]);
  }

  // =====================
  // LOCATORS — location
  // =====================

  private locationInput(field: keyof typeof LOCATION_FIELDS): Locator {
    return this.fieldInput(LOCATION_FIELDS[field]);
  }

  // =====================
  // LOCATORS — equipment
  // =====================

  private get updateButton(): Locator {
    return this.page.getByTestId("button").filter({ hasText: "Mettre à jour" });
  }

  private get generalEquipmentSection(): Locator {
    // The section title is a <p> (not a heading since the Tailwind migration).
    // The title, equipment list and "Ajouter" button are flat siblings inside
    // the same wrapper (the SectionEquipment fragment adds no DOM node), so we
    // scope through the title's parent to disambiguate from the energetic
    // equipment section, which shares the same button label and testid.
    return this.page
      .getByText("Équipements généraux", { exact: true })
      .locator("..");
  }

  private get addGeneralEquipmentButton(): Locator {
    return this.generalEquipmentSection.getByRole("button", {
      name: "Ajouter un équipement",
    });
  }

  private get saveButton(): Locator {
    return this.page.getByTestId("button").filter({ hasText: "Sauvegarder" });
  }

  private get generalEquipmentList(): Locator {
    return this.generalEquipmentSection.getByTestId("equipment-list");
  }

  private get confirmButton(): Locator {
    return this.page.getByTestId("confirm");
  }

  // =====================
  // ACTIONS
  // =====================

  private waitForUnitPatch(): Promise<unknown> {
    return waitForRestResponse(
      this.page,
      "/units/",
      "PATCH",
      TEST_CONFIG.timeouts.long,
    );
  }

  private async fillEntranceFields(address: UnitAddressUpdate): Promise<void> {
    if (address.addressInformation) {
      await this.entranceInput("address2").fill(address.addressInformation);
    }
    if (address.district) {
      await this.entranceInput("district").fill(address.district);
    }
    if (address.sector) {
      await this.entranceInput("sector").fill(address.sector);
    }
  }

  private async fillLocationFields(address: UnitAddressUpdate): Promise<void> {
    if (address.building) {
      await this.locationInput("property").fill(address.building);
    }
    if (address.floor) {
      await this.locationInput("level").fill(address.floor);
    }
    if (address.staircase) {
      await this.locationInput("stairs").fill(address.staircase);
    }
  }

  private async submitUpdate(): Promise<void> {
    const updateResponse = this.waitForUnitPatch();
    await this.updateButton.click();
    await updateResponse;
  }

  async updateAddress(address: UnitAddressUpdate): Promise<void> {
    await this.fillEntranceFields(address);
    await this.fillLocationFields(address);
    await this.submitUpdate();
  }

  async addGeneralEquipment(equipmentLabel: string): Promise<void> {
    await this.addGeneralEquipmentButton.click();

    await selectDropdownList({
      page: this.page,
      dataTestId: "equipment",
      by: { optionValue: equipmentLabel },
    });

    await this.saveButton.click();
    await this.submitUpdate();
  }

  async deleteGeneralEquipment(): Promise<void> {
    await this.generalEquipmentList.getByTestId("button").first().click();
    await this.confirmButton.click();
  }

  // =====================
  // ASSERTIONS
  // =====================

  async assertAddressUpdate(address: UnitAddressUpdate): Promise<void> {
    if (address.addressInformation) {
      await expect(this.entranceInput("address2")).toHaveValue(
        address.addressInformation,
      );
    }
    if (address.building) {
      await expect(this.locationInput("property")).toHaveValue(
        address.building,
      );
    }
  }

  async assertGeneralEquipment(equipmentLabel: string): Promise<void> {
    await expect(
      this.generalEquipmentList.getByText(equipmentLabel),
    ).toBeVisible();
  }

  async assertNoGeneralEquipment(): Promise<void> {
    await expect(this.generalEquipmentList).toContainText(
      "Pas d'équipement pour ce lot.",
    );
  }
}

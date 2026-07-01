import { waitForRestResponse } from "@helpers/api/network/waitForRestResponse";
import { resolveAdbApi } from "@helpers/auth/adb-api";
import { TEST_CONFIG } from "@helpers/common/test-config";
import { fillField, selectDropdownList } from "@helpers/ui";
import { expect, type Page } from "@playwright/test";

export type MissionRepairInfos = {
  generalAssemblyDateDateField: string;
  deliveredAtDateField: string;
  votedBudgetAmountField: string;
  labelTextField: string;
};

export type StepMissionRepair = {
  label: string;
  fullname: string;
  address1: string;
  address2: string;
  zipCode: string;
  city: string;
  phoneNumber: string;
  email: string;
};

const COOWNERSHIP_WORKS_TABLE = "coownershipWorksTable";
const API_TIMEOUT = 60_000;

export class MaintenanceLogMissionRepairPage {
  private missionRepairId = "";

  constructor(private readonly page: Page) {}

  async addMissionRepair(infos: MissionRepairInfos): Promise<void> {
    await this.scrollToMissionRepair();
    await this.page
      .getByRole("button", { name: "Ajouter des marchés travaux votés" })
      .click();

    await selectDropdownList({
      page: this.page,
      dataTestId: "selectAddMissionRepairMaintenanceLog",
      by: { searchText: "Ajout manuel de travaux déjà votés" },
      clearInput: true,
      findOptionWithSearchText: true,
    });

    await this.selectFirstAllocationKey();

    await fillField({
      page: this.page,
      testId: "generalAssemblyDateAddMissionRepairMaintenanceLog",
      value: infos.generalAssemblyDateDateField,
    });
    await fillField({
      page: this.page,
      testId: "deliveredAtAddMissionRepairMaintenanceLog",
      value: infos.deliveredAtDateField,
    });
    await fillField({
      page: this.page,
      testId: "votedBudgetAddMissionRepairMaintenanceLog",
      value: infos.votedBudgetAmountField,
    });
    await fillField({
      page: this.page,
      testId: "labelAddMissionRepairMaintenanceLog",
      value: infos.labelTextField,
    });
  }

  async addStep(index: number, data: StepMissionRepair): Promise<void> {
    await this.page
      .getByTestId("addStepAddMissionRepairMaintenanceLog")
      .click();

    const stepPrefix = `stepAddMissionRepairMaintenanceLog.steps.${index}`;
    await fillField({
      page: this.page,
      testId: `${stepPrefix}.label`,
      value: data.label,
    });
    await fillField({
      page: this.page,
      testId: `${stepPrefix}.supplier.fullname`,
      value: data.fullname,
    });
    await fillField({
      page: this.page,
      testId: `${stepPrefix}.supplier.address.address1`,
      value: data.address1,
    });
    await fillField({
      page: this.page,
      testId: `${stepPrefix}.supplier.address.address2`,
      value: data.address2,
    });
    await fillField({
      page: this.page,
      testId: `${stepPrefix}.supplier.address.zipCode`,
      value: data.zipCode,
    });
    await fillField({
      page: this.page,
      testId: `${stepPrefix}.supplier.address.city`,
      value: data.city,
    });
    await fillField({
      page: this.page,
      testId: `${stepPrefix}.supplier.phoneNumber`,
      value: data.phoneNumber,
    });
    await fillField({
      page: this.page,
      testId: `${stepPrefix}.supplier.email`,
      value: data.email,
    });
  }

  async sendMissionRepair(): Promise<void> {
    const postResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes("/maintenance-log/mission-repairs") &&
        response.request().method() === "POST" &&
        response.status() === 200,
      { timeout: API_TIMEOUT },
    );

    await this.page.getByTestId("saveAddMissionRepairMaintenanceLog").click();

    const response = await postResponse;
    const body = (await response.json()) as {
      _id: string;
      label: string;
      votedBudget: { value: number };
    };

    expect(body._id, "Mission repair must have an id").toBeTruthy();
    expect(body.votedBudget.value).toBe(100000);
    expect(body.label).toBe("test");

    this.missionRepairId = String(body._id);
  }

  async assertMissionRepair(
    stepsLength: number,
    infos: MissionRepairInfos,
  ): Promise<void> {
    await expect(
      this.page.getByTestId(`label-${this.missionRepairId}`),
    ).toHaveText(infos.labelTextField);
    await expect(
      this.page.getByTestId(`generalAssemblyDate-${this.missionRepairId}`),
    ).toHaveText(infos.generalAssemblyDateDateField);
    await expect(
      this.page.getByTestId(`deliveredAt-${this.missionRepairId}`),
    ).toHaveText(infos.deliveredAtDateField);
    await expect(
      this.page.getByTestId(`votedBudget.value-${this.missionRepairId}`),
    ).toHaveText(`${infos.votedBudgetAmountField} €`);
    await expect(
      this.page.getByTestId(`steps.length-${this.missionRepairId}`),
    ).toHaveText(`${stepsLength}`);
  }

  async editMissionRepairLabel(newLabel: string): Promise<void> {
    const patchResponse = waitForRestResponse(
      this.page,
      /\/maintenance-log\/mission-repairs\//,
      "PATCH",
      API_TIMEOUT,
    );

    await this.openRowMenu("Modifier");
    await fillField({
      page: this.page,
      testId: "labelAddMissionRepairMaintenanceLog",
      value: newLabel,
      clear: true,
    });
    await this.page.getByTestId("saveAddMissionRepairMaintenanceLog").click();

    expect((await patchResponse).status()).toBe(200);
  }

  async editMissionRepairStep(): Promise<void> {
    const patchResponse = waitForRestResponse(
      this.page,
      /\/maintenance-log\/mission-repairs\//,
      "PATCH",
      API_TIMEOUT,
    );

    await this.openRowMenu("Modifier");
    await fillField({
      page: this.page,
      testId: "stepAddMissionRepairMaintenanceLog.steps.0.label",
      value: "chantier edited",
      clear: true,
    });
    await this.page.getByTestId("saveAddMissionRepairMaintenanceLog").click();

    expect((await patchResponse).status()).toBe(200);
  }

  async assertMissionRepairEdited(newLabel: string): Promise<void> {
    await this.scrollToMissionRepair();
    await expect(
      this.page.getByTestId(`label-${this.missionRepairId}`),
    ).toHaveText(newLabel);
  }

  async deleteMissionRepair(): Promise<void> {
    const deleteResponse = waitForRestResponse(
      this.page,
      /\/maintenance-log\/mission-repairs\//,
      "DELETE",
      API_TIMEOUT,
    );

    await this.openRowMenu("Supprimer");
    await this.confirmDeletionIfPrompted();

    expect((await deleteResponse).status()).toBe(200);
  }

  private async confirmDeletionIfPrompted(): Promise<void> {
    const confirmButton = this.page
      .getByRole("button", { name: "Confirmer" })
      .last();
    try {
      await confirmButton.waitFor({ state: "visible", timeout: 4_000 });
      await confirmButton.click();
    } catch {
      // No confirmation step — deletion fired directly from the menu item.
    }
  }

  async assertMissionRepairNotExists(): Promise<void> {
    await this.scrollToMissionRepair();
    await expect(
      this.page.getByTestId(`label-${this.missionRepairId}`),
    ).toHaveCount(0);
  }

  async deleteAllMissionRepairs(buildingId: string): Promise<void> {
    const { baseUrl, token } = await resolveAdbApi(this.page);
    const headers = { authorization: `Bearer ${token}` };

    const response = await this.page.request.get(
      `${baseUrl}/buildings/${buildingId}/maintenance-log`,
      { headers },
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      maintenanceLog?: { missionRepairs?: Record<string, unknown>[] };
    };
    const missionRepairs = body.maintenanceLog?.missionRepairs ?? [];
    const ids = missionRepairs.map((item) => Object.values(item)[0]);

    for (const id of ids) {
      await this.page.request.delete(
        `${baseUrl}/buildings/${buildingId}/maintenance-log/mission-repairs/${String(id)}`,
        { headers },
      );
    }
  }

  private async selectFirstAllocationKey(): Promise<void> {
    await selectDropdownList({
      page: this.page,
      dataTestId: "allocationKeyAddMissionRepairMaintenanceLog",
      by: { optionIndex: 0 },
    });
  }

  private async scrollToMissionRepair(): Promise<void> {
    await this.page
      .getByTestId(COOWNERSHIP_WORKS_TABLE)
      .scrollIntoViewIfNeeded();
  }

  private async openRowMenu(item: "Modifier" | "Supprimer"): Promise<void> {
    await this.scrollToMissionRepair();
    const trigger = this.page
      .locator(`[data-testid="isActivate-${this.missionRepairId}"]`)
      .getByRole("button")
      .first();
    const menuItem = this.page.getByRole("menuitem", { name: item }).first();

    // After the edit modal closes the list re-renders, so the first click on the
    // row trigger can be swallowed; retry opening until the menu item shows up.
    await expect(async () => {
      await trigger.click({ force: true });
      await expect(menuItem).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: TEST_CONFIG.timeouts.medium });

    await menuItem.click();
  }
}

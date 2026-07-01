import { expect, type Page } from "@playwright/test";

import { MissionSidebarPage } from "../mission-sidebar.page";

const BUDGET_TIMEOUT = 60000;

export class AgBudgetPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await new MissionSidebarPage(this.page).openPageByTestId("pageBudget");
  }

  async validateBudget(): Promise<void> {
    await this.page
      .getByRole("button", { name: "Validation gestionnaire" })
      .click();
    await this.page.getByTestId("confirm").click();

    await expect(
      this.page.getByRole("button", { name: "Transmettre au CS" }),
    ).toBeEnabled({ timeout: BUDGET_TIMEOUT });
    await this.page.getByRole("button", { name: "Transmettre au CS" }).click();
    await this.page.getByTestId("confirm").click();

    await expect(
      this.page.getByRole("button", { name: "Valider le budget" }),
    ).toBeEnabled({ timeout: BUDGET_TIMEOUT });
    await this.page.getByRole("button", { name: "Valider le budget" }).click();
    await this.page.getByTestId("confirm").click();
  }
}

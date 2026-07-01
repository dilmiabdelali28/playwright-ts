import path from "node:path";

import { expect, type Page } from "@playwright/test";

import { PROJECT_PATHS } from "../../../../helpers/config/project-paths";
import { MissionSidebarPage } from "../mission-sidebar.page";

export class AgSignaturesPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await new MissionSidebarPage(this.page).openSignaturesPage();
  }

  async uploadMinutes(): Promise<void> {
    const pdfPath = path.join(PROJECT_PATHS.pdfFixturesDir, "test1.pdf");

    await this.page
      .getByTestId("button")
      .filter({ hasText: "J'ai un PV déjà signé" })
      .click();
    await this.page
      .getByTestId("button")
      .filter({ hasText: "Déposer le fichier ici" })
      .locator('input[type="file"]')
      .setInputFiles(pdfPath);
  }

  async sendMinutesToOfficeMembers(): Promise<void> {
    await this.uploadMinutes();
    await this.completeSignerInfo(0);
    await this.completeSignerInfo(1, {
      mobilePhone: "+33678678678",
      email: "678678678@emeria.eu",
    });

    await expect(
      this.page.getByTestId("button").filter({ hasText: "Diffuser le PV" }),
    ).toBeDisabled();
    await expect(
      this.page
        .getByTestId("button")
        .filter({ hasText: "Envoyer aux membres du bureau" }),
    ).toBeDisabled();
    await expect(
      this.page
        .getByTestId("button")
        .filter({ hasText: "Réinitialiser la signature" }),
    ).toBeVisible();
  }

  private async completeSignerInfo(
    index: number,
    options?: { mobilePhone?: string; email?: string },
  ): Promise<void> {
    await this.page.getByTestId("editSignerInfo").nth(index).click();
    await this.page.getByTestId("radio-civility-option-MR").click();

    if (options?.mobilePhone) {
      await this.page
        .locator('input[name="phone-field-mobilePhone"]')
        .fill(options.mobilePhone);
    }

    if (options?.email) {
      const emailInput = this.page
        .getByTestId("text-field-email")
        .locator("input");
      await emailInput.clear();
      await emailInput.fill(options.email);
    }

    await this.page.getByTestId("saveForm").click();
  }
}

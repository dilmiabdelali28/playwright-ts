import { waitForGraphqlOperation } from "@helpers/api/network/waitForGraphqlOperation";
import { waitForRestResponse } from "@helpers/api/network/waitForRestResponse";
import { expect, type Page } from "@playwright/test";

import { MissionSidebarPage } from "../mission-sidebar.page";
import type { MissionAgVoteConfig } from "./mission-ag.types";

const PDF_TIMEOUT = 300000;
const END_AG_TIMEOUT = 120000;

export class AgVotePage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await new MissionSidebarPage(this.page).openPageByTestId("pageHandleODJ");
  }

  async startAgAndTerminateVotes(config: MissionAgVoteConfig): Promise<void> {
    for (const resolutionIndex of config.resolutionsToBeVoted) {
      await this.startVoteByResolution(resolutionIndex, config.coownersPresent);
    }
  }

  async generatePv(missionId: string): Promise<void> {
    const getMinutesPromise = waitForRestResponse(
      this.page,
      `/missions/general-assembly/${missionId}/download-minutes`,
      "GET",
      PDF_TIMEOUT,
    );

    await this.page.getByTestId("generateOrDownloadMinutes").click();
    await getMinutesPromise;

    await expect(this.page.getByTestId("ModalContainer")).toBeVisible();
    await expect(this.page.getByTestId("ModalContainer")).toContainText(
      "PV de l'Assemblée Générale",
    );
    await expect(this.page.getByTestId("endAG")).toBeEnabled({
      timeout: PDF_TIMEOUT,
    });
  }

  async downloadAgMinutes(): Promise<void> {
    const pdfViewer = this.page.getByTestId("pdfViewer");
    await expect(pdfViewer).toBeVisible({ timeout: PDF_TIMEOUT });
    await pdfViewer.hover();
    await expect(this.page.getByTestId("downloadDocument")).toBeVisible();
    await this.page.getByTestId("downloadDocument").click();
  }

  async endPv(): Promise<void> {
    const initializeSignatoryPromise = waitForGraphqlOperation(
      this.page,
      "InitializeSignatory",
    );

    await this.page.getByTestId("endAG").click();
    await initializeSignatoryPromise;

    await expect(this.page.getByTestId("mission-statusOrStep")).toContainText(
      "PV à",
      { timeout: END_AG_TIMEOUT },
    );
    await expect(this.page.getByTestId("mission-statusOrStep")).toContainText(
      "faire signer",
      { timeout: END_AG_TIMEOUT },
    );
  }

  private async startVoteByResolution(
    rowNumber: number,
    coownersPresent: number,
    tableIndex = 0,
  ): Promise<void> {
    const resolutionsTable = this.page.locator("tbody").nth(tableIndex);
    const resolutionKind = (
      await resolutionsTable
        .locator('[data-testid^="kind-"]')
        .nth(rowNumber - 1)
        .innerText()
    ).trim();

    if (resolutionKind === "Comptabilité") {
      await this.voteAccountingResolution(
        rowNumber,
        coownersPresent,
        tableIndex,
      );
      return;
    }

    await resolutionsTable
      .locator('[data-testid^="number-"]')
      .nth(rowNumber - 1)
      .click();

    const voteButton = this.page
      .locator(
        '[data-testid="voteButton"], button:has-text("Voter cette résolution")',
      )
      .first();

    if (!(await voteButton.isEnabled().catch(() => false))) {
      return;
    }

    await this.page.getByRole("button", { name: "Enregistrer" }).click();
    await voteButton.click();
    const status = await this.voteResolution(coownersPresent);
    await expect(
      resolutionsTable.locator('[data-testid^="status-"]').nth(rowNumber - 1),
    ).toHaveText(status);
  }

  private async voteAccountingResolution(
    rowNumber: number,
    coownersPresent: number,
    tableIndex: number,
  ): Promise<void> {
    const resolutionsTable = this.page.locator("tbody").nth(tableIndex);

    await resolutionsTable
      .locator('[data-testid^="number-"]')
      .nth(rowNumber - 1)
      .click();

    const voteButton = this.page
      .locator(
        '[data-testid="voteButton"], button:has-text("Voter cette résolution")',
      )
      .first();

    if (!(await voteButton.isEnabled().catch(() => false))) {
      return;
    }

    await voteButton.click();
    const status = await this.voteResolution(coownersPresent);
    await expect(
      resolutionsTable.locator('[data-testid^="status-"]').nth(rowNumber - 1),
    ).toHaveText(status);
    await this.page.getByRole("button", { name: "Enregistrer" }).click();
  }

  private async voteResolution(coownersPresent: number): Promise<string> {
    for (let index = 0; index < coownersPresent; index++) {
      let voteType = "POUR";
      if (index === 2) {
        voteType = "ABSTENTION";
      } else if (index === 3) {
        voteType = "CONTRE";
      }

      await this.page
        .locator(
          `[data-testid="ModalContainer"] tbody:last-child > tr:nth-child(${index + 1}) td input[value="${voteType}"] + span`,
        )
        .click();
    }

    await this.page.getByTestId("registerVote").click();

    const approvedBadge = this.page.locator(
      '[data-testid="ModalContainer"] [data-shadcn="badge"][data-kind="green"]:has-text("Approuvée")',
    );
    const refusedBadge = this.page.locator(
      '[data-testid="ModalContainer"] [data-shadcn="badge"][data-kind="red"]:has-text("Refusée")',
    );

    let status = "Approuvée";
    if (await refusedBadge.isVisible().catch(() => false)) {
      status = "Refusée";
    } else {
      await expect(approvedBadge).toBeVisible();
    }

    await this.page.getByTestId("modalClose").click();
    return status;
  }
}

import path from "node:path";

import { waitForRestResponse } from "@helpers/api/network/waitForRestResponse";
import { formatParisAccountingPeriodRange } from "@helpers/common/formatDate";
import { expect, type Page } from "@playwright/test";

import { PROJECT_PATHS } from "../../../../helpers/config/project-paths";
import { MissionSidebarPage } from "../mission-sidebar.page";
import type {
  MissionAgResolutionUpdate,
  ResolutionRow,
} from "./mission-ag.types";

type AccountingExercise = {
  openingDate: string;
  closingDate: string;
};

async function extractTableRows(
  page: Page,
  tableIndex: number,
  startRow: number,
  columnOffset: number,
  columnCount: number,
): Promise<string[][]> {
  return page.evaluate(
    ({ tableIndex, startRow, columnOffset, columnCount }) => {
      const table = document.querySelectorAll("table")[tableIndex];
      if (!table) {
        return [];
      }
      const rows = Array.from(table.querySelectorAll("tbody tr")).slice(
        startRow,
      );
      return rows
        .map((row) => {
          const cells = Array.from(row.querySelectorAll("td")).slice(
            columnOffset,
            columnOffset + columnCount,
          );
          return cells.map((cell) =>
            (cell.innerText ?? "")
              .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
              .replace(/\s+/g, " ")
              .trim(),
          );
        })
        .filter((row) => row.some((cell) => cell.length > 0));
    },
    { tableIndex, startRow, columnOffset, columnCount },
  );
}

export class AgAgendaManagementPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await new MissionSidebarPage(this.page).openPageByTestId(
      "pageODJManagement",
    );
  }

  private resolveAccountingLabels(
    resolutions: ResolutionRow[],
    accountingExercises: AccountingExercise[],
  ): ResolutionRow[] {
    const [exercise0, exercise1, exercise2] = accountingExercises;
    const labelReplacements: Record<string, string> = {
      "@accountingPeriodLabel4": `APPROBATION DES COMPTES DE L'EXERCICE ${formatParisAccountingPeriodRange(exercise0)}`,
      "@accountingPeriodLabel11": `AJUSTEMENT DU BUDGET PRÉVISIONNEL POUR L'EXERCICE ${formatParisAccountingPeriodRange(exercise1)}`,
      "@accountingPeriodLabel12": `VOTE DU BUDGET PREVISIONNEL POUR L'EXERCICE ${formatParisAccountingPeriodRange(exercise2)}`,
      "@accountingPeriodLabel14": `DÉTERMINATION DU MONTANT DE LA COTISATION OBLIGATOIRE DU FONDS DE TRAVAUX POUR L'EXERCICE ${formatParisAccountingPeriodRange(exercise2)}`,
    };

    return resolutions.map((resolution) => ({
      ...resolution,
      label: labelReplacements[resolution.label] ?? resolution.label,
    }));
  }

  async assertAgoResolutionsTable(
    resolutions: ResolutionRow[],
    accountingExercises: AccountingExercise[],
  ): Promise<void> {
    const resolved = this.resolveAccountingLabels(
      resolutions,
      accountingExercises,
    );
    const expectedTable = resolved.map((row) => [
      row.number,
      row.type,
      row.label,
    ]);

    await expect(
      this.page
        .locator('[data-testid="cardTitle"]')
        .filter({ hasText: "Résolutions" }),
    ).toBeVisible();

    const actualTable = await extractTableRows(this.page, 0, 0, 2, 3);
    expect(actualTable).toEqual(expectedTable);
  }

  async assertUnionCouncilSubResolutions(
    subResolutions: ResolutionRow[],
    candidatureLabel?: string,
  ): Promise<void> {
    await this.toggleUnionCouncilSubResolutions();

    const resolved = subResolutions.map((row) => ({
      ...row,
      label: row.label.includes("Candidature de")
        ? (candidatureLabel ?? row.label)
        : row.label,
    }));

    const expectedTable = resolved.map((row) => [
      row.number,
      row.type,
      row.label,
    ]);
    const actualTable = await extractTableRows(this.page, 1, 0, 1, 3);
    expect(actualTable).toEqual(expectedTable);

    await this.toggleUnionCouncilSubResolutions();
  }

  async checkAllSelectedAgoResolutionTitles(): Promise<void> {
    const resolutionCountText = await this.page
      .getByTestId("resolutionCount")
      .innerText();
    const resolutionCount = Number.parseInt(resolutionCountText, 10);

    const resolutionCells = this.page.locator("table tbody tr td:nth-child(5)");
    const labels = await resolutionCells.allInnerTexts();

    for (let index = 1; index < resolutionCount; index++) {
      const label = labels[index - 1]?.trim() ?? "";
      await resolutionCells.nth(index - 1).click();
      await expect(
        this.page.getByTestId("resolutionTitle").locator("p"),
      ).toHaveText(label);
    }

    await this.toggleUnionCouncilSubResolutions();

    const subCells = this.page
      .locator("table")
      .nth(1)
      .locator("tr td:nth-child(4)");
    const subLabels = await subCells.allInnerTexts();

    for (let index = 0; index <= 1; index++) {
      const label = subLabels[index]?.trim() ?? "";
      await subCells.nth(index).click();
      await expect(
        this.page.getByTestId("resolutionTitle").locator("p"),
      ).toHaveText(label);
    }

    await this.toggleUnionCouncilSubResolutions();
  }

  async updateAgResolutions(
    resolutions: MissionAgResolutionUpdate[],
  ): Promise<void> {
    const pdfPath = path.join(PROJECT_PATHS.pdfFixturesDir, "test1.pdf");

    for (const resolution of resolutions) {
      if (resolution.addPdf === "yes") {
        await this.focusOnResolution(resolution.number);
        await this.uploadPdfInResolution(pdfPath);
      }
    }
  }

  async deleteResolution(
    resolutionLabel: string,
    withConfirm: boolean,
  ): Promise<void> {
    await this.page
      .locator("tr")
      .filter({ hasText: resolutionLabel })
      .getByRole("checkbox")
      .click();
    await this.page.getByRole("button", { name: "Supprimer" }).click();

    if (withConfirm) {
      await this.page.getByTestId("confirm").click();
    }
  }

  async generateAgConvocation(missionId: string): Promise<void> {
    const getResolutionsPromise = waitForRestResponse(
      this.page,
      `/missions/general-assembly/${missionId}/resolution`,
      "GET",
      180000,
    );

    await this.page.getByTestId("generateConvocation").click();
    await getResolutionsPromise;
    await expect(this.page.getByTestId("openSendConvocation")).toBeVisible({
      timeout: 120000,
    });
  }

  async sendAgConvocation(missionId: string): Promise<void> {
    const sendConvocationPromise = waitForRestResponse(
      this.page,
      `/missions/general-assembly/${missionId}/send-convocations?kind=DOCAPOSTE`,
      "POST",
      180000,
    );

    await this.page.getByTestId("openSendConvocation").click();
    await this.page.getByTestId("accordionTitle").click();
    await expect(this.page.getByTestId("pdfViewer")).toBeVisible();
    await this.page.getByTestId("confirmInput").click();
    await this.page.getByTestId("confirmInput").fill("CONFIRMER");
    await this.page.getByTestId("confirm").click();
    await sendConvocationPromise;
  }

  private async focusOnResolution(number: string): Promise<void> {
    const row = this.page.locator(
      `[data-testid="ag-page-agenda"] tbody tr[data-testid="${number}"] td[data-testid^="number-"]`,
    );
    await row.scrollIntoViewIfNeeded();
    await row.click();
  }

  private async dismissCorruptedDocumentModalIfVisible(): Promise<void> {
    const modal = this.page.getByTestId("ModalContainer").filter({
      hasText: "Document corrompu",
    });
    const understoodButton = modal.getByRole("button", {
      name: "J'ai compris",
    });

    const isVisible = await understoodButton
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (!isVisible) {
      return;
    }

    await understoodButton.click();
    await modal.waitFor({ state: "hidden", timeout: 10000 });
  }

  private async uploadPdfInResolution(pdfPath: string): Promise<void> {
    const fileName = path.basename(pdfPath);
    const validateDocumentPromise = waitForRestResponse(
      this.page,
      /document\/validate/,
      "POST",
      60000,
    );

    await this.page.locator('input[type="file"]').setInputFiles(pdfPath);
    await validateDocumentPromise;
    await this.dismissCorruptedDocumentModalIfVisible();

    // PdfPreview renders an <a> with onClick (no href) — not exposed as role=link
    await expect(
      this.page
        .getByTestId("downloadDocument")
        .or(this.page.getByText(fileName, { exact: true })),
    ).toBeVisible({ timeout: 30000 });

    const putResolutionPromise = waitForRestResponse(
      this.page,
      /missions\/general-assembly\/.*\/resolution\//,
      "PUT",
      120000,
    );
    await this.page.getByRole("button", { name: "Enregistrer" }).click();
    await putResolutionPromise;
  }

  private async toggleUnionCouncilSubResolutions(): Promise<void> {
    await this.page.getByTestId("8").locator("td").first().click();
  }
}

import { TEST_CONFIG } from "@helpers/common/test-config";
import { selectDropdownList } from "@helpers/ui";
import { expect, type Page } from "@playwright/test";

import { getOktaAccessTokenWithRetry } from "../../helpers/auth/bo-auth";
import {
  loadEnvironmentConfig,
  resolveFixturesRoot,
} from "../../helpers/auth/environment-fixtures";
import { MissionSidebarPage } from "../adb/mission/mission-sidebar.page";
import { BoHomePage } from "./view-accounting.page";

const ACCOUNTING_PERIOD_STATUS: Record<string, string> = {
  "À préparer": "TO_PREPARE",
  "À venir": "TO_COME_UP",
  Préparé: "PREPARED",
};

export class AccountantsPreparationPage {
  private readonly boHomePage: BoHomePage;
  private readonly missionSidebar: MissionSidebarPage;

  constructor(private readonly page: Page) {
    this.boHomePage = new BoHomePage(page);
    this.missionSidebar = new MissionSidebarPage(page);
  }

  async openCoproTab(): Promise<void> {
    await this.boHomePage.openTab("Copropriété");
  }

  async gotoAccountantsPreparation(
    accountingPeriodStatus: string,
  ): Promise<void> {
    const statusKind = ACCOUNTING_PERIOD_STATUS[accountingPeriodStatus];
    const accountingPeriodsPromise = this.page.waitForResponse(
      (response) =>
        response
          .url()
          .includes(
            `/accounting/coownership/exercise-accountant/expense-statement?kind=${statusKind}`,
          ) && [200, 304].includes(response.status()),
      { timeout: 60000 },
    );

    await this.page
      .locator("a[href='/exercises/TO_PREPARE']")
      .filter({ hasText: "Préparation et justification des comptes" })
      .click();
    await this.page
      .locator(`a[data-testid="tab-item"]`)
      .filter({ hasText: accountingPeriodStatus })
      .click();
    await accountingPeriodsPromise;
  }

  async selectAgencySmartly(agency: string): Promise<void> {
    const associateAgenciesPromise = this.page
      .waitForResponse(
        (response) =>
          response.url().includes("associate") &&
          response.url().includes("agencies") &&
          response.status() === 200,
        { timeout: TEST_CONFIG.timeouts.long },
      )
      .catch(() => null);

    await associateAgenciesPromise;

    const selector = this.page
      .locator(
        '[data-testid="agency"], [data-testid="single-search--agency"], [data-testid="single-search--currentAgency"]',
      )
      .first();

    if (!(await selector.isVisible({ timeout: 2500 }))) {
      return;
    }

    await selector.click();
    const input = selector.locator("input").first();

    if (!(await input.isVisible({ timeout: 1500 }))) {
      return;
    }

    await input.fill(agency);
    const option = this.page
      .getByRole("option", {
        name: new RegExp(agency.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      })
      .first();

    if (await option.isVisible({ timeout: 1500 })) {
      await option.click();
      return;
    }

    await input.press("Enter");
  }

  async searchAndSelectAccountingPeriod(
    buildingAddress: string,
  ): Promise<void> {
    await this.page.keyboard.press("Escape");
    await this.page
      .locator('[role="listbox"]')
      .waitFor({ state: "hidden", timeout: 5000 })
      .catch(() => undefined);

    await expect(this.page.getByTestId("single-search--building")).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });

    await selectDropdownList({
      page: this.page,
      dataTestId: "single-search--building",
      by: { searchText: buildingAddress },
      findOptionWithSearchText: true,
    });

    const row = this.page.locator("tr").filter({ hasText: buildingAddress });
    await expect(row.first()).toBeVisible({ timeout: 60000 });

    await row
      .first()
      .locator("td[data-testid^='link-'] button")
      .filter({ hasText: "Préparé" })
      .click();
  }

  async openDocumentsStep(): Promise<void> {
    await this.missionSidebar.openPage("Documents");
  }

  async updateAccountingDocuments(): Promise<void> {
    await expect(
      this.page
        .locator("[data-testid^='filename-']")
        .filter({ hasText: /^ANNEXE1\.pdf$/ }),
    ).toBeVisible({ timeout: 30000 });

    const generateAppendixesPromise = this.page.waitForResponse(
      (response) =>
        response
          .url()
          .includes("/accounting/coownership/exercise-accountant/") &&
        response.url().includes("/appendixes") &&
        response.request().method() === "POST" &&
        response.status() === 200,
      { timeout: 120000 },
    );

    await this.page
      .getByRole("button", { name: "Mettre à jour les documents" })
      .click();

    const postResponse = await generateAppendixesPromise;
    await this.waitForAppendixesReady(postResponse.url());
  }

  private resolvePollUrl(pollUrl: string): string {
    if (pollUrl.startsWith("http")) {
      return pollUrl;
    }

    const config = loadEnvironmentConfig(
      resolveFixturesRoot(TEST_CONFIG.fixturesDir),
    );
    const apiBaseUrl = config.env?.BO?.API_BASE_URL;

    if (!apiBaseUrl) {
      throw new Error("Missing BO API_BASE_URL for appendix polling");
    }

    return new URL(pollUrl, apiBaseUrl).toString();
  }

  private async waitForAppendixesReady(
    pollUrl: string,
    maxAttempts = 120,
  ): Promise<void> {
    const token = await getOktaAccessTokenWithRetry(this.page);
    if (!token) {
      throw new Error("Unable to resolve BO access token for appendix polling");
    }

    const resolvedPollUrl = this.resolvePollUrl(pollUrl);
    const headers = { Authorization: `Bearer ${token}` };
    let lastStatus = 0;
    let lastBody: {
      appendixes: { documents: Record<string, unknown> };
    } | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const pollResponse = await this.page.request.get(resolvedPollUrl, {
        headers,
      });
      lastStatus = pollResponse.status();

      if (pollResponse.status() !== 200) {
        await this.page.waitForTimeout(2000);
        continue;
      }

      lastBody = (await pollResponse.json()) as {
        appendixes: { documents: Record<string, unknown> };
      };

      const isReady = Object.values(lastBody.appendixes.documents).every(
        (document) => {
          if (Array.isArray(document)) {
            return true;
          }

          return (
            typeof document === "object" &&
            document !== null &&
            "hashFile" in document &&
            (document as { hashFile: string }).hashFile !== "hash25"
          );
        },
      );

      if (isReady) {
        return;
      }

      await this.page.waitForTimeout(2000);
    }

    throw new Error(
      `At least one appendix is not ready after polling (lastStatus=${lastStatus}, body=${JSON.stringify(lastBody?.appendixes.documents ?? null)})`,
    );
  }
}

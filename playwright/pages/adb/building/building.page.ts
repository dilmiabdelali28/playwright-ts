import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Page } from "@playwright/test";

const SIDEBAR = "[data-testid='LayoutSidenavLeft']";

const BUDGET_SUB_PAGES = new Set([
  "Charges courantes",
  "Fonds travaux",
  "Travaux à réaliser",
  "Avance de trésorerie",
]);

const IDENTITY_SUB_PAGES = new Set([
  "Informations Générales",
  "Batiment 1",
  "Bâtiment 1",
  "Immeuble atypique",
]);

const HEADER_H3_PAGES = new Set([
  "Contrats",
  "Documents",
  "Échéancier",
  "Charges courantes",
  "Travaux à réaliser",
  "Avance de trésorerie",
  "Fonds travaux",
]);

export class BuildingPage {
  constructor(public readonly page: Page) {}

  /* -------------------- Navigation -------------------- */

  async gotoBuilding(
    buildingPath: string,
    options?: { waitForFeatures?: boolean },
  ): Promise<void> {
    const origin = new URL(this.page.url()).origin;
    const featuresPromise = options?.waitForFeatures
      ? this.page.waitForResponse(
          (response) =>
            response.url().includes("features?agencyId=") &&
            response.status() === 200,
          { timeout: TEST_CONFIG.timeouts.long },
        )
      : null;

    await this.page.goto(`${origin}/${buildingPath}`, {
      waitUntil: "domcontentloaded",
    });

    if (featuresPromise) {
      await featuresPromise;
    }
  }

  async assertSidebarHeaderVisible(): Promise<void> {
    const sidebar = this.page.locator(SIDEBAR);
    await expect(
      sidebar.locator('[data-testid="sidenav-header-title"]'),
    ).toBeVisible({ timeout: TEST_CONFIG.timeouts.long });
    await expect(
      sidebar.locator('[data-testid="sidenav-header-subtitle"]'),
    ).toBeVisible();
    await expect(
      sidebar.locator('[data-testid="sidenav-header-data-0"]'),
    ).toBeVisible();
    await expect(
      this.page.locator('[data-testid="chip-building-status"]'),
    ).toBeVisible();
  }

  async accessBuildingSection(menuItem: string): Promise<void> {
    await this.assertSidebarHeaderVisible();

    if (IDENTITY_SUB_PAGES.has(menuItem)) {
      await this.openSidebarPage("Fiche identité");
      await expect(
        this.page.getByTestId("Section").filter({ hasText: "Identité" }),
      ).toBeVisible();
      await expect(this.page).toHaveURL(/details\/general/);
    } else if (BUDGET_SUB_PAGES.has(menuItem)) {
      await this.openSidebarPage("Échéancier");
    }

    await this.openSidebarPage(menuItem);
  }

  async openSidebarPage(label: string): Promise<void> {
    const link = this.page.locator(`${SIDEBAR} a`).filter({ hasText: label });
    await expect(link.first()).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(link.first()).not.toHaveAttribute("disabled");
    await link.first().click();
  }

  /* -------------------- Page title -------------------- */

  async assertPageTitle(pageName: string, pageTitle: string): Promise<void> {
    if (HEADER_H3_PAGES.has(pageName)) {
      const headerH3 = this.page.locator("header h3").first();
      if (await headerH3.isVisible().catch(() => false)) {
        await expect(headerH3).toHaveText(pageTitle);
        return;
      }

      const cardTitle = this.page
        .locator('[data-testid="CardHeader"] [data-testid="cardTitle"]')
        .first();
      if (await cardTitle.isVisible().catch(() => false)) {
        await expect(cardTitle).toHaveText(pageTitle);
        return;
      }

      const h3 = this.page.locator("h3").first();
      if (await h3.isVisible().catch(() => false)) {
        await expect(h3).toHaveText(pageTitle);
        return;
      }

      const headerTitle = this.page.locator("header h1, header h2").first();
      if (await headerTitle.isVisible().catch(() => false)) {
        await expect(headerTitle).toHaveText(pageTitle);
        return;
      }

      await expect(
        this.page.getByText(pageTitle, { exact: true }),
      ).toBeVisible();
      return;
    }

    if (pageName === "Comptes bancaires") {
      await expect(this.page.locator("header h1")).toHaveText(pageTitle);
      return;
    }

    await expect(
      this.page
        .locator('[data-testid="CardHeader"] [data-testid="cardTitle"]')
        .first(),
    ).toHaveText(pageTitle);
  }

  async assertUnitPageTitle(
    pageName: string,
    pageTitle: string,
  ): Promise<void> {
    if (pageName === "Informations" || pageName === "Contacts internes") {
      await expect(
        this.page
          .locator('[data-testid="CardHeader"] [data-testid="cardTitle"]')
          .first(),
      ).toContainText(pageTitle);
      return;
    }

    await expect(this.page.getByTestId("cardTitle").first()).toContainText(
      pageTitle,
    );
  }

  /* -------------------- Tables -------------------- */

  async assertTableColumnNames(columns: string[]): Promise<void> {
    for (const column of columns) {
      const escaped = column
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/['\u2018\u2019]/g, "['\u2019\u2018]");
      await expect(
        this.page.getByText(new RegExp(escaped)).first(),
      ).toBeVisible({ timeout: TEST_CONFIG.timeouts.long });
    }
  }

  async assertLegoTableColumnNames(columns: string[]): Promise<void> {
    for (const column of columns) {
      await expect(
        this.page
          .locator(".rt-table > .rt-thead > .rt-tr")
          .filter({ hasText: column })
          .first(),
      ).toBeVisible({ timeout: TEST_CONFIG.timeouts.long });
    }
  }

  async assertTableNotEmpty(): Promise<void> {
    const shadcnTable = this.page.locator('[data-shadcn="table"]');
    if (
      await shadcnTable
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await expect(shadcnTable.locator("tbody tr").first()).toBeVisible({
        timeout: TEST_CONFIG.timeouts.medium,
      });
      return;
    }

    await expect(this.page.locator("table tbody tr").first()).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
  }

  async assertLegoTableNotEmpty(): Promise<void> {
    await expect(
      this.page.locator(".rt-table .rt-tbody .rt-tr").first(),
    ).toBeVisible({ timeout: TEST_CONFIG.timeouts.medium });
  }

  async assertPageNotContainsText(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toHaveCount(0);
  }

  /* -------------------- Allocation keys / units -------------------- */

  async goToUnitView(): Promise<void> {
    await this.page.getByTestId("toggleCoownerUnitView").click();
  }

  async openFirstUnitSheet(): Promise<void> {
    const unitSheet = this.page.waitForResponse(
      (response) =>
        response.url().includes("/units/") && response.status() === 200,
    );
    const unitManager = this.page.waitForResponse(
      (response) =>
        response.url().includes("/units/") &&
        response.url().includes("/manager") &&
        response.status() === 200,
    );
    const unitMsEstate = this.page.waitForResponse(
      (response) =>
        response.url().includes("/units/") &&
        response.url().includes("/ms-estate") &&
        response.status() === 200,
    );
    const unitBuilding = this.page.waitForResponse(
      (response) =>
        response.url().includes("/buildings/") && response.status() === 200,
    );

    await this.page
      .locator("table tbody tr")
      .first()
      .getByText("Fiche Lot")
      .click();

    await Promise.all([unitSheet, unitManager, unitMsEstate, unitBuilding]);
  }
}

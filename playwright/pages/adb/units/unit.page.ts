import { expect, type Locator, type Page } from "@playwright/test";

import { TEST_CONFIG } from "@helpers/common/test-config";
import { assertColumnsVisible } from "@helpers/ui";

/** Unit sub-pages whose title lives inside CardHeader. */
const CARD_HEADER_TITLE_PAGES = new Set([
  "Informations",
  "Contacts internes",
  "Compteurs",
]);

export class UnitPage {
  constructor(public readonly page: Page) {}

  // =====================
  // LOCATORS — sidebar
  // =====================

  private get sidebar(): Locator {
    return this.page.getByTestId("LayoutSidenavLeft");
  }

  private get sidebarTitle(): Locator {
    return this.sidebar.getByTestId("sidenav-header-title");
  }

  private get sidebarSubtitle(): Locator {
    return this.sidebar.getByTestId("sidenav-header-subtitle");
  }

  private get sidebarAddress(): Locator {
    return this.sidebar.getByTestId("sidenav-header-data-0");
  }

  private sidebarLink(label: string): Locator {
    return this.sidebar.getByRole("link", { name: label }).first();
  }

  // =====================
  // LOCATORS — content
  // =====================

  private get cardHeaderTitle(): Locator {
    return this.page.getByTestId("CardHeader").getByTestId("cardTitle").first();
  }

  private get pageTitle(): Locator {
    return this.page.getByTestId("cardTitle").first();
  }

  // =====================
  // NAVIGATION
  // =====================

  async gotoUnit(unitPath: string): Promise<void> {
    const origin = new URL(this.page.url()).origin;
    await this.page.goto(`${origin}/${unitPath}`, {
      waitUntil: "domcontentloaded",
    });
    await this.assertSidebarVisible();
  }

  async accessUnitSection(menuItem: string): Promise<void> {
    await this.assertSidebarVisible();
    const link = this.sidebarLink(menuItem);
    await expect(link).toBeVisible({ timeout: TEST_CONFIG.timeouts.long });
    await link.click();
  }

  // =====================
  // ASSERTIONS
  // =====================

  async assertSidebarVisible(): Promise<void> {
    await expect(this.sidebar).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(this.sidebarTitle).toBeVisible();
    await expect(this.sidebarSubtitle).toBeVisible();
    await expect(this.sidebarAddress).toBeVisible();
  }

  async assertPageTitle(pageName: string, pageTitle: string): Promise<void> {
    const titleLocator = CARD_HEADER_TITLE_PAGES.has(pageName)
      ? this.cardHeaderTitle
      : this.pageTitle;

    await expect(titleLocator).toContainText(pageTitle);
  }

  async assertTableColumnNames(columns: string[]): Promise<void> {
    await assertColumnsVisible(this.page, columns);
  }
}

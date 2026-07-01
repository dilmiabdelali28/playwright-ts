import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Co-owner customer detail page ("fiche client"): left-sidebar navigation across
 * the profile and dashboard sub-pages, plus generic content assertions.
 */
export class CoOwnerCustomerPage {
  constructor(private readonly page: Page) {}

  // =====================
  // LOCATORS
  // =====================

  private get sidebar(): Locator {
    return this.page.getByTestId("LayoutSidenavLeft");
  }

  private sidebarLink(label: string): Locator {
    return this.sidebar.getByRole("link", { name: label }).first();
  }

  /** Central content panel — used to scope assertions away from the sidebar. */
  private get content(): Locator {
    return this.page.getByTestId("LayoutSidenavCenter").first();
  }

  private get rows(): Locator {
    return this.content.locator(
      'table tbody tr, [data-shadcn="table"] tbody tr, .rt-tbody .rt-tr-group',
    );
  }

  // =====================
  // NAVIGATION
  // =====================

  async goto(path: string): Promise<void> {
    const origin = new URL(this.page.url()).origin;
    await this.page.goto(`${origin}${path}`, { waitUntil: "domcontentloaded" });
    await this.page
      .getByTestId("app-header")
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await expect(this.sidebar).toBeVisible({ timeout: 30000 });
  }

  /** Open a co-owner profile sub-page (e.g. "Comptes") from the sidebar. */
  async openProfilePage(label: string): Promise<void> {
    await this.openSubPage("Profil Copropriétaire", label);
  }

  /** Open a dashboard sub-page (e.g. "Contacts") from the sidebar. */
  async openDashboardPage(label: string): Promise<void> {
    await this.openSubPage("Tableau de bord", label);
  }

  /** Expand `parentMenu` if its `label` link is not already shown, then open it. */
  private async openSubPage(parentMenu: string, label: string): Promise<void> {
    const sidebar = this.page.getByTestId("LayoutSidenavLeft");

    const link = sidebar.getByRole("link", { name: label }).first();

    const isVisible = await link.isVisible().catch(() => false);

    if (!isVisible) {
      await sidebar.getByRole("link", { name: parentMenu }).first().click();
    }

    await link.click();

    await expect(this.content).toBeVisible({ timeout: 30000 });
  }

  /** Click the "Destinataires" address accordion to expand its content. */
  async clickAddressCard(): Promise<void> {
    await this.page.getByTestId("accordionWrapper").first().click();
  }

  /** On the Documents page, switch to the second co-owner account. */
  async selectSecondAccount(): Promise<void> {
    await this.page
      .locator('div[aria-labelledby="-select-label"]')
      .first()
      .click();
    await this.page.locator('ul[role="listbox"] > li').nth(1).click();
  }

  /** On the Documents page, open a document category card (e.g. "provisionCalls"). */
  async openDocumentCategory(category: string): Promise<void> {
    await this.page.getByTestId(`documentCategory-${category}`).click();
  }

  // =====================
  // ASSERTIONS
  // =====================

  /** Each column title is visible in the central content (table header). */
  async assertColumns(columns: string[]): Promise<void> {
    for (const column of columns) {
      await expect(this.content.getByText(column).first()).toBeVisible();
    }
  }

  async assertTableNotEmpty(): Promise<void> {
    await expect(this.rows.first()).toBeVisible({ timeout: 15000 });
  }

  /** Each element addressed by its `data-testid` is visible. */
  async assertElementsVisible(testIds: string[]): Promise<void> {
    for (const testId of testIds) {
      await expect(this.page.getByTestId(testId).first()).toBeVisible();
    }
  }
}

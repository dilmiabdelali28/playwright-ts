import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

type AppDomain = "GL" | "COPRO";

export class AdbNavBar {
  constructor(private readonly page: Page) {}

  // =====================
  // LOCATORS
  // =====================

  get header(): Locator {
    return this.page.getByTestId("app-header");
  }

  get userAvatar(): Locator {
    return this.page.getByTestId("avatar");
  }

  get nav(): Locator {
    return this.header.locator("nav");
  }

  menuItem(name: string): Locator {
    return this.nav
      .getByRole("link", { name })
      .or(this.nav.getByRole("button", { name }));
  }

  toolItem(name: string): Locator {
    return this.page
      .getByTestId("navigation-menu-content")
      .getByRole("link", { name })
      .or(
        this.page
          .getByTestId("navigation-menu-content")
          .getByRole("button", { name }),
      );
  }

  // =====================
  // ACTIONS
  // =====================

  async clickMenu(name: string): Promise<void> {
    await expect(this.header).toBeVisible();
    const directItem = this.menuItem(name).first();

    if (await directItem.isVisible({ timeout: 2000 })) {
      await directItem.click();
      return;
    }

    const moreButton = this.menuItem("Plus").first();
    if (await moreButton.isVisible({ timeout: 2000 })) {
      await moreButton.click();
      const overflowItem = this.toolItem(name).first();
      if (await overflowItem.isVisible({ timeout: 3000 })) {
        await overflowItem.click();
        return;
      }
    }

    throw new Error(
      `Menu item "${name}" not found in header or overflow menu.`,
    );
  }

  async hasMenuItem(name: string): Promise<boolean> {
    const directItem = this.menuItem(name).first();
    if (await directItem.isVisible({ timeout: 1000 })) {
      return true;
    }

    const moreButton = this.menuItem("Plus").first();
    if (!(await moreButton.isVisible({ timeout: 1000 }))) {
      return false;
    }

    await moreButton.click();
    return this.toolItem(name).first().isVisible({ timeout: 1500 });
  }

  async openToolsMenu() {
    await this.menuItem("Outils").click();
  }

  async clickTool(name: string) {
    await this.toolItem(name).click();
  }

  // =====================
  // ASSERTIONS
  // =====================

  async expectVisibleBaseNav() {
    await expect(this.header).toBeVisible();
    await expect(this.userAvatar).toBeVisible();
  }

  async expectMainMenus(appDomain: AppDomain) {
    const base = ["Missions", "Tickets", "Fournisseurs", "Outils"];

    const glOnly = ["Clients", "Biens", "Facturation"];
    const coproOnly = ["Immeubles", "Copropriétaires", "Facturation"];

    for (const item of base) {
      await expect(this.menuItem(item)).toBeVisible();
    }

    if (appDomain === "GL") {
      for (const item of glOnly) {
        await expect(this.menuItem(item)).toBeVisible();
      }
    }

    if (appDomain === "COPRO") {
      for (const item of coproOnly) {
        await expect(this.menuItem(item)).toBeVisible();
      }
    }
  }
}

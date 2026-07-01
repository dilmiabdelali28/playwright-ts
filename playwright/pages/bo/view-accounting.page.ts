import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class BoHomePage {
  constructor(public page: Page) {}

  // 🔹 Vérifier les entrées d’une catégorie (liens ou boutons modaux)
  async checkCategory(
    category: string,
    pages: {
      label: string;
      href?: string;
      role?: "link" | "button";
    }[],
  ) {
    const card = this.getCategoryCard(category);

    // ✅ attendre card visible
    await expect(card).toBeVisible();

    // ✅ attendre que les entrées soient chargées
    await expect(
      card.getByRole("link").or(card.getByRole("button")).first(),
    ).toBeVisible();

    for (const { label, href, role = "link" } of pages) {
      const entry = card.getByRole(role, { name: label });
      await expect(entry).toBeVisible({ timeout: 10000 });

      if (role === "link" && href) {
        await expect(entry).toHaveAttribute("href", href);
      }
    }
  }

  // 🔹 Getter du card par catégorie (match EXACT)
  private getCategoryCard(category: string): Locator {
    return this.page
      .getByTestId("Card")
      .filter({
        has: this.page.getByTestId("cardTitle").filter({
          hasText: new RegExp(`^${category}$`),
        }),
      })
      .first();
  }

  // 🔹 Ouvrir un onglet
  async openTab(tabName: string) {
    await this.page.getByRole("tab", { name: tabName }).click();
  }
}

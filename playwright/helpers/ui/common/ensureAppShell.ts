import type { Page } from "@playwright/test";

export async function ensureAppShell(page: Page, url: string): Promise<void> {
  const header = page.locator('[data-testid="app-header"]').first();
  try {
    await header.waitFor({ state: "visible", timeout: 15000 });
  } catch {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await header.waitFor({ state: "visible", timeout: 15000 });
  }
}

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function waitEmeriaTableLoaded(
  page: Page,
  timeout = 30000,
): Promise<void> {
  const table = page.locator('[data-shadcn="table"]').first();
  await expect(table).toBeVisible({ timeout });
  await expect(
    table.locator(
      "xpath=ancestor::div[1]//div[contains(@class,'animate-pulse')]",
    ),
  ).toHaveCount(0, { timeout });
}

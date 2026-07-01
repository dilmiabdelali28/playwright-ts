import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function assertColumnsVisible(
  page: Page,
  columns: string[],
): Promise<void> {
  for (const column of columns) {
    await expect(
      page.locator("thead tr th:visible", { hasText: column }).first(),
    ).toBeVisible();
  }
}

export async function assertFiltersVisible(
  page: Page,
  dataTestIds: string[],
): Promise<void> {
  for (const id of dataTestIds) {
    await expect(page.locator(`[data-testid="${id}"]`).first()).toBeVisible();
  }
}

export async function assertTableNotEmpty(page: Page): Promise<void> {
  const rows = await page.locator("table tbody tr").count();
  expect(rows).toBeGreaterThan(0);
}

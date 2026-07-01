import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

const EMERIA_TABLE_DEBOUNCE_MS = 600;

export async function emeriaTableFilter(
  page: Page,
  filterName: string,
  value: string,
): Promise<void> {
  const filter = page.getByTestId(filterName).first();
  await expect(filter).toBeVisible();
  await filter.clear();
  await filter.fill(value);
  await page.waitForTimeout(EMERIA_TABLE_DEBOUNCE_MS);
}

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function textFromFirstCellByPrefix(
  page: Page,
  dataTestIdPrefix: string,
): Promise<string> {
  const cell = page.locator(`[data-testid^="${dataTestIdPrefix}"]`).first();
  await expect(cell).toBeVisible();
  return (await cell.innerText()).trim();
}

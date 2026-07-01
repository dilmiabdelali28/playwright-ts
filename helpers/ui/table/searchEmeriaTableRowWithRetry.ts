import type { Page } from "@playwright/test";

import { emeriaTableFilter } from "./emeriaTableFilter";
import { waitEmeriaTableLoaded } from "./waitEmeriaTableLoaded";

export async function searchEmeriaTableRowWithRetry(
  page: Page,
  options: {
    filterTestId: string;
    searchValue: string;
    timeoutMs?: number;
  },
): Promise<void> {
  const { filterTestId, searchValue, timeoutMs = 90_000 } = options;

  await waitEmeriaTableLoaded(page);

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await emeriaTableFilter(page, filterTestId, searchValue);

    const matchingRow = page
      .locator('[data-shadcn="table"] tbody tr')
      .filter({ hasText: searchValue });

    if ((await matchingRow.count()) > 0) {
      await matchingRow.first().click();
      return;
    }

    await page.waitForTimeout(1000);
  }

  throw new Error(
    `Table row not found for filter "${filterTestId}" and value "${searchValue}"`,
  );
}

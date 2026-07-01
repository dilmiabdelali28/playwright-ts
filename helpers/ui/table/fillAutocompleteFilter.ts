import { selectDropdownList } from "@helpers/ui";
import type { Page } from "@playwright/test";

import { waitEmeriaTableLoaded } from "./waitEmeriaTableLoaded";

export async function fillAutocompleteFilter(
  page: Page,
  testId: string,
  value: string,
): Promise<void> {
  await selectDropdownList({
    page,
    dataTestId: testId,
    by: { optionValue: value },
  });
  await waitEmeriaTableLoaded(page);
}

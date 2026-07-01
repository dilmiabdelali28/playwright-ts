import type { Locator, Page } from "@playwright/test";

type SelectDropdownListParams = {
  page: Page;
  dataTestId?: string;
  selector?: string;
  by: {
    searchText?: string;
    dataValue?: string | number;
    optionValue?: string | number | RegExp;
    optionIndex?: number;
  };
  selectIndex?: number;
  clearInput?: boolean;
  findOptionWithSearchText?: boolean;
  apiCallsToWaitToGetOptions?: string[];
};

const OPTION_SELECTOR =
  '.MuiAutocomplete-option, .reactSelect__option, [role="listbox"] [role="option"], [role="option"]';

const TICKET_BUILDING_OPTION_INDEX = 3;

export async function dismissOpenOverlays(page: Page): Promise<void> {
  await page.keyboard.press("Escape").catch(() => undefined);
}

async function isShadcnCombobox(dropdown: Locator): Promise<boolean> {
  return (await dropdown.getAttribute("data-shadcn")) === "combobox";
}

function comboboxSearchInput(page: Page, dataTestId?: string): Locator {
  if (dataTestId) {
    return page.getByTestId(`${dataTestId}--input`);
  }

  return page.locator('[data-shadcn="combobox-content"] input');
}

async function waitForLoadingToFinish(page: Page): Promise<void> {
  for (const label of ["Loading...", "Chargement..."]) {
    const loading = page.getByText(label, { exact: true });
    if (await loading.isVisible().catch(() => false)) {
      await loading.waitFor({ state: "detached" });
    }
  }
}

async function waitForApiCalls(
  page: Page,
  apiCallsToWaitToGetOptions?: string[],
): Promise<void> {
  if (apiCallsToWaitToGetOptions?.length) {
    for (const apiCall of apiCallsToWaitToGetOptions) {
      await page.waitForResponse(
        (response) =>
          response.url().includes(apiCall) && response.status() === 200,
      );
    }
    return;
  }

  await page.waitForTimeout(1000);
}

async function closeShadcnComboboxIfNeeded(
  page: Page,
  isShadcnComboboxTrigger: boolean,
): Promise<void> {
  if (isShadcnComboboxTrigger) {
    await dismissOpenOverlays(page);
  }
}

async function clickVisibleOption(
  page: Page,
  optionIndex: number,
  searchText?: string,
  findOptionWithSearchText = false,
): Promise<void> {
  const options = findOptionWithSearchText
    ? page.locator(OPTION_SELECTOR, { hasText: searchText! })
    : page.locator(OPTION_SELECTOR);

  const option = options.nth(optionIndex);
  await option.waitFor({ state: "visible", timeout: 15000 });
  await option.click();
}

export async function multipleSelectFilter(
  page: Page,
  dataTestId: string,
  filterValue?: string,
): Promise<void> {
  await dismissOpenOverlays(page);

  const dropdown = page.getByTestId(dataTestId);
  await dropdown.click();
  await page.locator('[role="listbox"]').waitFor({ state: "visible" });

  const selectedOptions = page.locator('[role="option"][aria-selected="true"]');
  while ((await selectedOptions.count()) > 0) {
    await selectedOptions.first().click();
  }

  if (filterValue) {
    await page
      .locator('[role="option"]')
      .filter({ hasText: filterValue })
      .click();
  }

  await dismissOpenOverlays(page);
}

export async function ticketBuildingAutocompleteSelect(
  page: Page,
  dataTestId: string,
  searchText: string,
): Promise<void> {
  await dismissOpenOverlays(page);

  const dropdown = page.getByTestId(dataTestId);
  const input = dropdown.locator("input").first();

  await input.click();
  await input.fill(searchText);

  const openButton = dropdown.getByRole("button", { name: "Open" });
  if (await openButton.isVisible().catch(() => false)) {
    await openButton.click();
  }

  await waitForApiCalls(page);
  await waitForLoadingToFinish(page);
  await page
    .locator('[role="listbox"]')
    .waitFor({ state: "visible", timeout: 15000 });

  const matchingOptions = page
    .locator(OPTION_SELECTOR)
    .filter({ hasText: searchText });

  if ((await matchingOptions.count()) > 0) {
    await matchingOptions.first().click();
    await dismissOpenOverlays(page);
    return;
  }

  await clickVisibleOption(page, TICKET_BUILDING_OPTION_INDEX);
  await dismissOpenOverlays(page);
}

async function fillMuiAutocompleteSearchText(
  page: Page,
  dropdown: Locator,
  searchText: string,
  clearInput: boolean,
): Promise<void> {
  const input = dropdown.locator("input").first();

  if (clearInput) {
    await input.click();
    await page.waitForTimeout(500);
    await waitForLoadingToFinish(page);
    await input.clear();
  }

  await input.fill(searchText);
}

export async function selectDropdownList({
  page,
  dataTestId,
  selector,
  by,
  selectIndex = 0,
  clearInput = false,
  findOptionWithSearchText = false,
  apiCallsToWaitToGetOptions,
}: SelectDropdownListParams): Promise<void> {
  const dropdown = dataTestId
    ? page.locator(`[data-testid='${dataTestId}']`).nth(selectIndex)
    : page.locator(selector!).nth(selectIndex);

  if (by.searchText) {
    const triggerIsShadcnCombobox = await isShadcnCombobox(dropdown);

    if (triggerIsShadcnCombobox) {
      await dropdown.click();
      const input = comboboxSearchInput(page, dataTestId);

      if (clearInput) {
        await input.fill("");
      }

      await input.fill(by.searchText);
    } else {
      await fillMuiAutocompleteSearchText(
        page,
        dropdown,
        by.searchText,
        clearInput,
      );
    }

    await waitForApiCalls(page, apiCallsToWaitToGetOptions);
    await waitForLoadingToFinish(page);

    const optionIndex = by.optionIndex ?? 0;

    if (findOptionWithSearchText) {
      await clickVisibleOption(page, optionIndex, by.searchText, true);
    } else {
      await clickVisibleOption(page, optionIndex);
    }

    await closeShadcnComboboxIfNeeded(page, triggerIsShadcnCombobox);
    return;
  }

  await dropdown.click();
  await waitForApiCalls(page, apiCallsToWaitToGetOptions);
  await waitForLoadingToFinish(page);

  const triggerIsShadcnCombobox = await isShadcnCombobox(dropdown);

  if (by.optionValue !== undefined) {
    if (triggerIsShadcnCombobox && dataTestId) {
      await comboboxSearchInput(page, dataTestId).fill(String(by.optionValue));
    }

    await page
      .locator(OPTION_SELECTOR, { hasText: String(by.optionValue) })
      .click({ force: triggerIsShadcnCombobox });
    await closeShadcnComboboxIfNeeded(page, triggerIsShadcnCombobox);
    return;
  }

  if (by.dataValue !== undefined) {
    await page.locator(`[data-value="${by.dataValue}"]`).click();
    return;
  }

  if (by.optionIndex !== undefined) {
    await clickVisibleOption(page, by.optionIndex);
  }
}

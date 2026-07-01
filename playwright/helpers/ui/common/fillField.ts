import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type FillFieldParams = {
  page: Page;
  value: string;
  testId?: string;
  selector?: string;
  name?: string;
  label?: string | RegExp;
  placeholder?: string | RegExp;
  clear?: boolean;
  assertVisible?: boolean;
  inputSelector?: string;
  inputIndex?: number;
  useNestedInput?: boolean;
};

type LocateInputOptions = Pick<
  FillFieldParams,
  "inputSelector" | "inputIndex" | "useNestedInput"
>;

type FieldTarget = Pick<
  FillFieldParams,
  "testId" | "selector" | "name" | "label" | "placeholder"
>;

export function locateField(page: Page, target: FieldTarget): Locator {
  if (target.testId) {
    return page.getByTestId(target.testId);
  }

  if (target.selector) {
    return page.locator(target.selector).first();
  }

  if (target.name) {
    return page.locator(`[name="${target.name}"]`).first();
  }

  if (target.label) {
    return page.getByLabel(target.label).first();
  }

  if (target.placeholder) {
    return page.getByPlaceholder(target.placeholder).first();
  }

  throw new Error(
    "fillField requires one targeting option: testId, selector, name, label, or placeholder.",
  );
}

export async function locateInput(
  field: Locator,
  {
    inputSelector = "input",
    inputIndex = 0,
    useNestedInput = true,
  }: LocateInputOptions = {},
): Promise<Locator> {
  if (!useNestedInput) {
    return field;
  }

  const inputs = field.locator(inputSelector);

  if ((await inputs.count()) === 0) {
    return field;
  }

  return inputs.nth(inputIndex);
}

export async function fillField({
  page,
  value,
  testId,
  selector,
  name,
  label,
  placeholder,
  clear = false,
  assertVisible = false,
  inputSelector,
  inputIndex,
  useNestedInput,
}: FillFieldParams): Promise<void> {
  const field = locateField(page, {
    testId,
    selector,
    name,
    label,
    placeholder,
  });
  const target = await locateInput(field, {
    inputSelector,
    inputIndex,
    useNestedInput,
  });

  if (assertVisible) {
    await expect(target).toBeVisible();
  }

  if (clear) {
    await target.clear();
  }

  await target.fill(value);
}

import type { FillFieldParams } from "./fillField";
import { locateField, locateInput } from "./fillField";

type FillDateFieldParams = Pick<
  FillFieldParams,
  | "page"
  | "value"
  | "testId"
  | "selector"
  | "name"
  | "label"
  | "placeholder"
  | "inputSelector"
  | "inputIndex"
  | "useNestedInput"
>;

export async function fillDateField({
  page,
  value,
  testId,
  selector,
  name,
  label,
  placeholder,
  inputSelector,
  inputIndex,
  useNestedInput,
}: FillDateFieldParams): Promise<void> {
  const target = await locateInput(
    locateField(page, { testId, selector, name, label, placeholder }),
    { inputSelector, inputIndex, useNestedInput },
  );
  const normalizedValue = value.replace(/-/g, "/");

  await target.click();
  await target.clear();
  await target.pressSequentially(normalizedValue, { delay: 30 });
  await target.blur();
  await target.press("Escape");
}

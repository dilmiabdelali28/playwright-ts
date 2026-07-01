import { expect, type Page } from "@playwright/test";

type UnitSectionName = "Compteurs" | "Diagnostics";

export async function assertUnitSectionElements(
  page: Page,
  section: UnitSectionName,
): Promise<void> {
  switch (section) {
    case "Compteurs":
      await expect(page.getByTestId("createMeterBt")).toContainText(
        "Ajouter un compteur",
      );
      await expect(page.getByTestId("pagination")).toBeVisible();
      break;
    case "Diagnostics":
      await expect(page.getByTestId("estateAddress")).toBeVisible();
      await expect(page.getByTestId("addDiagnosticButton")).toBeVisible();
      break;
    default:
      throw new Error(`Unknown unit section: ${section}`);
  }
}

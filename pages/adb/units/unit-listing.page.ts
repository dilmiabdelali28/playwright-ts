import {
  assertColumnsVisible,
  assertFiltersVisible,
  ensureAppShell,
  fillField,
  selectDropdownList,
  waitEmeriaTableLoaded,
} from "@helpers/ui";
import type { Locator, Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";

const DASHBOARD_PATH = "/portfolio/unit";
const DASHBOARD_TITLE = "Lots";

const UNIT_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  OUTSIDE_PARKING: "Stationnement extérieur",
  INSIDE_PARKING: "Stationnement intérieur",
};

interface UnitListingItem {
  _id: string;
  coOwnershipBylawsId?: string;
  unitLegacyNumber?: string;
  unitNumber?: string;
  entrance?: { address?: { address1?: string } };
  description?: { entityType?: string };
}

interface UnitListingResponse {
  items?: UnitListingItem[];
}

function isUnitsListingUrl(url: string): boolean {
  return /\/associates\/.+\/units\?/.test(url);
}

export type UnitFilterKey =
  | "UNIT_COOWNERSHIP_BY_LAWS_ID"
  | "UNIT_ADDRESS"
  | "UNIT_TYPE";

interface UnitFilter {
  label: string;
  testId: string;
  kind: "input" | "select";
  fillValue: (item: UnitListingItem) => string;
  verifyValue?: (item: UnitListingItem) => string;
}

export const UNIT_FILTERS: Record<UnitFilterKey, UnitFilter> = {
  UNIT_COOWNERSHIP_BY_LAWS_ID: {
    label: "N˚ lot",
    testId: "coOwnershipBylawsId",
    kind: "input",
    fillValue: (item) =>
      item.coOwnershipBylawsId ?? item.unitLegacyNumber ?? "",
    verifyValue: (item) =>
      item.coOwnershipBylawsId ?? item.unitLegacyNumber ?? "",
  },
  UNIT_ADDRESS: {
    label: "Adresse",
    testId: "address",
    kind: "input",
    fillValue: (item) =>
      item.unitNumber ?? item.entrance?.address?.address1 ?? "",
    verifyValue: (item) =>
      item.unitNumber ?? item.entrance?.address?.address1 ?? "",
  },
  UNIT_TYPE: {
    label: "Type",
    testId: "type",
    kind: "select",
    fillValue: (item) =>
      item.description?.entityType
        ? (UNIT_TYPE_LABELS[item.description.entityType] ?? "")
        : "",
    verifyValue: (item) =>
      item.description?.entityType
        ? (UNIT_TYPE_LABELS[item.description.entityType] ?? "")
        : "",
  },
};

/**
 * Resolves a unit id from the live portfolio listing — avoids hardcoded ids that
 * break after env refresh / data sanitize.
 */
export async function resolveFirstUnitId(page: Page): Promise<string> {
  const listing = new UnitListingPage(page);
  await listing.goto();
  await listing.waitForUnits();

  const unitId = listing.firstItem._id;
  if (!unitId) {
    throw new Error("Unable to resolve unit id from portfolio listing");
  }

  return unitId;
}

export class UnitListingPage {
  private capturedItem: UnitListingItem | null = null;
  private listingCaptured: Promise<void> | null = null;

  constructor(private readonly page: Page) {}

  private get table(): Locator {
    return this.page.locator('[data-shadcn="table"]').first();
  }

  private get rows(): Locator {
    return this.table.locator("tbody tr");
  }

  async goto(path: string = DASHBOARD_PATH): Promise<void> {
    this.capturedItem = null;
    this.listingCaptured = new Promise<void>((resolve) => {
      const onResponse = (res: Response): void => {
        if (!isUnitsListingUrl(res.url())) {
          return;
        }
        void res
          .json()
          .then((body: UnitListingResponse) => {
            if (body.items?.length) {
              this.capturedItem = body.items[0] ?? null;
              this.page.off("response", onResponse);
              resolve();
            }
          })
          .catch(() => undefined);
      };
      this.page.on("response", onResponse);
    });

    const url = `${new URL(this.page.url()).origin}${path}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    await ensureAppShell(this.page, url);
  }

  async waitForUnits(): Promise<void> {
    if (!this.listingCaptured) {
      throw new Error("Call goto() before waitForUnits().");
    }

    await this.listingCaptured;
    await waitEmeriaTableLoaded(this.page);
  }

  get firstItem(): UnitListingItem {
    if (!this.capturedItem) {
      throw new Error(
        "No unit listing data captured. Call goto() before using firstItem.",
      );
    }
    return this.capturedItem;
  }

  async fillFilter(filter: UnitFilter, value: string): Promise<void> {
    if (!value) {
      return;
    }

    if (filter.kind === "select") {
      const refreshed = this.page
        .waitForResponse((res) => isUnitsListingUrl(res.url()), {
          timeout: 15000,
        })
        .catch(() => null);
      await selectDropdownList({
        page: this.page,
        dataTestId: filter.testId,
        by: { optionValue: value },
      });
      await refreshed;
      await waitEmeriaTableLoaded(this.page);
      return;
    }

    await this.applyFilterValue(filter.testId, value);
  }

  async clearFilter(filter: UnitFilter): Promise<void> {
    if (filter.kind === "select") {
      const refreshed = this.page
        .waitForResponse((res) => isUnitsListingUrl(res.url()), {
          timeout: 15000,
        })
        .catch(() => null);
      await selectDropdownList({
        page: this.page,
        dataTestId: filter.testId,
        by: { optionValue: "Tous" },
      });
      await refreshed;
      await waitEmeriaTableLoaded(this.page);
      return;
    }

    await this.applyFilterValue(filter.testId, "");
  }

  private async applyFilterValue(testId: string, value: string): Promise<void> {
    const refreshed = this.page
      .waitForResponse((res) => isUnitsListingUrl(res.url()), {
        timeout: 15000,
      })
      .catch(() => null);
    await fillField({
      page: this.page,
      testId,
      value,
      assertVisible: value.length > 0,
    });
    await refreshed;
    await waitEmeriaTableLoaded(this.page);
  }

  private cardTitleLocator() {
    return this.page
      .locator('[data-testid="CardHeader"] [data-testid="cardTitle"]')
      .first();
  }

  private async assertCardTitle(title: string): Promise<void> {
    await expect(this.cardTitleLocator()).toHaveText(title);
  }

  async assertTitle(): Promise<void> {
    await this.assertCardTitle(DASHBOARD_TITLE);
  }

  async assertColumns(columns: string[]): Promise<void> {
    await assertColumnsVisible(this.page, columns);
  }

  async assertFilters(): Promise<void> {
    await assertFiltersVisible(this.page, [
      UNIT_FILTERS.UNIT_COOWNERSHIP_BY_LAWS_ID.testId,
      UNIT_FILTERS.UNIT_ADDRESS.testId,
      "unit",
      "mainUnit",
      UNIT_FILTERS.UNIT_TYPE.testId,
    ]);
  }

  async assertTableNotEmpty(): Promise<void> {
    await waitEmeriaTableLoaded(this.page);
    expect(await this.rows.count()).toBeGreaterThan(0);
  }

  async assertRowContains(text: string): Promise<void> {
    if (!text) {
      return;
    }
    const normalized = text.replace("  ", " ").trim();
    await expect(this.rows.filter({ hasText: normalized })).not.toHaveCount(0);
  }
}

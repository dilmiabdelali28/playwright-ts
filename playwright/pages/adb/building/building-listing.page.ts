import {
  assertColumnsVisible,
  assertFiltersVisible,
  ensureAppShell,
  fillAutocompleteFilter,
  fillField,
  waitEmeriaTableLoaded,
} from "@helpers/ui";
import type { Locator, Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";

const DASHBOARD_PATH = "/portfolio/building";
const DASHBOARD_TITLE = "Immeubles";

interface BuildingAssociate {
  firstName: string;
  lastName: string;
}

interface BuildingMandateAssociateEntry {
  isMain: boolean;
  associate: BuildingAssociate;
}

interface BuildingCoOwnershipMandate {
  associates: BuildingMandateAssociateEntry[];
}

interface BuildingAddress {
  address1: string;
}

interface BuildingItem {
  buildingNumber: string;
  address: BuildingAddress;
  coOwnershipMandates: BuildingCoOwnershipMandate[];
}

interface BuildingListingResponse {
  data?: {
    buildingMandates?: {
      edges: Array<{ node: { building: BuildingItem } }>;
    };
  };
}

interface BuildingFilter {
  label: string;
  testId: string;
  type: "input" | "autocomplete";
  fillValue: (item: BuildingItem) => string;
  verifyValue?: (item: BuildingItem) => string;
}

export type BuildingFilterKey =
  | "BUILDING_NUMBER"
  | "BUILDING_ADDRESS"
  | "BUILDING_ASSOCIATE";

/** Same extraction as cypress/support/services/responseApi/buildingResponse.ts */
function mainAssociateName(item: BuildingItem): string {
  const associate = item.coOwnershipMandates?.[0]?.associates?.[0]?.associate;
  if (!associate?.firstName || !associate?.lastName) {
    return "";
  }
  return `${associate.firstName} ${associate.lastName}`;
}

export const BUILDING_FILTERS: Record<BuildingFilterKey, BuildingFilter> = {
  BUILDING_NUMBER: {
    label: "Identifiant",
    testId: "number",
    type: "input",
    fillValue: (item) => item.buildingNumber ?? "",
    verifyValue: (item) => item.buildingNumber ?? "",
  },
  BUILDING_ADDRESS: {
    label: "Adresse",
    testId: "address",
    type: "input",
    fillValue: (item) => item.address?.address1 ?? "",
    verifyValue: (item) => item.address?.address1 ?? "",
  },
  BUILDING_ASSOCIATE: {
    label: "Gestionnaire",
    testId: "associate-combobox",
    type: "autocomplete",
    fillValue: mainAssociateName,
    verifyValue: mainAssociateName,
  },
};

export class BuildingListingPage {
  private capturedItem: BuildingItem | null = null;
  private listingCaptured: Promise<void> | null = null;

  constructor(private readonly page: Page) {}

  // =====================
  // LOCATORS
  // =====================

  private get table(): Locator {
    return this.page.locator('[data-shadcn="table"]').first();
  }

  private get rows(): Locator {
    return this.table.locator("tbody tr");
  }

  // =====================
  // NAVIGATION
  // =====================

  async goto(path: string = DASHBOARD_PATH): Promise<void> {
    this.capturedItem = null;
    this.listingCaptured = new Promise<void>((resolve) => {
      const onResponse = (res: Response): void => {
        const postData = res.request().postData() ?? "";
        if (
          !res.url().includes("/graphql") ||
          !postData.includes("GetBuildingMandates")
        ) {
          return;
        }
        void res
          .json()
          .then((body: BuildingListingResponse) => {
            const edges = body?.data?.buildingMandates?.edges;
            if (!edges?.length) {
              return;
            }
            const selectedIndex = edges.findIndex((edge) => {
              const entry =
                edge.node.building?.coOwnershipMandates?.[0]?.associates?.[0];
              return (
                entry?.isMain === true &&
                entry.associate.firstName !== null &&
                entry.associate.lastName !== null
              );
            });
            const index = selectedIndex >= 0 ? selectedIndex : 0;
            const edge = edges[index];
            if (edge) {
              this.capturedItem = edge.node.building;
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

  async waitForBuildings(): Promise<void> {
    if (!this.listingCaptured) {
      throw new Error("Call goto() before waitForBuildings().");
    }
    await this.listingCaptured;
    await waitEmeriaTableLoaded(this.page);
  }

  get firstItem(): BuildingItem {
    if (!this.capturedItem) {
      throw new Error(
        "No building listing data captured. Call goto() before using firstItem.",
      );
    }
    return this.capturedItem;
  }

  // =====================
  // ACTIONS
  // =====================

  async fillFilter(filter: BuildingFilter, value: string): Promise<void> {
    if (filter.type === "autocomplete") {
      await fillAutocompleteFilter(this.page, filter.testId, value);
    } else {
      await this.applyFilterValue(filter.testId, value);
    }
  }

  async clearFilter(filter: BuildingFilter): Promise<void> {
    if (filter.type === "autocomplete") {
      // Reset listing state between independent filter checks (Cypress reloads via clear on select).
      await this.goto();
      await this.waitForBuildings();
      return;
    }
    await this.applyFilterValue(filter.testId, "");
  }

  private async applyFilterValue(testId: string, value: string): Promise<void> {
    const refreshed = this.page
      .waitForResponse(
        (res) => {
          const postData = res.request().postData() ?? "";
          return (
            res.url().includes("/graphql") &&
            postData.includes("GetBuildingMandates")
          );
        },
        { timeout: 15000 },
      )
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

  // =====================
  // ASSERTIONS
  // =====================

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
    await assertFiltersVisible(
      this.page,
      Object.values(BUILDING_FILTERS).map((f) => f.testId),
    );
  }

  async assertTableNotEmpty(): Promise<void> {
    await waitEmeriaTableLoaded(this.page);
    expect(await this.rows.count()).toBeGreaterThan(0);
  }

  async assertTableEmpty(): Promise<void> {
    await waitEmeriaTableLoaded(this.page);
    await expect(this.rows).toHaveCount(1);
  }

  async assertRowContains(text: string): Promise<void> {
    if (!text) {
      return;
    }
    const normalized = text.replace("  ", " ").trim();
    await expect(this.rows.filter({ hasText: normalized })).not.toHaveCount(0);
  }
}

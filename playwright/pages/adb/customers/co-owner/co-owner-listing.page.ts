import {
  assertColumnsVisible,
  assertFiltersVisible,
  ensureAppShell,
  fillField,
  waitEmeriaTableLoaded,
} from "@helpers/ui";
import type { Locator, Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";

const DASHBOARD_PATH = "/portfolio/co-owner";
const DASHBOARD_TITLE = "Coproprietaires";

/** Address subdocument returned by the co-owner listing API. */
interface CoOwnerAddress {
  completeAddress?: string;
  address1?: string;
  zipCode?: string;
  city?: string;
}

/** A single co-owner row as returned by the listing API. */
interface CoOwnerItem {
  _id: string;
  customerNumber?: string;
  accountNumber?: string;
  civility?: string;
  firstName?: string;
  lastName?: string;
  fullname?: string;
  email?: string;
  mobilePhone?: string;
  address?: CoOwnerAddress;
}

interface CoOwnerListingResponse {
  items?: CoOwnerItem[];
}

/**
 * Matches the co-owner listing call — V1 `co-owner-customers` or V2
 * `customers?...typeCustomer=CO_OWNER`, depending on the `LISTING_CUSTOMER_V2`
 * feature flag.
 */
function isCoOwnerListingUrl(url: string): boolean {
  return (
    /\/associates\/.+\/(co-owner-customers|customers)\?/.test(url) &&
    (url.includes("co-owner-customers") ||
      url.includes("typeCustomer=CO_OWNER"))
  );
}

/**
 * A single listing filter. `fillValue` is what we type into the filter input
 * (mirrors the Cypress `search` alias); `verifyValue` is what must then appear
 * in the resulting table row (mirrors the Cypress `verifyData` alias). A filter
 * without `verifyValue` is searchable but its column is not asserted.
 */
interface CoOwnerFilter {
  /** Human label used in test titles. */
  label: string;
  /** `data-testid` of the filter `TextField` wrapper. */
  testId: string;
  fillValue: (item: CoOwnerItem) => string;
  verifyValue?: (item: CoOwnerItem) => string;
}

/**
 * Filter keys as used in the original Cypress `.feature` data tables, so the
 * scenarios can list the columns they exercise inline (just like the Gherkin
 * tables) and look the filter up by key.
 */
export type CoOwnerFilterKey =
  | "CO_OWNER_CUSTOMER"
  | "CO_OWNER_ACCOUNT"
  | "CO_OWNER_CIVILITY"
  | "CO_OWNER_NAME"
  | "CO_OWNER_ADDRESS"
  | "CO_OWNER_PHONE"
  | "CO_OWNER_EMAIL";

/**
 * Some account numbers are a comma-separated list; the listing only filters on
 * the first one (mirrors `extractFirstNumberAsString` from the Cypress suite).
 */
function firstAccountNumber(accountNumber?: string): string {
  if (!accountNumber) {
    return "";
  }
  return accountNumber.includes(",")
    ? accountNumber.split(",")[0].trim()
    : accountNumber.trim();
}

/** Filter set covered by the single- and multi-filter scenarios, keyed by their `.feature` column name. */
export const CO_OWNER_FILTERS: Record<CoOwnerFilterKey, CoOwnerFilter> = {
  CO_OWNER_CUSTOMER: {
    label: "Identifiant",
    testId: "customer-number",
    fillValue: (item) => item.customerNumber ?? "",
    verifyValue: (item) => item.customerNumber ?? "",
  },
  CO_OWNER_ACCOUNT: {
    label: "Compte",
    testId: "account-number",
    fillValue: (item) => firstAccountNumber(item.accountNumber),
    verifyValue: (item) => firstAccountNumber(item.accountNumber),
  },
  CO_OWNER_CIVILITY: {
    label: "Civilité",
    testId: "civility",
    fillValue: (item) => item.civility ?? "",
  },
  CO_OWNER_NAME: {
    label: "Nom",
    testId: "name",
    fillValue: (item) => item.lastName ?? "",
    verifyValue: (item) => item.fullname ?? "",
  },
  CO_OWNER_ADDRESS: {
    label: "Adresse",
    testId: "address",
    fillValue: (item) => item.address?.completeAddress ?? "",
    verifyValue: (item) => item.address?.address1 ?? "",
  },
  CO_OWNER_PHONE: {
    label: "Téléphone",
    testId: "telephone",
    fillValue: (item) => item.mobilePhone ?? "",
    verifyValue: (item) => item.mobilePhone ?? "",
  },
  CO_OWNER_EMAIL: {
    label: "Email",
    testId: "email",
    fillValue: (item) => item.email ?? "",
    verifyValue: (item) => item.email ?? "",
  },
};

export class CoOwnerListingPage {
  private capturedItem: CoOwnerItem | null = null;
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
    // Capture the listing call as it arrives, reading its body immediately (a
    // hard navigation / reload would otherwise evict it before waitForCoOwners
    // reads it). Listening starts before navigating so a fast load can't miss it.
    this.capturedItem = null;
    this.listingCaptured = new Promise<void>((resolve) => {
      const onResponse = (res: Response): void => {
        if (!isCoOwnerListingUrl(res.url())) {
          return;
        }
        void res
          .json()
          .then((body: CoOwnerListingResponse) => {
            if (body.items) {
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

  /**
   * Await the co-owner listing API response (V1 `co-owner-customers` or V2
   * `customers?...typeCustomer=CO_OWNER`) captured by {@link goto} so the filter
   * scenarios can be driven by real data — the Playwright equivalent of the
   * Cypress "intercepts the GET request" step.
   */
  async waitForCoOwners(): Promise<void> {
    if (!this.listingCaptured) {
      throw new Error("Call goto() before waitForCoOwners().");
    }

    await this.listingCaptured;
    await waitEmeriaTableLoaded(this.page);
  }

  /** First co-owner returned by the listing, captured during {@link goto}. */
  get firstItem(): CoOwnerItem {
    if (!this.capturedItem) {
      throw new Error(
        "No co-owner listing data captured. Call goto() before using firstItem.",
      );
    }
    return this.capturedItem;
  }

  // =====================
  // ACTIONS
  // =====================

  async fillFilter(filter: CoOwnerFilter, value: string): Promise<void> {
    await this.applyFilterValue(filter.testId, value);
  }

  async clearFilter(filter: CoOwnerFilter): Promise<void> {
    await this.applyFilterValue(filter.testId, "");
  }

  /**
   * Type into a filter and wait for the debounced listing request it triggers to
   * come back, so callers observe the table already refreshed (no fixed sleep).
   */
  private async applyFilterValue(testId: string, value: string): Promise<void> {
    const refreshed = this.page
      .waitForResponse((res) => isCoOwnerListingUrl(res.url()), {
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
      Object.values(CO_OWNER_FILTERS).map((filter) => filter.testId),
    );
  }

  async assertTableNotEmpty(): Promise<void> {
    await waitEmeriaTableLoaded(this.page);
    expect(await this.rows.count()).toBeGreaterThan(0);
    await expect(this.table.getByText("Aucun client trouvé")).toHaveCount(0);
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

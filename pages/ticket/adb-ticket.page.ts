import {
  fillField,
  multipleSelectFilter,
  selectDropdownList,
  ticketBuildingAutocompleteSelect,
} from "@helpers/ui";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/* =========================================================
 * TYPES
 * ========================================================= */

type TicketFilters = {
  associateFullName?: string;
  ticketRef?: string;
  buildingAddress?: string;
  ticketStatus?: string;
};

type FilterKey = keyof TicketFilters;

/* =========================================================
 * PAGE OBJECT
 * ========================================================= */

export class TicketsPage {
  constructor(public page: Page) {}

  /* -------------------- Navigation -------------------- */

  async goto(path: string) {
    const origin = new URL(this.page.url()).origin;
    await this.page.goto(`${origin}${path}`, {
      waitUntil: "domcontentloaded",
    });
  }

  /* -------------------- API -------------------- */

  async waitForTickets() {
    // Buffer the body inside the predicate to avoid the CDP "No resource
    // with given identifier found" error that occurs when the response body
    // is released before response.json() is called after waitForResponse.
    let body: unknown = null;
    await this.page.waitForResponse(async (res) => {
      const url = res.url();
      const postData = res.request().postData() ?? "";

      if (
        res.status() === 200 &&
        (url.includes("/tickets?") ||
          (url.includes("/graphql") && postData.includes("GetTickets")))
      ) {
        body = await res.json().catch(() => null);
        return body !== null;
      }
      return false;
    });

    return body;
  }

  /* -------------------- Filters -------------------- */

  async applyFilters(filters: TicketFilters) {
    const { associateFullName, ticketRef, buildingAddress, ticketStatus } =
      filters;

    if (associateFullName) {
      await selectDropdownList({
        page: this.page,
        dataTestId: "associate",
        by: { searchText: associateFullName },
      });
    }

    if (ticketRef) {
      await fillField({
        page: this.page,
        testId: "ticketNumber",
        value: ticketRef,
        assertVisible: true,
      });
    }

    if (buildingAddress) {
      await ticketBuildingAutocompleteSelect(
        this.page,
        "building",
        buildingAddress,
      );
    }

    if (ticketStatus) {
      await multipleSelectFilter(this.page, "status", ticketStatus);
    }
  }

  /* -------------------- Assertions -------------------- */

  async assertTableNotEmpty() {
    const rows = this.page.locator("table tbody tr");

    await expect(
      rows.first(),
      "❌ Table vide : aucun ticket affiché",
    ).toBeVisible({ timeout: 10000 });
  }

  async assertFiltersVisible(fields: FilterKey[]) {
    const testIdMap: Record<FilterKey, string> = {
      associateFullName: "associate",
      ticketRef: "ticketNumber",
      buildingAddress: "building",
      ticketStatus: "status",
    };

    for (const field of fields) {
      await expect(
        this.page.locator(`[data-testid="${testIdMap[field]}"]`).first(),
        `❌ Filtre non visible: ${field}`,
      ).toBeVisible();
    }
  }

  async assertTicketRefValue(expected: string) {
    const input = this.page.locator('[data-testid="ticketNumber"]');
    await expect(input).toHaveValue(expected, { timeout: 10000 });
  }

  /* -------------------- Utils -------------------- */

  async getTextFromFirstCell(dataTestIdPrefix: string): Promise<string> {
    const cell = this.page
      .locator(`[data-testid^="${dataTestIdPrefix}"]`)
      .first();

    await expect(cell).toBeVisible();
    return (await cell.innerText()).trim();
  }

  async waitForResponseLike(urlPart: string, timeout = 15000) {
    await this.page.waitForResponse(
      (response) => response.url().includes(urlPart),
      { timeout },
    );
  }
}

/* =========================================================
 * HELPERS (API / DATA)
 * ========================================================= */

/**
 * Extrait le premier ticket (GraphQL ou REST)
 */
export function extractTicketItem(body: any) {
  return (
    body?.data?.tickets?.data?.edges?.[0]?.node ?? body?.items?.[0] ?? null
  );
}

/**
 * Extrait les filtres depuis un ticket
 */
export function extractFilters(
  item: any,
  fields?: FilterKey | FilterKey[],
): TicketFilters {
  const includeFields = Array.isArray(fields)
    ? fields
    : fields
      ? [fields]
      : null;

  const filters: TicketFilters = {};

  if (!includeFields || includeFields.includes("associateFullName")) {
    const firstName =
      item.metadata?.associate?.firstName ??
      item.metadata?.associateFirstName ??
      "";

    const lastName =
      item.metadata?.associate?.lastName ??
      item.metadata?.associateLastName ??
      "";

    filters.associateFullName = `${firstName} ${lastName}`.trim();
  }

  if (!includeFields || includeFields.includes("ticketRef")) {
    filters.ticketRef = item.ticketNumber ?? "";
  }

  if (!includeFields || includeFields.includes("buildingAddress")) {
    filters.buildingAddress =
      item.metadata?.building?.address?.fullAddress ??
      item.metadata?.building?.address?.address1 ??
      item.metadata?.building?.address?.completeAddress ??
      "";
  }

  if (!includeFields || includeFields.includes("ticketStatus")) {
    const statusMapping: Record<string, string> = {
      OPEN: "À traiter ADB",
      WORK_IN_PROGRESS: "En cours ADB",
      PROCESSED: "Traité ADB",
      CLOSED: "Terminé ADB",
      FINISHED: "Terminé ADB",
      CANCELLED: "Annulé ADB",
    };

    filters.ticketStatus = statusMapping[item.status] ?? item.status ?? "";
  }

  return filters;
}

import { waitForGraphqlOperation } from "@helpers/api/network/waitForGraphqlOperation";
import { waitForRestResponse } from "@helpers/api/network/waitForRestResponse";
import { TEST_CONFIG } from "@helpers/common/test-config";
import { selectDropdownList } from "@helpers/ui/common/selectDropdownList";
import {
  assertColumnsVisible,
  assertTableNotEmpty,
} from "@helpers/ui/table/assertTableListing";
import { emeriaTableFilter } from "@helpers/ui/table/emeriaTableFilter";
import { waitEmeriaTableLoaded } from "@helpers/ui/table/waitEmeriaTableLoaded";
import type { Locator, Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";

const TABLE_NO_DATA_TEXT = "Aucune donnée disponible";
const CHIP_ZERO_AMOUNT = "0,00";

const LISTING_ENDPOINT = /\/accounting\/coownership\/\?/;
const BALANCE_TOTALS_ENDPOINT = /\/accounting\/coownership\/balance\?/;

type BalanceChipTestId = "balanceChip" | "creditChip" | "debtChip";

/** Cypress `balanceChip` / `creditChip` / `debtChip` table columns (`true` = shows 0,00). */
type BalanceChipZeroExpectations = {
  balanceChip: boolean;
  creditChip: boolean;
  debtChip: boolean;
};

/** Free-text filter testids in the bar. */
const FREE_TEXT_FILTER_TESTIDS = {
  owner: "owner",
  accountingClass: "accountingClass",
  subAccount: "sub-account",
  balance: "balance",
  label: "label",
} as const;

/**
 * Filters exposed by the ListingBalanceComptes filter bar. The keys are the
 * `filters[<id>]` URL keys used by `useRestTable.hasUrlPersistence`.
 */
type BalanceComptesFilters = {
  owner?: string;
  accountingClass?: string;
  subAccount?: string;
  balance?: string;
  label?: string;
};

/** Métier (lineOfBusiness) values exposed by the Métier Combobox. */
type BalanceComptesKind =
  | "S"
  | "G"
  | "Comptes generaux S"
  | "Comptes generaux G";

/** Balance type values exposed by the Type de Solde Combobox. */
type BalanceComptesBalanceKind =
  | "A zéro"
  | "Différent de zéro"
  | "Débiteur"
  | "Créditeur";

/** Type helper for the listing endpoint response body. */
type ListingResponseBody = {
  items?: Array<{
    _id: string;
    subAccount?: string;
    accountingClass?: string;
    lineOfBusiness?: string;
    label?: string;
    building?: { _id: string; buildingNumber?: string };
    lessorAccount?: { _id: string; fullname?: string };
  }>;
  totalDisplayPages?: number;
  itemsPerPage?: number;
};

/**
 * Page object for `/balance-comptes` (Consultation du solde des comptes).
 *
 * The page is a `useRestTable` table fed by the PLATO endpoint
 * `GET /accounting/coownership/`. An agency selector sits in the card header
 * and gates the table — without a selected agency the page shows an info Alert
 * instead of the table.
 */
export class ListingBalanceComptesPage {
  constructor(public page: Page) {}

  /** Navigate to the listing on the current host. */
  async goto(path = "/balance-comptes") {
    const origin = new URL(this.page.url()).origin;
    await this.page.goto(`${origin}${path}`, { waitUntil: "domcontentloaded" });
  }

  /**
   * Waits for the PLATO listing endpoint and returns the parsed JSON body.
   * The balance totals endpoint (`/accounting/coownership/balance`) and the
   * listing share the same path prefix, so we filter on the trailing `/?` to
   * disambiguate.
   */
  async waitForListing(): Promise<ListingResponseBody> {
    const response = await waitForRestResponse(
      this.page,
      LISTING_ENDPOINT,
      "GET",
      TEST_CONFIG.timeouts.long,
    );
    return response.json();
  }

  /** Waits for the balance totals refetch (`GET /accounting/coownership/balance`). */
  waitForBalanceTotals(): Promise<Response> {
    return waitForRestResponse(
      this.page,
      BALANCE_TOTALS_ENDPOINT,
      "GET",
      TEST_CONFIG.timeouts.long,
    );
  }

  // --- Page chrome ---------------------------------------------------------

  private cardTitleLocator() {
    return this.page
      .locator('[data-testid="CardHeader"] [data-testid="cardTitle"]')
      .first();
  }

  async assertPageTitle(title = "Consultation solde des comptes") {
    await expect(this.cardTitleLocator()).toHaveText(title);
  }

  async assertColumnHeadersVisible(
    columns = [
      "Métier",
      "Propriétaire",
      "Immeuble",
      "Classe",
      "Sous-compte",
      "Titre",
      "Solde",
    ],
  ) {
    await assertColumnsVisible(this.page, columns);
  }

  async assertTableNotEmpty() {
    await waitEmeriaTableLoaded(this.page);
    await assertTableNotEmpty(this.page);
  }

  /**
   * The shared `assertTableEmpty` checks `tbody tr` count === 0, but
   * `@emeria/table`'s empty state renders a `<TableRow>` containing
   * "Aucune donnée disponible" — i.e. the count is 1 when the listing is
   * empty. Assert the empty-state cell directly instead.
   */
  async assertTableEmpty() {
    await waitEmeriaTableLoaded(this.page);
    await expect(
      this.page.locator("table tbody tr td", { hasText: TABLE_NO_DATA_TEXT }),
    ).toBeVisible();
  }

  // --- Balance chips -------------------------------------------------------

  private balanceChipLocator(testId: BalanceChipTestId): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Mirrors Cypress `verifyChipValue`: `isZero: true` means the chip displays
   * `0,00`, `isZero: false` means it does not.
   */
  async assertBalanceChipShowsZero(
    testId: BalanceChipTestId,
    isZero: boolean,
  ): Promise<void> {
    const chip = this.balanceChipLocator(testId);
    await expect(chip).toBeVisible();

    if (isZero) {
      await expect(chip).toContainText(CHIP_ZERO_AMOUNT);
    } else {
      await expect(chip).not.toContainText(CHIP_ZERO_AMOUNT);
    }
  }

  async assertBalanceChips(expectations: BalanceChipZeroExpectations) {
    await this.assertBalanceChipShowsZero(
      "balanceChip",
      expectations.balanceChip,
    );
    await this.assertBalanceChipShowsZero(
      "creditChip",
      expectations.creditChip,
    );
    await this.assertBalanceChipShowsZero("debtChip", expectations.debtChip);
  }

  // --- Filters -------------------------------------------------------------

  /**
   * Resolves the `<input>` element behind a filter testid. The shadcn `Input`
   * places the testid on the input element directly, while wrappers (e.g.
   * the building autocomplete trigger) keep it on a host `<div>`.
   */
  private filterInput(testId: string): Locator {
    return this.page
      .getByTestId(testId)
      .locator("xpath=descendant-or-self::input")
      .first();
  }

  /** Returns the current `value` attribute of a free-text filter input. */
  async getFilterValue(testId: string): Promise<string> {
    return (await this.filterInput(testId).inputValue()) ?? "";
  }

  /**
   * Fills a single filter input. Uses the `emeriaTableFilter` helper which
   * also waits for the table's internal debounce so the refetch has time to
   * trigger.
   */
  async fillFreeTextFilter(testId: string, value: string) {
    await emeriaTableFilter(this.page, testId, value);
  }

  async applyFilters(filters: BalanceComptesFilters) {
    for (const [key, testId] of Object.entries(FREE_TEXT_FILTER_TESTIDS) as [
      keyof BalanceComptesFilters,
      string,
    ][]) {
      const value = filters[key];
      if (value !== undefined) {
        await emeriaTableFilter(this.page, testId, value);
      }
    }
  }

  /**
   * Opens the Métier combobox and picks an option by its exact visible label.
   *
   * The shadcn Combobox filters with a case-insensitive `includes()` and the
   * shared `selectDropdownList` clicks the first option matching
   * `hasText: <label>` — both fall over on labels like "S" because they also
   * match "Comptes generaux S" and "Comptes generaux G" (the latter contains
   * an "s" via "comptes"). Use a role-based exact-name lookup instead.
   */
  async selectKind(optionLabel: BalanceComptesKind) {
    await this.selectComboboxOptionExact("kind", optionLabel);
  }

  async selectBalanceKind(optionLabel: BalanceComptesBalanceKind) {
    await this.selectComboboxOptionExact("balance_kind", optionLabel);
  }

  private async selectComboboxOptionExact(dataTestId: string, label: string) {
    await this.page.getByTestId(dataTestId).click();
    await this.page
      .getByTestId(`${dataTestId}--content`)
      .getByRole("option", { name: label, exact: true })
      .click();
  }

  /** Returns the current trigger label of the Métier Combobox. */
  async getKindTriggerLabel(): Promise<string> {
    return (await this.page.getByTestId("kind").textContent()) ?? "";
  }

  /**
   * Opens the Immeuble entity-field combobox, types `buildingNumber`, waits
   * for the `GetBuildingMandatesAutocomplete` query, picks the first option,
   * and returns the picked option label so callers can assert downstream.
   */
  async selectBuildingByNumber(buildingNumber: string): Promise<string> {
    await selectDropdownList({
      page: this.page,
      dataTestId: "building",
      by: { searchText: buildingNumber },
      apiCallsToWaitToGetOptions: ["GetBuildingMandatesAutocomplete"],
    });
    return buildingNumber;
  }

  /**
   * Searches the Immeuble entity-field with `query` and returns whether the
   * popover shows any option. Used to verify the agency-scoped search returns
   * no result for a building belonging to another agency.
   */
  async buildingFieldHasResultsFor(query: string): Promise<boolean> {
    await this.page.getByTestId("building").click();
    const searchInput = this.page
      .locator('[data-shadcn="combobox-content"] input')
      .first();
    await searchInput.fill(query);

    await waitForGraphqlOperation(this.page, "GetBuildingMandatesAutocomplete");

    return (await this.page.getByRole("option").count()) > 0;
  }

  // --- Row actions ---------------------------------------------------------

  /** Clicks the "Voir le détail des écritures" eye icon on the first row. */
  async clickFirstRowEntriesAction() {
    const firstRow = this.page.getByRole("row").nth(1);
    await firstRow.getByRole("button").last().click();
  }
}

type ListingItem = NonNullable<ListingResponseBody["items"]>[number];

/** Picks the first row from the listing endpoint response. */
export function extractFirstAccount(
  body: ListingResponseBody,
): ListingItem | null {
  return body.items?.[0] ?? null;
}

/** Returns the first listing row matching `predicate`. */
export function findAccount(
  body: ListingResponseBody,
  predicate: (item: ListingItem) => boolean,
): ListingItem | null {
  return body.items?.find(predicate) ?? null;
}

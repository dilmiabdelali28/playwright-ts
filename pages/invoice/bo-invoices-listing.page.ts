import { waitForResponseLike } from "@helpers/api/network/waitForResponseLike";
import { TEST_CONFIG } from "@helpers/common/test-config";
import {
  assertColumnsVisible,
  assertFiltersVisible,
  assertTableNotEmpty,
  fillField,
  selectDropdownList,
  textFromFirstCellByPrefix,
  waitEmeriaTableLoaded,
} from "@helpers/ui";
import type { Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";

import { BoInvoicePage } from "./bo-invoice.page";

type InvoiceListingTab = "all" | "deleted" | "draft" | "rejected";

type InvoiceListingSearchData = {
  invoiceNumber: string;
  creditorNumber: string;
};

type InvoiceListingItem = {
  debtorAddress?: string;
  debtorNumber?: string | number;
  lineOfBusiness?: string;
  invoiceNumber?: string;
  creditorNumber?: string;
};

const INVOICE_LISTING_FILTERS = [
  "businessType",
  "invoiceNumber",
  "creditor",
  "invoiceType",
  "amountTTC",
] as const;

const INVOICE_LISTING_COLUMNS = [
  "Type",
  "Immeuble / Compte bailleur",
  "Gestionnaire",
  "N° Facture",
  "Fournisseur",
  "Reçu le",
  "Montant TTC",
  "Type référence",
] as const;

export class BoInvoicesListingPage {
  private lastListingItems: InvoiceListingItem[] = [];

  constructor(readonly page: Page) {}

  async goto(boBaseUrl: string, tab: InvoiceListingTab): Promise<void> {
    const listingResponses: Response[] = [];
    const onListingResponse = (response: Response) => {
      if (response.url().includes("/invoices?") && response.status() === 200) {
        listingResponses.push(response);
      }
    };

    this.page.on("response", onListingResponse);

    try {
      await this.page.goto(`${boBaseUrl}/invoices/a-integrer/${tab}`, {
        waitUntil: "domcontentloaded",
      });

      const invoicePage = new BoInvoicePage(this.page);
      const agencyInput = this.page
        .getByTestId("agency")
        .locator("input")
        .first();
      const agencyRefreshPromise = (await agencyInput
        .isVisible()
        .catch(() => false))
        ? this.page.waitForResponse(
            (response) =>
              response.url().includes("/invoices?") &&
              response.status() === 200,
            { timeout: TEST_CONFIG.timeouts.long },
          )
        : null;

      const agencySet = await invoicePage.setAgencyIfVisible(
        TEST_CONFIG.targetAgency,
      );
      if (agencySet && agencyRefreshPromise) {
        await agencyRefreshPromise.catch(() => undefined);
      }

      await waitEmeriaTableLoaded(this.page);
      await this.storeLastListingItems(listingResponses);
    } finally {
      this.page.off("response", onListingResponse);
    }
  }

  async captureSearchData(): Promise<InvoiceListingSearchData> {
    const invoiceNumber = await textFromFirstCellByPrefix(
      this.page,
      "invoiceNumber",
    );
    const item = findListingItem(this.lastListingItems, invoiceNumber);

    return {
      invoiceNumber,
      creditorNumber: item?.creditorNumber ?? "",
    };
  }

  private async storeLastListingItems(
    listingResponses: Response[],
  ): Promise<void> {
    const lastResponse = listingResponses.at(-1);
    if (!lastResponse) {
      this.lastListingItems = [];
      return;
    }

    const body = (await lastResponse.json()) as {
      items?: InvoiceListingItem[];
    };
    this.lastListingItems = body.items ?? [];
  }

  async applyMultiFilters(searchData: InvoiceListingSearchData): Promise<void> {
    await fillField({
      page: this.page,
      testId: "invoiceNumber",
      value: searchData.invoiceNumber,
      assertVisible: true,
    });
    await waitForResponseLike(this.page, "/invoices?").catch(() => null);

    if (searchData.creditorNumber) {
      await selectDropdownList({
        page: this.page,
        dataTestId: "creditor",
        by: { searchText: searchData.creditorNumber },
      });
      await waitForResponseLike(this.page, "/invoices?").catch(() => null);
    }
  }

  async assertDashboardLoaded(): Promise<void> {
    await expect(
      this.page
        .locator('[data-testid="CardHeader"] [data-testid="cardTitle"]')
        .first(),
    ).toHaveText("Factures", { timeout: TEST_CONFIG.timeouts.long });
  }

  async assertColumnsVisible(): Promise<void> {
    await assertColumnsVisible(this.page, [...INVOICE_LISTING_COLUMNS]);
  }

  async assertFiltersVisible(): Promise<void> {
    await assertFiltersVisible(this.page, [...INVOICE_LISTING_FILTERS]);
  }

  async assertInvoiceTabsVisible(): Promise<void> {
    const tabLabels = [
      "Reçues",
      "En cours de saisie",
      "Rejetées par le gestionnaire",
      "Supprimées",
      "Toutes les factures",
    ] as const;

    for (const label of tabLabels) {
      await expect(this.page.getByRole("tab", { name: label })).toBeVisible();
    }
  }

  async assertTableNotEmpty(): Promise<void> {
    await assertTableNotEmpty(this.page);
  }
}

function findListingItem(
  items: InvoiceListingItem[],
  invoiceNumber: string,
): InvoiceListingItem | undefined {
  return (
    items.find(
      (item) =>
        item.invoiceNumber === invoiceNumber &&
        item.debtorAddress &&
        item.debtorNumber &&
        item.lineOfBusiness !== "unknown",
    ) ??
    items.find((item) => item.invoiceNumber === invoiceNumber) ??
    items.find(
      (item) =>
        item.debtorAddress &&
        item.debtorNumber &&
        item.lineOfBusiness !== "unknown" &&
        item.invoiceNumber,
    ) ??
    items.find((item) => item.invoiceNumber)
  );
}

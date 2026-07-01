import { fillField } from "@helpers/ui";
import { type Page, expect } from "@playwright/test";

const CATEGORY_LABELS: Record<AffectationTransferCategory, string> = {
  probables: "Affectations probables",
  manuals: "Non-affectés",
  history: "Historique des Affectations",
};

export class AffectationTransfersPage {
  constructor(public page: Page) {}

  async goto(path: string) {
    const origin = new URL(this.page.url()).origin;
    await this.page.goto(`${origin}${path}`, {
      waitUntil: "domcontentloaded",
    });
  }

  async waitForTransfers(category: AffectationTransferCategory) {
    const apiPath = categoryApiPath[category];

    const response = await this.page.waitForResponse((r) =>
      r.url().includes(`accounting/transfers/${apiPath}`),
    );

    return response.json();
  }

  async assertCategoriesVisible() {
    for (const label of Object.values(CATEGORY_LABELS)) {
      await expect(this.page.getByRole("link", { name: label })).toBeVisible();
    }
  }

  // --- Titre ---
  async assertPageTitle(title: string) {
    const cardTitle = this.page.getByTestId("cardTitle").first();
    await expect(cardTitle).toBeVisible();
    await expect(cardTitle).toContainText(title);
  }

  async assertTableNotEmpty() {
    const rows = this.page.locator("div.rt-tr-group");
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  }

  async assertLegoTableColumnNamesVisible(columns: string[]) {
    for (const column of columns) {
      await expect(
        this.page.getByRole("columnheader", { name: column, exact: true }),
      ).toBeVisible();
    }
  }

  // --- Filtres ---

  async applyFilters(filters: AffectationTransferFilters) {
    const { bankAccount, bankTransferReference, label, amountValue } = filters;

    if (bankAccount) {
      await fillField({
        page: this.page,
        testId: "input-bankAccount",
        value: bankAccount,
        assertVisible: true,
      });
    }

    if (bankTransferReference) {
      await fillField({
        page: this.page,
        testId: "input-bankTransferReference",
        value: bankTransferReference,
        assertVisible: true,
      });
    }

    if (label) {
      await fillField({
        page: this.page,
        testId: "input-label",
        value: label,
        assertVisible: true,
      });
    }

    if (amountValue) {
      await fillField({
        page: this.page,
        testId: "input-amountValue",
        value: amountValue,
        assertVisible: true,
      });
    }
  }

  async filterByBankAccount(value: string) {
    await fillField({
      page: this.page,
      testId: "input-bankAccount",
      value,
      assertVisible: true,
    });
  }

  async filterByTransferReference(value: string) {
    await fillField({
      page: this.page,
      testId: "input-bankTransferReference",
      value,
      assertVisible: true,
    });
  }

  async filterByLabel(value: string) {
    await fillField({
      page: this.page,
      testId: "input-label",
      value,
      assertVisible: true,
    });
  }

  async filterByAmount(value: string) {
    await fillField({
      page: this.page,
      testId: "input-amountValue",
      value,
      assertVisible: true,
    });
  }
}

type AffectationTransferCategory = "probables" | "manuals" | "history";

type AffectationTransferFilters = {
  bankAccount?: string;
  bankTransferReference?: string;
  label?: string;
  amountValue?: string;
};

type FilterKey = keyof AffectationTransferFilters;

const categoryApiPath: Record<AffectationTransferCategory, string> = {
  probables: "affectationProposal/probable",
  manuals: "affectationProposal/manual",
  history: "affectations/history",
};

/**
 * Extrait le premier item de la réponse API
 */
export function extractTransferItem(body: { items?: unknown[] }) {
  return body?.items?.[0] ?? null;
}

/**
 * Extrait les filtres depuis un item
 * @param item L'item de la réponse API
 * @param fields Un champ ou un tableau de champs à extraire
 */
export function extractFilters(
  item: {
    bankAccountingAccount?: { label?: string };
    bankTransaction?: {
      bankTransferReference?: string;
      emitter?: string;
      amount?: { value?: number };
    };
  } | null,
  fields?: FilterKey | FilterKey[],
): AffectationTransferFilters {
  const includeFields = Array.isArray(fields)
    ? fields
    : fields
      ? [fields]
      : null;
  const filters: AffectationTransferFilters = {};

  if (!includeFields || includeFields.includes("bankAccount")) {
    filters.bankAccount = item?.bankAccountingAccount?.label ?? "";
  }

  if (!includeFields || includeFields.includes("bankTransferReference")) {
    filters.bankTransferReference =
      item?.bankTransaction?.bankTransferReference ?? "";
  }

  if (!includeFields || includeFields.includes("label")) {
    filters.label = item?.bankTransaction?.emitter ?? "";
  }

  if (!includeFields || includeFields.includes("amountValue")) {
    const value = item?.bankTransaction?.amount?.value;
    filters.amountValue = value !== undefined ? String(Math.round(value)) : "";
  }

  return filters;
}

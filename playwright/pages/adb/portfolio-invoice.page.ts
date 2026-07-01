import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Page } from "@playwright/test";

import { BO_ENDPOINTS } from "$fixtures/setup/bo/endpoints";

export class AdbPortfolioInvoicePage {
  constructor(private readonly page: Page) {}

  private readonly testIds = {
    invoiceNumberFilter: "invoiceNumber",
    accountButton: "accounting::invoice::account-modal",
    confirmButton: "confirm",
    referenceKind: "referenceKind",
    referenceTarget: "referenceTarget",
  } as const;

  private readonly labels = {
    confirmLabel: /Confirmer/i,
  } as const;

  private readonly selectors = {
    tableFirstRow: "table tbody tr",
    // MUI Select trigger inside the referenceKind FormSelectField container
    referenceKindTrigger: '[data-testid="referenceKind"] [role="button"]',
  } as const;

  async goto(): Promise<void> {
    const base = new URL(this.page.url()).origin;
    await this.page.goto(`${base}/portfolio/invoice/all`, {
      waitUntil: "domcontentloaded",
    });
  }

  /** Incomplete invoices listing (matches Cypress getIncompletedInvoice). */
  async gotoToHandle(): Promise<void> {
    const base = new URL(this.page.url()).origin;
    await this.page.goto(`${base}/portfolio/invoice/to-handle`, {
      waitUntil: "domcontentloaded",
    });
  }

  async openIncompleteInvoice(invoiceNumber: string): Promise<void> {
    // Invoice numbers are unique (timestamp-based) — find the cell directly
    // without relying on filter testIds that differ across ADB listing pages.
    const invoiceCell = this.page
      .locator('[data-testid^="invoiceNumber-"]')
      .filter({ hasText: invoiceNumber })
      .first();
    await expect(invoiceCell).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await invoiceCell.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async assertAmounts(amountTtc: string, amountHt: string): Promise<void> {
    await expect(this.page.locator(`text=${amountTtc}`).first()).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await expect(this.page.locator(`text=${amountHt}`).first()).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
  }

  /**
   * Selects the reference kind on the ADB invoice form.
   * The ADB form uses a MUI Select (Form.SelectField) — click the trigger div,
   * then click the option from the MUI menu portal.
   */
  async selectReferenceKind(kindLabel: string): Promise<void> {
    const trigger = this.page
      .locator(this.selectors.referenceKindTrigger)
      .first();
    await expect(trigger).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await trigger.click();
    await this.page
      .getByRole("option", { name: new RegExp(kindLabel, "i") })
      .first()
      .click();
  }

  /**
   * Selects the reference target (OS workorder) on the ADB invoice form.
   * The ADB form uses a Form.AutocompleteField which renders an <input>,
   * so we can type the search text and pick from the dropdown options.
   * Retries up to 10 times with 3 s gaps for ADB→BO propagation delay.
   */
  async selectReferenceTarget(searchText: string): Promise<boolean> {
    const referenceTargetInput = this.page
      .getByTestId(this.testIds.referenceTarget)
      .locator("input")
      .first();

    await expect(referenceTargetInput).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(referenceTargetInput).toBeEnabled({
      timeout: TEST_CONFIG.timeouts.long,
    });

    for (let attempt = 0; attempt < 10; attempt++) {
      if (attempt > 0) {
        await referenceTargetInput.clear();
        await this.page.waitForTimeout(3000);
      }
      const responsePromise = this.page.waitForResponse(
        (r) =>
          r.url().includes(BO_ENDPOINTS.referenceSearch) &&
          r.request().method() === "GET",
        { timeout: TEST_CONFIG.timeouts.long },
      );
      await referenceTargetInput.fill(searchText);
      await responsePromise;
      const option = this.page
        .getByRole("option", { name: new RegExp(searchText, "i") })
        .first();
      const visible = await option
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      if (visible) {
        await option.click();
        if (await referenceTargetInput.inputValue()) {
          return true;
        }
      }
    }
    return false;
  }

  async saveAndCount(): Promise<void> {
    // On incomplete invoices the ADB form shows "Valider la facture" once the
    // OS reference is filled. On already-complete invoices the standard
    // account-modal button is shown instead.
    const validateButton = this.page
      .getByRole("button", { name: /Valider la facture/i })
      .first();
    const accountButton = this.page
      .getByTestId(this.testIds.accountButton)
      .first();

    const primaryAction = await Promise.race([
      validateButton
        .waitFor({ state: "visible", timeout: TEST_CONFIG.timeouts.long })
        .then(() => "validate" as const),
      accountButton
        .waitFor({ state: "visible", timeout: TEST_CONFIG.timeouts.long })
        .then(() => "account" as const),
    ]);

    if (primaryAction === "validate") {
      await validateButton.click();
    } else {
      await accountButton.click();
    }

    const confirmButton = this.page
      .getByRole("button", { name: this.labels.confirmLabel })
      .first();
    if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmButton.click();
    }
  }

  async assertInvoiceProcessed(): Promise<void> {
    await expect(
      this.page.locator(this.selectors.tableFirstRow).first(),
    ).toBeVisible({ timeout: TEST_CONFIG.timeouts.long });
  }

  /**
   * Adds a second codification line, then sets the same budget and amount on
   * both lines (mirrors the Cypress addNewCodificationLine + selectCodificationBudget
   * + updateAmount steps used on the repair-OS invoice).
   */
  async addCodificationLine(
    budgetLabel: string,
    amount: number,
  ): Promise<void> {
    await this.page
      .getByRole("button", { name: /Ajouter une ligne/i })
      .first()
      .click();

    for (const index of [0, 1]) {
      await this.selectCodificationBudget(index, budgetLabel);
    }
    for (const index of [0, 1]) {
      await this.setCodificationAmount(index, amount);
    }
  }

  private async selectCodificationBudget(
    index: number,
    budgetLabel: string,
  ): Promise<void> {
    // The budget field is a react-select whose data-testid sits on the control
    // itself — clicking it opens the menu (no inner [role="button"]).
    const trigger = this.page
      .getByTestId(`codification[${index}].budget`)
      .first();
    await expect(trigger).toBeVisible({ timeout: TEST_CONFIG.timeouts.long });
    await trigger.click();
    await this.page
      .getByRole("option", { name: new RegExp(budgetLabel, "i") })
      .first()
      .click();
  }

  private async setCodificationAmount(
    index: number,
    amount: number,
  ): Promise<void> {
    const value = String(amount);
    await this.page
      .getByTestId(`codification[${index}].amount.amountTTC.value`)
      .first()
      .fill(value);
    await this.page
      .getByTestId(`codification[${index}].amount.amountHT.value`)
      .first()
      .fill(value);
  }

  /**
   * Saves the codification ("Enregistrer"), then accounts the invoice and
   * confirms. Returns the invoice debtorNumber captured from the invoice GET
   * response (used later to filter BO accounting lines).
   */
  async saveAndCountCodification(): Promise<string> {
    const saveButton = this.page
      .getByRole("button", { name: /Enregistrer/i })
      .first();
    await expect(saveButton).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(saveButton).toBeEnabled({
      timeout: TEST_CONFIG.timeouts.long,
    });

    const codificationPromise = this.page.waitForResponse(
      (r) =>
        r.url().includes("/codification") && r.request().method() === "POST",
      { timeout: TEST_CONFIG.timeouts.long },
    );
    await saveButton.click();
    await codificationPromise;

    const accountButton = this.page
      .getByTestId(this.testIds.accountButton)
      .first();
    await expect(accountButton).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(accountButton).toBeEnabled({
      timeout: TEST_CONFIG.timeouts.long,
    });

    const enterPromise = this.page.waitForResponse(
      (r) => r.url().includes("/enter") && r.request().method() === "POST",
      { timeout: TEST_CONFIG.timeouts.long },
    );
    const invoiceGetPromise = this.page
      .waitForResponse(
        (r) =>
          /\/invoices\/[a-f0-9]{24}(\?|$)/.test(r.url()) &&
          r.request().method() === "GET",
        { timeout: TEST_CONFIG.timeouts.long },
      )
      .catch(() => null);

    await accountButton.click();

    const confirmButton = this.page
      .getByRole("button", { name: this.labels.confirmLabel })
      .first();
    if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmButton.click();
    }

    await enterPromise;

    const invoiceResponse = await invoiceGetPromise;
    if (invoiceResponse) {
      const body = (await invoiceResponse.json().catch(() => null)) as {
        debtorNumber?: string;
      } | null;
      if (body?.debtorNumber) {
        return body.debtorNumber;
      }
    }
    return "";
  }
}

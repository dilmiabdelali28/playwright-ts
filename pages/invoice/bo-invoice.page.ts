import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Locator, type Page } from "@playwright/test";

import { BO_ENDPOINTS } from "$fixtures/setup/bo/endpoints";

import { BaseBoPage } from "./base-bo.page";

export class BoInvoicePage extends BaseBoPage {
  constructor(page: Page) {
    super(page);
  }

  private readonly testIds = {
    agency: "agency",
    supplier: "supplier",
    building: "building",
    addInvoice: "addInvoice",
    sendInvoice: "sendInvoice",
    invoiceNumber: "invoiceNumber",
    invoiceDate: "invoiceDate",
    referenceKind: "referenceKind",
    referenceTarget: "referenceTarget",
    amountTtc: "amount.amountTTC.value",
    amountHt: "amount.amountHT.value",
    affectButton: "accounting::invoice::affect",
    accountButton: "accounting::invoice::account-modal",
    transferButton: "accounting::invoice::transfer-modal",
    saveDraftButton: "accounting::invoice::save-as-draft-modal",
    confirmButton: "confirm",
    dialogContent: "dialog-content",
  } as const;

  private readonly labels = {
    referenceKindButton: /Type de référence/i,
    saveLabel: "Sauvegarder",
    saveAndGoDraft: "Sauvegarder et passer en cours de saisi",
    transferLabel: "Transférer",
    confirmLabel: "Confirmer",
  } as const;

  private readonly selectors = {
    receivedMenuLink: 'a[href="/invoices/a-integrer/received"]',
    entriesMenuLink: 'a[href="/entries"]',
    invoiceFileInput: '[data-name="invoiceFile"] input[type="file"]',
    creditNoteToggle: '[data-name="isCreditNote"]',
    draftCommentInput: '[name="draftComment"]',
    dueDateInput: 'input[data-testid="dueDate"], input[name="dueDate"]',
    debitDateInput: 'input[data-testid="debitDate"], input[name="debitDate"]',
    amountHtValidationError: '[data-name="amount.amountHT.value"]',
    accountingLinesEndpoint: "/accounting/accountants-lines",
  } as const;
  private readonly endpoints = BO_ENDPOINTS;

  async openReceivedInvoicesDashboard(): Promise<boolean> {
    const facturesMenu = this.page
      .locator(this.selectors.receivedMenuLink)
      .first();
    const menuVisible = await facturesMenu
      .waitFor({ state: "visible", timeout: TEST_CONFIG.timeouts.medium })
      .then(() => true)
      .catch(() => false);
    if (!menuVisible) {
      return false;
    }

    await facturesMenu.click();
    await expect(this.page).toHaveURL(/\/invoices\/a-integrer\/received/);
    await this.page.waitForResponse(
      (r) =>
        r.url().includes(this.endpoints.invoiceListing) && r.status() === 200,
      {
        timeout: TEST_CONFIG.timeouts.medium,
      },
    );
    return true;
  }

  async setAgencyIfVisible(agencyName: string): Promise<boolean> {
    const agencyInput = this.getInputElementByDataTestId(this.testIds.agency);
    if (!(await this.isVisibleSafe(agencyInput))) {
      return false;
    }

    await agencyInput.fill(agencyName);
    await agencyInput.press("ArrowDown");
    await agencyInput.press("Enter");
    return true;
  }

  async createInvoiceFromPdf(pdfPath: string): Promise<boolean> {
    const addInvoiceButton = this.getElementByDataTestId(
      this.testIds.addInvoice,
    ).first();
    const canCreate = await this.isVisibleSafe(addInvoiceButton);
    if (!canCreate) {
      return false;
    }

    await addInvoiceButton.click();
    await this.page
      .locator(this.selectors.invoiceFileInput)
      .first()
      .setInputFiles(pdfPath);

    await Promise.all([
      this.page.waitForResponse(
        (r) =>
          r.url().includes(this.endpoints.createInvoice) &&
          r.request().method() === "POST",
      ),
      this.getElementByDataTestId(this.testIds.sendInvoice).first().click(),
    ]);

    return true;
  }

  async fillBaseFields(
    invoiceNumber: string,
    invoiceDate: string,
  ): Promise<void> {
    await this.getElementByDataTestId(this.testIds.invoiceNumber)
      .first()
      .fill(invoiceNumber);
    await this.getElementByDataTestId(this.testIds.invoiceDate)
      .first()
      .fill(invoiceDate);
    await this.getElementByDataTestId(this.testIds.invoiceDate)
      .first()
      .press("Enter");
  }

  async openInvoiceFromReceivedListing(
    invoiceId: string,
    invoiceNumber: string,
  ): Promise<void> {
    await this.getElementByDataTestId(this.testIds.invoiceNumber)
      .first()
      .fill(invoiceNumber);

    const byInvoiceNumberId = this.getElementByDataTestId(
      `invoiceNumber-${invoiceId}`,
    ).first();
    const byInvoiceId = this.getElementByDataTestId(
      `invoiceNumber-${invoiceId}`,
    ).first();
    // Row and cell share the listing; `.or()` breaks strict `toBeVisible` (2 matches).
    await expect(byInvoiceId).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    if (await this.isVisibleSafe(byInvoiceNumberId)) {
      await byInvoiceNumberId.click();
      return;
    }

    await byInvoiceId.click();
  }

  async selectReferenceKind(kindLabel: string): Promise<void> {
    const referenceKindButton = this.page
      .getByRole("button", { name: this.labels.referenceKindButton })
      .first();

    if (await this.isVisibleSafe(referenceKindButton)) {
      await referenceKindButton.click();
      // Short timeout: non-fatal wait — TENOR/OCR invoices may not fire a
      // referenceSearch request at all. 8 s is enough for fast cases; if no
      // request fires we just move on without hanging for 30 s.
      const searchPromise = this.page
        .waitForResponse(
          (r) =>
            r.url().includes(this.endpoints.referenceSearch) &&
            r.request().method() === "GET",
          { timeout: 8000 },
        )
        .catch(() => null);
      await this.page
        .getByRole("option", { name: new RegExp(kindLabel, "i") })
        .first()
        .click();
      await searchPromise;
    } else {
      const referenceKindInput = this.getInputElementByDataTestId(
        this.testIds.referenceKind,
      );
      const searchPromise = this.page
        .waitForResponse(
          (r) =>
            r.url().includes(this.endpoints.referenceSearch) &&
            r.request().method() === "GET",
          { timeout: 8000 },
        )
        .catch(() => null);
      await referenceKindInput.fill(kindLabel);
      await referenceKindInput.press("Enter");
      await searchPromise;
    }
  }

  async selectReferenceTarget(
    searchText: string,
    referenceType: "CT" | "OS" | "ADF",
  ): Promise<boolean> {
    const referenceTargetInput = this.getInputElementByDataTestId(
      this.testIds.referenceTarget,
    );
    await expect(referenceTargetInput).toBeVisible();
    await expect(referenceTargetInput).toBeEnabled({
      timeout: TEST_CONFIG.timeouts.medium,
    });

    // OS workorders are created in ADB and propagate to BO asynchronously.
    // Poll until the specific workorder appears in the search results.
    if (referenceType === "OS") {
      for (let attempt = 0; attempt < 10; attempt++) {
        if (attempt > 0) {
          await referenceTargetInput.clear();
          await this.page.waitForTimeout(3000);
        }
        const responsePromise = this.page.waitForResponse(
          (r) =>
            r.url().includes(this.endpoints.referenceSearch) &&
            r.request().method() === "GET",
          { timeout: TEST_CONFIG.timeouts.medium },
        );
        await referenceTargetInput.fill(searchText);
        await responsePromise;
        const option = this.page
          .getByRole("option", { name: new RegExp(searchText, "i") })
          .first();
        if (await this.isVisibleSafe(option)) {
          await option.click();
          await expect(referenceTargetInput)
            .not.toHaveValue("", { timeout: 3000 })
            .catch(() => {});
          if (await referenceTargetInput.inputValue()) {
            return true;
          }
        }
      }
      return false;
    }

    const searchCandidates = [
      searchText,
      referenceType === "ADF" ? searchText : referenceType,
    ];
    for (const candidate of searchCandidates) {
      const responsePromise = this.page.waitForResponse(
        (r) =>
          r.url().includes(this.endpoints.referenceSearch) &&
          r.request().method() === "GET",
        { timeout: TEST_CONFIG.timeouts.medium },
      );
      await referenceTargetInput.fill(candidate);
      await responsePromise;
      await expect(this.page.getByRole("option").first()).toBeVisible({
        timeout: TEST_CONFIG.timeouts.medium,
      });

      const optionByText = this.page
        .getByRole("option", { name: new RegExp(candidate, "i") })
        .first();
      if (await this.isVisibleSafe(optionByText)) {
        await optionByText.click();
      } else {
        const firstOption = this.page.getByRole("option").first();
        if (await this.isVisibleSafe(firstOption)) {
          await firstOption.click();
        }
      }

      // Wait for the combobox to settle after selection — some payment types
      // (SELF_PRINTED_CHECK, DIRECT_DEBIT) update the input asynchronously.
      await expect(referenceTargetInput)
        .not.toHaveValue("", { timeout: 3000 })
        .catch(() => {});
      if (await referenceTargetInput.inputValue()) {
        return true;
      }
    }

    return false;
  }

  async setSupplierBySearch(searchText: string): Promise<void> {
    const input = this.getInputElementByDataTestId(this.testIds.supplier);
    await input.fill(searchText);
    await expect(this.page.getByRole("option").first()).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await input.press("ArrowDown");
    await input.press("Enter");
  }

  async setBuildingBySearch(searchText: string): Promise<void> {
    const input = this.getInputElementByDataTestId(this.testIds.building);
    await input.fill(searchText);
    await expect(this.page.getByRole("option").first()).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await input.press("ArrowDown");
    await input.press("Enter");
  }

  async fillAmountAndDueDate(amount: string, dueDate: string): Promise<void> {
    await this.getElementByDataTestId(this.testIds.amountTtc)
      .first()
      .fill(amount);
    const dueDateInput = this.page.locator(this.selectors.dueDateInput).first();
    await dueDateInput.fill(dueDate);
    await dueDateInput.press("Enter");
  }

  async fillInvoiceAmounts(amountTtc: string, amountHt: string): Promise<void> {
    await this.getElementByDataTestId(this.testIds.amountTtc)
      .first()
      .fill(amountTtc);
    await this.getElementByDataTestId(this.testIds.amountHt)
      .first()
      .fill(amountHt);
  }

  async setDebitDate(date: string): Promise<boolean> {
    const debitDateInput = this.page
      .locator(this.selectors.debitDateInput)
      .first();
    if (!(await this.isVisibleSafe(debitDateInput))) {
      return false;
    }
    await debitDateInput.fill(date);
    await debitDateInput.press("Enter");
    return true;
  }

  async setCreditNote(): Promise<void> {
    await this.page.locator(this.selectors.creditNoteToggle).first().click();
  }

  async assertAccountButtonVisible(): Promise<void> {
    await expect(
      this.getElementByDataTestId(this.testIds.accountButton).first(),
    ).toBeVisible();
  }

  async assertPrimaryInvoiceActionVisible(): Promise<
    "account" | "transfer" | "affect"
  > {
    const affectButton = this.getElementByDataTestId(
      this.testIds.affectButton,
    ).first();
    const accountButton = this.getElementByDataTestId(
      this.testIds.accountButton,
    ).first();
    const transferButton = this.getElementByDataTestId(
      this.testIds.transferButton,
    ).first();

    if (await this.isVisibleSafe(affectButton)) {
      await expect(affectButton).toBeVisible();
      return "affect";
    }
    if (await this.isVisibleSafe(accountButton)) {
      await expect(accountButton).toBeVisible();
      return "account";
    }
    if (await this.isVisibleSafe(transferButton)) {
      await expect(transferButton).toBeVisible();
      return "transfer";
    }
    throw new Error(
      "No primary invoice action button is visible (affect/account/transfer).",
    );
  }

  async affectInvoiceToManager(): Promise<boolean> {
    const affectButton = this.getElementByDataTestId(
      this.testIds.affectButton,
    ).first();
    await expect(affectButton).toBeVisible();
    await expect(affectButton).toBeEnabled({
      timeout: TEST_CONFIG.timeouts.medium,
    });

    const saveDraftPromise = this.page.waitForResponse(
      (r) =>
        r.url().includes(this.endpoints.saveAsDraft) &&
        r.request().method() === "POST",
      { timeout: TEST_CONFIG.timeouts.medium },
    );
    const validatePromise = this.page.waitForResponse(
      (r) => r.url().includes("/validate") && r.request().method() === "POST",
      { timeout: TEST_CONFIG.timeouts.medium },
    );

    await affectButton.click();

    await Promise.all([saveDraftPromise, validatePromise]);
    return true;
  }

  async accountInvoice(): Promise<boolean> {
    const accountButton = this.getElementByDataTestId(
      this.testIds.accountButton,
    ).first();
    await expect(accountButton).toBeVisible();
    await expect(accountButton).toBeEnabled({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await accountButton.scrollIntoViewIfNeeded();
    await accountButton.click();

    const confirmButton = this.getElementByDataTestId(
      this.testIds.confirmButton,
    ).getByText(this.labels.confirmLabel);
    if (!(await this.isVisibleSafe(confirmButton))) {
      return false;
    }
    await confirmButton.click();
    return true;
  }

  async transferInvoiceToManager(): Promise<boolean> {
    const transferButton = this.getElementByDataTestId(
      this.testIds.transferButton,
    ).first();
    await expect(transferButton).toBeVisible();
    await expect(transferButton).toBeEnabled({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await transferButton.click();

    // For some payment means (e.g. SELF_PRINTED_CHECK / Lettre chèque) the
    // button opens a ventilation form with "Comptabiliser la facture" instead
    // of a simple "Transférer" confirmation dialog.
    const confirmTransfer = this.page
      .getByRole("button", { name: this.labels.transferLabel })
      .first();
    const comptabiliser = this.page
      .getByRole("button", { name: /Comptabiliser la facture/i })
      .first();

    const result = await Promise.race([
      confirmTransfer
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => "transfer" as const),
      comptabiliser
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => "comptabiliser" as const),
    ]).catch(() => null);

    if (!result) {
      return false;
    }

    if (result === "transfer") {
      await confirmTransfer.click();
    } else {
      await comptabiliser.click();
    }
    return true;
  }

  async saveAsDraft(comment = "testComment", goToDraft = false): Promise<void> {
    const saveButton = this.getElementByDataTestId(
      this.testIds.saveDraftButton,
    ).first();
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    const commentInput = this.page
      .locator(this.selectors.draftCommentInput)
      .last();
    if (await this.isVisibleSafe(commentInput)) {
      await commentInput.fill(comment);
    }

    if (goToDraft) {
      const saveAndGo = this.page
        .getByRole("button", { name: this.labels.saveAndGoDraft })
        .first();
      if (await this.isVisibleSafe(saveAndGo)) {
        await Promise.all([
          this.page.waitForResponse(
            (r) =>
              r.url().includes(this.endpoints.saveAsDraft) &&
              r.request().method() === "POST",
          ),
          saveAndGo.click(),
        ]);
        return;
      }
    }

    const saveModalButton = this.getElementByDataTestId(
      this.testIds.dialogContent,
    )
      .getByRole("button", { name: this.labels.saveLabel })
      .first();
    await Promise.all([
      this.page.waitForResponse(
        (r) =>
          r.url().includes(this.endpoints.saveAsDraft) &&
          r.request().method() === "POST",
      ),
      saveModalButton.click(),
    ]);
  }

  async changeAgency(agencyName: string): Promise<void> {
    const input = this.getInputElementByDataTestId(this.testIds.agency);
    await input.fill(agencyName);
    const option = this.page
      .getByRole("option", { name: new RegExp(agencyName, "i") })
      .first();
    await expect(option).toBeVisible({ timeout: TEST_CONFIG.timeouts.medium });
    await option.click();
  }

  async assertCurrentAgency(agencyName: string): Promise<void> {
    const input = this.getInputElementByDataTestId(this.testIds.agency);
    await expect(input).toHaveValue(new RegExp(agencyName, "i"), {
      timeout: TEST_CONFIG.timeouts.medium,
    });
  }

  async fillAmountAboveFivePercent(contractAmount: number): Promise<void> {
    const aboveThreshold = (contractAmount + contractAmount * 0.05 + 1).toFixed(
      2,
    );
    const amountInput = this.getElementByDataTestId(
      this.testIds.amountTtc,
    ).first();
    await amountInput.fill(aboveThreshold);
    await amountInput.press("Tab");
    // Wait for the exceeding section to appear in the DOM instead of a fixed delay.
    await this.page
      .locator('[data-testid="CardHeader"]')
      .first()
      .waitFor({ state: "visible", timeout: TEST_CONFIG.timeouts.medium })
      .catch(() => undefined);
  }

  async assertExceedingSectionVisible(): Promise<void> {
    const cardHeader = this.page.locator('[data-testid="CardHeader"]').first();
    await expect(cardHeader).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await cardHeader.click();
    // Wait for accordion content: "Dépassement" text first (confirms expansion),
    // then the workOrder input element — matches Cypress assertion order.
    await expect(this.page.getByText("Dépassement").first()).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await expect(this.getElementByDataTestId("workOrder").first()).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
  }

  async goToAccountingEntries(): Promise<void> {
    const entriesMenu = this.page
      .locator(this.selectors.entriesMenuLink)
      .first();
    await expect(entriesMenu).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await entriesMenu.click();
    await expect(this.page).toHaveURL(/\/entries/);
  }

  /**
   * Filters the accounting entries listing on the building (searched by its
   * debtorNumber) and the OS workorder label (mirrors the Cypress
   * filterOnAccountingLines("Os") step).
   */
  async filterAccountingLinesByOs(
    debtorNumber: string,
    osLabel: string,
  ): Promise<void> {
    const buildingInput = this.getInputElementByDataTestId(
      this.testIds.building,
    );
    await buildingInput.fill(debtorNumber);
    await expect(this.page.getByRole("option").first()).toBeVisible({
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await buildingInput.press("ArrowDown");
    await buildingInput.press("Enter");

    await this.page
      .getByRole("button", { name: /Afficher plus de filtres/i })
      .first()
      .click();

    await this.getInputElementByDataTestId("label").fill(osLabel);

    const accountingLinesPromise = this.page.waitForResponse(
      (r) =>
        r.url().includes(this.selectors.accountingLinesEndpoint) &&
        r.request().method() === "GET",
      { timeout: TEST_CONFIG.timeouts.long },
    );
    await this.getElementByDataTestId("btnApplyFilters").first().click();
    await accountingLinesPromise;
  }

  async assertOsAccountingLines(debtorNumber: string): Promise<void> {
    const rows = this.page.locator("tbody tr");
    await expect(rows).toHaveCount(3, { timeout: TEST_CONFIG.timeouts.long });

    const count = await rows.count();
    for (let index = 0; index < count; index++) {
      await expect(this.estateColumnCell(rows.nth(index))).toHaveText(
        debtorNumber,
      );
    }
  }

  private estateColumnCell(row: Locator): Locator {
    return row.getByTestId(/^estate-/);
  }

  async saveInvoiceAndExpectAmountError(errorMessage: string): Promise<void> {
    const saveButton = this.getElementByDataTestId(
      this.testIds.saveDraftButton,
    ).first();
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    const saveModalButton = this.getElementByDataTestId(
      this.testIds.dialogContent,
    )
      .getByRole("button", { name: this.labels.saveLabel })
      .first();
    if (await this.isVisibleSafe(saveModalButton)) {
      await saveModalButton.click();
    }

    await expect(
      this.page.locator(this.selectors.amountHtValidationError),
    ).toContainText(errorMessage);
  }
}

export function formatFrDate(date: Date): string {
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;
  return `${day}/${month}/${year}`;
}

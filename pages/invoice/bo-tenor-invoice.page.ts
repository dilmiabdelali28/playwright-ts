import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Page } from "@playwright/test";

import { BO_ENDPOINTS } from "$fixtures/setup/bo/endpoints";

import { BaseBoPage } from "./base-bo.page";

export class BoTenorInvoicePage extends BaseBoPage {
  constructor(page: Page) {
    super(page);
  }

  private readonly testIds = {
    agency: "agency",
    referenceKind: "referenceKind",
    referenceTarget: "referenceTarget",
    transferButton: "accounting::invoice::transfer-modal",
    saveDraftButton: "accounting::invoice::save-as-draft-modal",
    dialogContent: "dialog-content",
    invoiceNumber: "invoiceNumber",
    tenorOriginKey: "key-invoice.origin",
    tenorExternalIdKey: "key-invoice.metadata.tenorEdiExtraction.externalId",
    tenorOriginValue: "value-invoice.origin",
    tenorExternalIdValue:
      "value-invoice.metadata.tenorEdiExtraction.externalId",
  } as const;

  private readonly labels = {
    contractType: "Contrat",
    saveLabel: "Sauvegarder",
  } as const;
  private readonly endpoints = BO_ENDPOINTS;

  async assertTenorMetadata(): Promise<void> {
    const originKey = this.getElementByDataTestId(this.testIds.tenorOriginKey);
    await originKey.waitFor({
      state: "attached",
      timeout: TEST_CONFIG.timeouts.medium,
    });

    await expect(originKey).toContainText("Origine de la facture", {
      timeout: TEST_CONFIG.timeouts.medium,
    });
    await expect(
      this.getElementByDataTestId(this.testIds.tenorExternalIdKey),
    ).toContainText("Identifiant Tenor");
    await expect(
      this.getElementByDataTestId(this.testIds.tenorOriginValue),
    ).toContainText("TENOR");
    await expect(
      this.getElementByDataTestId(this.testIds.tenorExternalIdValue),
    ).toContainText(TEST_CONFIG.tenorExternalId);
  }

  async assertTransferButtonEnabled(): Promise<void> {
    const transferButton = this.getElementByDataTestId(
      this.testIds.transferButton,
    );
    await expect(transferButton).toBeVisible();
    await expect(transferButton).toBeEnabled();
  }

  async selectAgencyIfEditable(agencyName: string): Promise<boolean> {
    const agencyInput = this.getInputElementByDataTestId(this.testIds.agency);
    const canEdit =
      (await this.isVisibleSafe(agencyInput)) &&
      (await this.isEnabledSafe(agencyInput));
    if (!canEdit) {
      return false;
    }

    await agencyInput.fill(agencyName);
    await agencyInput.press("ArrowDown");
    await agencyInput.press("Enter");
    return true;
  }

  async chooseContractReference(contractNumber: string): Promise<void> {
    const referenceKindInput = this.getInputElementByDataTestId(
      this.testIds.referenceKind,
    );
    await referenceKindInput.fill(this.labels.contractType);
    await referenceKindInput.press("Enter");

    const referenceTargetInput = this.getInputElementByDataTestId(
      this.testIds.referenceTarget,
    );
    if (!(await this.isEnabledSafe(referenceTargetInput))) {
      return;
    }

    await referenceTargetInput.fill(contractNumber);
    await Promise.all([
      this.page.waitForResponse((r) =>
        r.url().includes(this.endpoints.referenceSearchContract),
      ),
      referenceTargetInput.press("ArrowDown"),
    ]);
    await referenceTargetInput.press("Enter");
  }

  async saveDraft(): Promise<void> {
    const saveButton = this.getElementByDataTestId(
      this.testIds.saveDraftButton,
    ).first();
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    const modalSaveButton = this.getElementByDataTestId(
      this.testIds.dialogContent,
    )
      .getByRole("button", { name: this.labels.saveLabel })
      .first();
    if (await this.isVisibleSafe(modalSaveButton)) {
      await Promise.all([
        this.page.waitForResponse(
          (r) =>
            r.url().includes(this.endpoints.saveAsDraft) &&
            r.request().method() === "POST",
        ),
        modalSaveButton.click(),
      ]);
      return;
    }

    await this.page.waitForResponse(
      (r) =>
        r.url().includes(this.endpoints.saveAsDraft) &&
        r.request().method() === "POST",
    );
  }

  async openReceivedDashboard(boBaseUrl: string): Promise<void> {
    await this.page.goto(`${boBaseUrl}/invoices/a-integrer/received`);
    await expect(this.page).toHaveURL(/\/invoices\/a-integrer\/received/);
    await this.page.waitForResponse(
      (r) =>
        r.url().includes(this.endpoints.invoiceListing) && r.status() === 200,
      {
        timeout: TEST_CONFIG.timeouts.long,
      },
    );
  }

  async assertInvoiceListed(
    invoiceId: string,
    invoiceNumber: string,
  ): Promise<void> {
    const invoiceNumberFilter = this.getElementByDataTestId(
      this.testIds.invoiceNumber,
    ).first();
    await expect(invoiceNumberFilter).toBeVisible();
    await invoiceNumberFilter.fill(invoiceNumber);
    await this.page
      .waitForResponse(
        (r) =>
          r.url().includes(this.endpoints.invoiceListing) &&
          r.request().method() === "GET",
        {
          timeout: TEST_CONFIG.timeouts.medium,
        },
      )
      .catch(() => null);

    await expect(
      this.getElementByDataTestId(`invoiceNumber-${invoiceId}`).first(),
    ).toHaveText(invoiceNumber);
  }
}

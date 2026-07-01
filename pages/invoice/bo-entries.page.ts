import { expect, type Page } from "@playwright/test";

import { BaseBoPage } from "./base-bo.page";

export class BoEntriesPage extends BaseBoPage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    const origin = new URL(this.page.url()).origin;
    await this.page.goto(`${origin}/invoices/accounting-entered`, {
      waitUntil: "domcontentloaded",
    });
    await this.page
      .waitForResponse(
        (r) => r.url().includes("/invoices") && r.status() === 200,
        { timeout: 30000 },
      )
      .catch(() => null);
  }

  async assertInvoiceAttachedToContract(contractNumber: string): Promise<void> {
    await expect(
      this.page.locator(`text=${contractNumber}`).first(),
    ).toBeVisible({ timeout: 30000 });
  }

  async assertInvoiceAccounted(invoiceNumber: string): Promise<void> {
    await expect(
      this.page.locator(`text=${invoiceNumber}`).first(),
    ).toBeVisible({ timeout: 30000 });
  }
}

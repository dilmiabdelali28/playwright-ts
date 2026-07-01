import { type Locator, type Page } from "@playwright/test";

export abstract class BaseBoPage {
  constructor(protected readonly page: Page) {}

  protected getElementByDataTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  protected getInputElementByDataTestId(testId: string): Locator {
    return this.getElementByDataTestId(testId).locator("input").first();
  }

  protected async isVisibleSafe(
    locator: Locator,
    timeout?: number,
  ): Promise<boolean> {
    return locator
      .isVisible(timeout ? { timeout } : undefined)
      .catch(() => false);
  }

  protected async isEnabledSafe(locator: Locator): Promise<boolean> {
    return locator.isEnabled().catch(() => false);
  }

  async openInvoiceDetail(boBaseUrl: string, invoiceId: string): Promise<void> {
    await this.page.goto(`${boBaseUrl}/invoices/${invoiceId}`);
    await this.page.waitForLoadState("domcontentloaded");
  }
}

import { getOktaAccessTokenWithRetry } from "@helpers/auth/bo-auth";
import {
  loadEnvironmentConfig,
  resolveFixturesRoot,
} from "@helpers/auth/environment-fixtures";
import { TEST_CONFIG } from "@helpers/common/test-config";
import type { Page } from "@playwright/test";

type CreateTransferContractParams = {
  buildingId: string;
};

function formatYmd(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export class AdbContractPage {
  private readonly adbApiBaseUrl: string;

  constructor(private readonly page: Page) {
    const config = loadEnvironmentConfig(
      resolveFixturesRoot(TEST_CONFIG.fixturesDir),
    );
    this.adbApiBaseUrl = config.env?.ADB?.API_BASE_URL ?? "";
  }

  async createTransferContract({
    buildingId,
  }: CreateTransferContractParams): Promise<string> {
    const token = await getOktaAccessTokenWithRetry(this.page);
    if (!token) {
      throw new Error(
        "Unable to resolve ADB access token from browser session.",
      );
    }
    if (!this.adbApiBaseUrl) {
      throw new Error("ADB API base URL not configured.");
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const response = await this.page.request.post(
      `${this.adbApiBaseUrl}/contracts`,
      {
        headers: { authorization: `Bearer ${token}` },
        data: {
          label: `AutoContract${Date.now()}`,
          family: "CLASSIC",
          type: "ARCHIVAGE",
          paymentMeans: "TRANSFER",
          description: `AutoPW ${formatYmd(today)}`,
          startingDate: formatYmd(today),
          endingDate: formatYmd(endDate),
          isTacitAgreement: false,
          consumption: false,
          lessorAccount: "5e5db02c59e1efc00879835c",
          codification: [
            {
              allocationKey: "5e5dafdfbf15b1c441009e30",
              expenseType: "5e5dafddd60067a5bbfdde69",
              rate: 1,
            },
          ],
          billingFrequency: "YEARLY",
          fonciaContractNumber: "Auto",
          amount: { value: 10000, currency: "EUR" },
          supplier: null,
          building: buildingId,
          noticeDelay: 0,
        },
      },
    );

    if (!response.ok()) {
      throw new Error(
        `Failed to create transfer contract: ${response.status()} ${await response.text()}`,
      );
    }

    const body = (await response.json()) as { contractNumber?: string };
    if (!body.contractNumber) {
      throw new Error("Contract creation response missing contractNumber.");
    }
    return body.contractNumber;
  }
}

import { waitForRestResponse } from "@helpers/api/network/waitForRestResponse";
import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Page } from "@playwright/test";

import { MissionSidebarPage } from "../mission-sidebar.page";
import type { AttendanceCounterExpectation } from "./mission-ag.types";

export class AgAttendancePage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await new MissionSidebarPage(this.page).openPageByTestId(
      "pageAttendanceSheet",
    );
  }

  async startAgAttendance(missionId: string): Promise<void> {
    const startAttendancePromise = waitForRestResponse(
      this.page,
      `/missions/general-assembly/${missionId}/attendance-sheet/start`,
      "POST",
      TEST_CONFIG.timeouts.long,
    );

    await this.page.getByTestId("startAttendanceButton").click();
    await this.page.getByTestId("confirmStartAttendanceButton").click();
    await startAttendancePromise;

    await expect(this.page.getByTestId("startAGButton")).toBeVisible();
    await expect(this.page.getByTestId("startAGButton")).toBeDisabled();
  }

  async startAg(): Promise<void> {
    await this.page.getByTestId("startAGButton").click();
    await this.page.getByTestId("confirmStartAttendanceButton").click();
  }

  async setCoOwnerAttendance(
    coOwnerId: string,
    presenceStatus: string,
  ): Promise<void> {
    switch (presenceStatus) {
      case "present": {
        const presentPromise = waitForRestResponse(
          this.page,
          /\/participant\/.*\/present/,
          "PUT",
          TEST_CONFIG.timeouts.long,
        );
        await this.page
          .locator(`[data-testid="presenceToggle-${coOwnerId}"] input`)
          .check();
        await presentPromise;
        await expect(
          this.page.locator(
            `[data-testid="presenceToggle-${coOwnerId}"] input`,
          ),
        ).toBeChecked();
        await this.signParticipant(coOwnerId);
        break;
      }
      case "absent": {
        await this.page
          .locator(`[data-testid="presenceToggle-${coOwnerId}"] input`)
          .uncheck();
        await expect(
          this.page.getByTestId(`signatureButton-${coOwnerId}`),
        ).toHaveCount(0);
        break;
      }
      default:
        throw new Error(`Unsupported presence status: ${presenceStatus}`);
    }
  }

  async assertAttendanceCounters(
    counters: AttendanceCounterExpectation,
  ): Promise<void> {
    await expect(
      this.page.getByTestId("participantPresentOrRepresentedCount"),
    ).toHaveText(counters.presentCoOwnersCount);
    await expect(
      this.page.getByTestId("participantPresentOrRepresentedPercentage"),
    ).toHaveText(counters.presentCoOwnersPercentage);
    await expect(this.page.getByTestId("participantVpcCount")).toHaveText(
      counters.vpcCoOwnersCount,
    );
    await expect(this.page.getByTestId("participantVpcPercentage")).toHaveText(
      counters.vpcCoOwnersPercentage,
    );
    await expect(this.page.getByTestId("participantCount")).toHaveText(
      counters.totalCoOwnersCount,
    );
    await expect(this.page.getByTestId("participantPercentage")).toHaveText(
      counters.totalCoOwnersPercentage,
    );
  }

  private async signParticipant(coOwnerId: string): Promise<void> {
    const signaturePromise = waitForRestResponse(
      this.page,
      /\/participant\/.*\/signature/,
      "PUT",
      TEST_CONFIG.timeouts.long,
    );

    await this.page.getByTestId(`signatureButton-${coOwnerId}`).click();
    await this.page.getByTestId("signCanvas").click();
    await this.page.getByTestId("signConfirmButton").click();
    await signaturePromise;
  }
}

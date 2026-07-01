import { waitForRestResponse } from "@helpers/api/network/waitForRestResponse";
import { TEST_CONFIG } from "@helpers/common/test-config";
import { fillDateField, selectDropdownList } from "@helpers/ui";
import { expect, type Page } from "@playwright/test";
import moment from "moment";

import { MissionSidebarPage } from "../mission-sidebar.page";
import type { MissionAgLocation } from "./mission-ag.types";

export class AgSynthesisPage {
  private agDate: Date | null = null;

  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await new MissionSidebarPage(this.page).openPageByTestId("pageSyntheseAg");
  }

  async verifyAgTypeSection(
    agType: string,
    agSpec: string,
    allocKey: string,
  ): Promise<void> {
    await expect(this.page.getByTestId("typeAG").locator("input")).toHaveValue(
      agType,
    );
    await expect(
      this.page.getByTestId("specificity").locator("input"),
    ).toHaveValue(agSpec);
    await expect(
      this.page.getByTestId("allocationKey").locator("input"),
    ).toHaveValue(allocKey);
  }

  async selectAgLocation(agLocation: MissionAgLocation): Promise<void> {
    await expect(this.page.getByTestId("preference")).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await selectDropdownList({
      page: this.page,
      dataTestId: "preference",
      by: { optionValue: agLocation.locationType ?? "" },
    });
    await this.verifyAgLocationSection(agLocation);

    const putLocationPromise = waitForRestResponse(
      this.page,
      "/missions/general-assembly/",
      "PUT",
      TEST_CONFIG.timeouts.long,
    );
    const submitButton = this.page.getByTestId("ag-location-submit-button");
    await expect(submitButton).toContainText("Mettre à jour");
    await submitButton.click();
    await putLocationPromise;
  }

  async verifyAgLocationSection(agLocation: MissionAgLocation): Promise<void> {
    if (agLocation.locationName) {
      await expect(this.page.getByTestId("meetingPlace.address3")).toHaveValue(
        agLocation.locationName,
      );
    }

    if (agLocation.address) {
      await expect(this.page.getByTestId("meetingPlace.address1")).toHaveValue(
        agLocation.address,
      );
    }

    if (agLocation.address2) {
      await expect(this.page.getByTestId("meetingPlace.address2")).toHaveValue(
        agLocation.address2,
      );
    }

    await expect(this.page.getByTestId("meetingPlace.city")).toHaveValue(
      agLocation.city ?? "",
    );
    await expect(this.page.getByTestId("meetingPlace.zipCode")).toHaveValue(
      agLocation.zipcode,
    );
  }

  async addAgDate(): Promise<void> {
    this.agDate = moment().add(1, "month").toDate();
    const dateValue = moment(this.agDate).format("DD/MM/YYYY HH:mm");

    const postContributorPromise = waitForRestResponse(
      this.page,
      "/contributor",
      "POST",
      60000,
    );
    const postAgDatePromise = waitForRestResponse(
      this.page,
      "/official-meeting",
      "POST",
      40000,
    );

    await fillDateField({ page: this.page, testId: "date", value: dateValue });
    await this.page.getByTestId("validateByTrusteeCouncil").click();
    await postContributorPromise;
    await postAgDatePromise;
  }

  async sendAgConvocationToCouncil(): Promise<void> {
    // Sending the convocation calls utilMail.mailTo() which does
    // window.open(mailto, "_self") (packages/transformers/src/utils/mail.ts),
    // popping the OS mail composer. We neutralise window.open, mirroring the
    // Cypress `win.open = cy.stub()`. The call is fired asynchronously, after
    // two network round-trips (POST /contributor then GET trustee members), so
    // the stub must survive any re-render: addInitScript re-applies it on every
    // (re)load while evaluate covers the document that is already loaded.
    const stubWindowOpen = (): void => {
      window.open = () => null;
    };
    await this.page.addInitScript(stubWindowOpen);
    await this.page.evaluate(stubWindowOpen);

    await expect(this.page.getByTestId("sendToTrusteeCouncil")).toBeEnabled({
      timeout: 3000,
    });

    // Wait for the send to actually fire so the stubbed window.open is invoked
    // inside the test instead of leaking after it returns.
    const postContributorPromise = waitForRestResponse(
      this.page,
      "/contributor",
      "POST",
      TEST_CONFIG.timeouts.long,
    );
    await this.page.getByTestId("sendToTrusteeCouncil").click();
    await postContributorPromise;
  }

  async verifyAgDate(): Promise<void> {
    if (!this.agDate) {
      throw new Error("AG date was not set in this test run");
    }

    const formattedDate = moment(this.agDate).format("DD/MM/YYYY HH:mm");
    await expect(this.page.locator('input[data-testid="date"]')).toHaveValue(
      formattedDate,
    );
  }
}

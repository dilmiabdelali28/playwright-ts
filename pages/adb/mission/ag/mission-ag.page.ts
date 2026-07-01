import { waitForRestResponse } from "@helpers/api/network/waitForRestResponse";
import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Locator, type Page } from "@playwright/test";

import { AdbNavBar } from "@/pages/adb/adb-nav-bar.page";

import type {
  AccountingExercise,
  AgResolutionsResponse,
  MissionAgProps,
} from "./mission-ag.types";

export class MissionAgPage {
  missionId = "";
  accountingExercises: AccountingExercise[] = [];
  resolutionsSnapshot: AgResolutionsResponse | null = null;

  private readonly testIds = {
    moduleCreateAdd: "moduleCreateAdd",
    dialogContent: "dialog-content",
    type: "type",
    typeAG: "typeAG",
    isTransitionAG: "isTransitionAG",
    housing: "housing",
    label: "label",
    allocationKey: "allocationKey",
    idAccountingPeriod: "idAccountingPeriod",
    layoutSidenavLeft: "LayoutSidenavLeft",
  } as const;

  private readonly selectors = {
    reactSelectOption: ".reactSelect__menu-list .reactSelect__option",
    description: "#description",
    reactSelectValueContainer: (testId: string) =>
      `[data-testid="${testId}"] .reactSelect__value-container`,
    reactSelectSingleValue: (testId: string) =>
      `[data-testid="${testId}"] .reactSelect__single-value`,
    housingInput: '[data-testid="housing"] input',
  } as const;

  private readonly labels = {
    createMissionButton: "Créer la mission",
    missionTypeGeneralAssembly: /^Assemblée Generale$/,
  } as const;

  constructor(private readonly page: Page) {}

  private get modal(): Locator {
    return this.page.getByTestId(this.testIds.dialogContent);
  }

  private reactSelectOption(text: string | RegExp): Locator {
    return this.page
      .locator(this.selectors.reactSelectOption)
      .filter({ hasText: text })
      .first();
  }

  async gotoMissionsListing(): Promise<void> {
    const adbNavBar = new AdbNavBar(this.page);
    await adbNavBar.clickMenu("Missions");
    await expect(this.page).toHaveURL(/\/portfolio\/mission/);
    await expect(
      this.page.getByTestId(this.testIds.moduleCreateAdd),
    ).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
  }

  async createAgMission(missionProps: MissionAgProps): Promise<void> {
    const initialUrl = this.page.url();

    const accountingExercisePromise = waitForRestResponse(
      this.page,
      "/exercises-accountant",
      "GET",
      120000,
    );

    await this.page.getByTestId(this.testIds.moduleCreateAdd).click();
    await expect(this.modal).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });

    await this.modal
      .locator(this.selectors.reactSelectValueContainer(this.testIds.type))
      .click();
    await this.reactSelectOption(
      this.labels.missionTypeGeneralAssembly,
    ).click();
    await this.modal
      .locator(this.selectors.reactSelectValueContainer(this.testIds.typeAG))
      .click();
    await this.reactSelectOption(new RegExp(`^${missionProps.type}$`)).click();

    if (missionProps.type !== "Constitutive" && missionProps.specificity) {
      await this.modal
        .locator(
          this.selectors.reactSelectValueContainer(this.testIds.isTransitionAG),
        )
        .click();
      await this.reactSelectOption(
        new RegExp(`^${missionProps.specificity}$`),
      ).click();
    }

    await this.modal.getByTestId(this.testIds.housing).click();
    await this.modal
      .locator(this.selectors.housingInput)
      .fill(missionProps.buildingName);
    await this.page.locator(this.selectors.reactSelectOption).first().click();

    const missionTitle = `Création d'une Mission AG ${missionProps.type}`;
    await this.modal
      .getByTestId(this.testIds.label)
      .fill(`AUTOMATION - MISSION ${missionProps.type} - ${Date.now()}`);
    await this.modal.locator(this.selectors.description).fill(missionTitle);

    const accountingExerciseResponse = await accountingExercisePromise;
    this.accountingExercises =
      (await accountingExerciseResponse.json()) as AccountingExercise[];

    if (missionProps.type !== "Constitutive") {
      if (missionProps.defaultAllocationKey) {
        await expect(
          this.modal
            .locator(
              this.selectors.reactSelectSingleValue(this.testIds.allocationKey),
            )
            .first(),
        ).toContainText(missionProps.defaultAllocationKey);
      }
      await expect(
        this.modal
          .locator(
            this.selectors.reactSelectSingleValue(
              this.testIds.idAccountingPeriod,
            ),
          )
          .first(),
      ).toContainText("Exercice du");
    }

    const createMissionPromise = waitForRestResponse(
      this.page,
      "/missions/general-assembly",
      "POST",
      120000,
    );
    await this.modal
      .getByRole("button", { name: this.labels.createMissionButton })
      .click();
    const createResponse = await createMissionPromise;
    const body = (await createResponse.json()) as {
      missionGeneralAssembly: { id: string };
    };

    this.missionId = body.missionGeneralAssembly.id;
    await expect(this.page.getByTestId(this.testIds.dialogContent)).toHaveCount(
      0,
      {
        timeout: TEST_CONFIG.timeouts.medium,
      },
    );
    expect(this.page.url()).toContain(initialUrl.split("?")[0]);
  }

  async visitMissionPage(missionId?: string): Promise<void> {
    const id = missionId ?? this.missionId;
    const origin = new URL(this.page.url()).origin;
    const resolutionsPromise = waitForRestResponse(
      this.page,
      /\/resolution\?.*isMissionRepair=false/,
      "GET",
      120000,
    );

    await this.page.goto(`${origin}/mission/assemblee-generale/${id}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      this.page.getByTestId(this.testIds.layoutSidenavLeft),
    ).toBeVisible({ timeout: TEST_CONFIG.timeouts.long });

    const resolutionsResponse = await resolutionsPromise;
    this.resolutionsSnapshot =
      (await resolutionsResponse.json()) as AgResolutionsResponse;
  }
}

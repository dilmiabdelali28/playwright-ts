import { getOktaAccessTokenWithRetry } from "@helpers/auth/bo-auth";
import {
  loadEnvironmentConfig,
  resolveFixturesRoot,
} from "@helpers/auth/environment-fixtures";
import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Page } from "@playwright/test";

import { Payload } from "../factory";
import type {
  AgoMissionBuildingFixtureResponse,
  BuildingIdentifiableFixtureResponse,
  CoOwnershipBuildingFixtureResponse,
  ExpenseRegularizationFixtureResponse,
  MaintenanceLogBuildingFixtureResponse,
  RentalManagementFixtureResponse,
  RentalManagementForRegularizationFixtureResponse,
} from "./fixture-context.types";

export class FixtureService {
  async createFixture<TResponse = Record<string, unknown>>(
    page: Page,
    params: Record<string, unknown>,
    appDomain: "ADB" | "BO" = "ADB",
  ): Promise<TResponse> {
    const token = await getOktaAccessTokenWithRetry(page);

    if (!token) {
      throw new Error("Unable to resolve access token for fixture creation");
    }

    const config = loadEnvironmentConfig(
      resolveFixturesRoot(TEST_CONFIG.fixturesDir),
    );
    const apiBaseUrl =
      appDomain === "ADB"
        ? config.env?.ADB?.API_BASE_URL
        : config.env?.BO?.API_BASE_URL;

    if (!apiBaseUrl) {
      throw new Error(`Missing API_BASE_URL for ${appDomain}`);
    }

    const response = await page.request.post(`${apiBaseUrl}/fixture`, {
      headers: { authorization: `Bearer ${token}` },
      data: params,
    });

    expect(response.status(), "Fixture creation must return HTTP 200").toBe(
      200,
    );

    return (await response.json()) as TResponse;
  }

  async createBaseBuilding(
    page: Page,
  ): Promise<RentalManagementFixtureResponse> {
    return this.createFixture<RentalManagementFixtureResponse>(
      page,
      Payload.rentalManagementContext({}),
    );
  }

  async createCoOwnershipBuilding(
    page: Page,
    mandateStatuses: string[],
  ): Promise<CoOwnershipBuildingFixtureResponse> {
    const dataTable = {
      hashes: () => mandateStatuses.map((mandateStatus) => ({ mandateStatus })),
    };

    return this.createFixture<CoOwnershipBuildingFixtureResponse>(
      page,
      Payload.coOwnerShipBuildingContext(mandateStatuses.length, dataTable),
    );
  }

  /**
   * Co-ownership building rich enough for the maintenance log:
   * allocation keys + budgets (voted works) + contracts (toggles).
   */
  async createMaintenanceLogBuilding(
    page: Page,
  ): Promise<MaintenanceLogBuildingFixtureResponse> {
    return this.createFixture<MaintenanceLogBuildingFixtureResponse>(
      page,
      Payload.maintenanceLogBuildingContext(),
    );
  }

  /** Rental management context with an existing expense regularization (extern trustee). */
  async createExpenseRegularizationContext(
    page: Page,
    options?: { institutional?: boolean },
  ): Promise<ExpenseRegularizationFixtureResponse> {
    return this.createFixture<ExpenseRegularizationFixtureResponse>(
      page,
      Payload.contextToEntryExpenses({
        accountInstitutional: options?.institutional ?? false,
      }),
      "BO",
    );
  }

  /** Rental management context ready to create an expense regularization (extern trustee). */
  async createRentalManagementContextForRegularization(
    page: Page,
    options?: { withAccountingPeriod?: boolean },
  ): Promise<RentalManagementForRegularizationFixtureResponse> {
    return this.createFixture<RentalManagementForRegularizationFixtureResponse>(
      page,
      Payload.contextToCreateExpenseRegularizationExternTrustee({
        withAccountingPeriod: options?.withAccountingPeriod ?? false,
      }),
      "BO",
    );
  }

  async createAgoMissionBuilding(
    page: Page,
    buildingName: string,
  ): Promise<AgoMissionBuildingFixtureResponse> {
    return this.createFixture<AgoMissionBuildingFixtureResponse>(
      page,
      Payload.missionAGOrdinaryContext(buildingName),
    );
  }
}

/** Unit id from rental management fixture — units[0]._id. */
export function getUnitId(
  rentalManagementFixture: RentalManagementFixtureResponse,
): string {
  const unitId = rentalManagementFixture.units[0]?._id ?? "";

  if (!unitId) {
    throw new Error("Unable to get unit id from rental management fixture");
  }

  return unitId;
}

/** Building id from fixture — units[0].building (rental) or buildings[0]._id (co-ownership). */
export function getBuildingId(
  fixture: BuildingIdentifiableFixtureResponse,
): string {
  const buildingId =
    fixture.units?.[0]?.building ?? fixture.buildings?.[0]?._id ?? "";

  if (!buildingId) {
    throw new Error("Unable to get building id from fixture");
  }

  return buildingId;
}

export function getBuildingName(
  agoMissionFixture: AgoMissionBuildingFixtureResponse,
): string {
  const buildingName = agoMissionFixture.buildings[0]?.buildingName ?? "";

  if (!buildingName) {
    throw new Error("Unable to get building name from AGO mission fixture");
  }

  return buildingName;
}

export function getBuildingAddress(
  agoMissionFixture: AgoMissionBuildingFixtureResponse,
): {
  address1: string;
  buildingName: string;
  city: string;
  zipCode: string;
} {
  const building = agoMissionFixture.buildings[0];
  const address = building?.address;

  if (!building || !address?.address1 || !address.city || !address.zipCode) {
    throw new Error("Unable to get building address from AGO mission fixture");
  }

  return {
    address1: address.address1,
    buildingName: building.buildingName ?? address.buildingName ?? "",
    city: address.city,
    zipCode: address.zipCode,
  };
}

export function getCoOwnerIdByName(
  agoMissionFixture: AgoMissionBuildingFixtureResponse,
  coOwnerName: string,
): string {
  const coOwnerId = agoMissionFixture.coOwnerAccounts.find(
    (account) => account.fullname === coOwnerName,
  )?._id;

  if (!coOwnerId) {
    throw new Error(
      `Unable to get co-owner id for "${coOwnerName}" from AGO mission fixture`,
    );
  }

  return coOwnerId;
}

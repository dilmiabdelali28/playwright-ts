import regularizationPeriods from "../../../datasets/lease-accounting/regularizationPeriods.json";
import { ApiObject } from "../../ApiObject";
import type { Building } from "../building";

export class RegularizationPeriod extends ApiObject {
  constructor(payload: any) {
    super(
      payload,
      "full-property-management/regularization-periods",
      "LEASE-ACCOUNTING",
    );
  }

  static newPeriod2023 = () =>
    new RegularizationPeriod(regularizationPeriods.period2023);

  static newPeriod2022 = () =>
    new RegularizationPeriod(regularizationPeriods.period2022);

  withBuilding = (building: Building) => {
    return this.with({
      buildingId: building.payload._id,
    });
  };

  withAgency = (agency: string) => {
    return this.with({
      agencyId: agency,
    });
  };

  async create(
    accessToken: string,
    fixtureEnv: any,
  ): Promise<RegularizationPeriod> {
    return new RegularizationPeriod(
      await super.create(accessToken, fixtureEnv),
    );
  }
}

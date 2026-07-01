import readings from "../../../datasets/real-estate/readings.json";
import { ApiObject } from "../../ApiObject";
import type { Building } from "../building";

export class Reading extends ApiObject {
  constructor(payload: any) {
    super(payload, "readings", "REAL-ESTATE");
  }

  static newColdWater = () => new Reading(readings.coldWater);

  withTitle = (title: string) => {
    return this.with({
      title,
    });
  };

  withPublishingDate = (publishingDate: Date) => {
    return this.with({
      publishingDate,
    });
  };

  withBuilding = (building: Building) => {
    return this.with({ buildingId: building.payload._id });
  };

  async create(accessToken: string, fixtureEnv: any): Promise<Reading> {
    return new Reading(await super.create(accessToken, fixtureEnv));
  }
}

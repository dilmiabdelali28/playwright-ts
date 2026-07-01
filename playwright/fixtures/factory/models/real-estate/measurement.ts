import measurements from "../../../datasets/real-estate/measurements.json";
import { ApiObject } from "../../ApiObject";
import type { Meter } from "./meter";
import type { Reading } from "./reading";

export class Measurement extends ApiObject {
  constructor(payload: any) {
    super(payload, "measurements", "REAL-ESTATE");
  }

  static newDefault = () => new Measurement(measurements.default);

  withValue = (value: number) => {
    return this.with({
      value,
    });
  };

  withEntryDate = (entryDate: Date) => {
    return this.with({
      entryDate,
    });
  };

  withMeter = (meter: Meter) => {
    return this.with({ meterId: meter.payload.id });
  };

  withReading = (reading: Reading) => {
    return this.with({ readingId: reading.payload.id });
  };

  async create(accessToken: string, fixtureEnv: any): Promise<Measurement> {
    return new Measurement(await super.create(accessToken, fixtureEnv));
  }
}

import meters from "../../../datasets/real-estate/meters.json";
import { ApiObject } from "../../ApiObject";
import type { Unit } from "../unit";

export class Meter extends ApiObject {
  constructor(payload: any) {
    super(payload, "meters", "REAL-ESTATE");
  }

  static newColdWater = () => new Meter(meters.coldWater);

  static newHotWater = () => new Meter(meters.hotWater);

  static newGas = () => new Meter(meters.gas);

  static newDispatcher = () => new Meter(meters.dispatcher);

  static newMiscellaneous = () => new Meter(meters.miscellaneous);

  withNumber = (number: string) => {
    return this.with({
      number,
    });
  };

  withUnit = (unit: Unit) => {
    return this.with({ unitId: unit.payload._id });
  };

  async create(accessToken: string, fixtureEnv: any): Promise<Meter> {
    return new Meter(await super.create(accessToken, fixtureEnv));
  }
}

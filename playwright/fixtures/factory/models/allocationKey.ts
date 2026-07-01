import { BaseObject } from "../baseObject";
import type { Building } from "./building";
import type { Reading } from "./real-estate/reading";
import type { Unit } from "./unit";

type Kind = "ALLOCATION_RATE" | "INDEX" | "PACKAGE" | "METER_READING";

export class AllocationKey extends BaseObject {
  static anAllocationKey = () => new AllocationKey(defaultPayload).withNewId();

  withKind = (kind: Kind) => this.with({ kind });

  withNumber = (number: string) => this.with({ number });

  withGenericTitle = (genericTitle: string) => this.with({ genericTitle });

  withSpecificTitle = (specificTitle: string) => this.with({ specificTitle });

  withShareBase = (shareBase: number) => this.with({ shareBase });

  withStartReading = (reading: Reading) =>
    this.with({ startReadingId: reading.payload.id });

  withEndReading = (reading: Reading) =>
    this.with({ endReadingId: reading.payload.id });

  withStartPeriodDate = (startPeriodDate: Date) =>
    this.with({ startPeriodDate });

  withBuilding = (building: Building) =>
    this.with({
      building: building.payload._id,
      //   physicalBuildings: building.physicalBuildings,
    });

  withIsMain = (isMain: boolean) => this.with({ isMain });

  addUnit(
    unit: Unit,
    { fractionalShares = 0 }: { fractionalShares?: number } = {},
  ) {
    this.payload.units.push({
      unit: unit.payload._id,
      fractionalShares,
    });

    return this;
  }
}

const defaultPayload = {
  number: "<TO FILL>",
  genericTitle: "<TO FILL>",
  specificTitle: "",
  kind: "ALLOCATION_RATE",
  building: "<TO FILL>",
  shareBase: 1000,
  isMain: false,
  units: [],
};

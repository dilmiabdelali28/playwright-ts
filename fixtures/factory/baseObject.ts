import ObjectID from "bson-objectid";
import _ from "lodash";

import type { Building } from "./models/building";

export class BaseObject {
  readonly payload: any;

  constructor(payload: any) {
    this.payload = _.cloneDeep(payload);
  }

  getId(): string {
    return this.payload._id;
  }

  withId(id: string) {
    if (ObjectID.isValid(id)) {
      this.payload._id = id;
    }

    return this;
  }

  withNewId() {
    this.payload._id = new ObjectID().toHexString();

    return this;
  }

  withCurrentCreatedAtAndUpdatedAtDates() {
    this.payload.createdAt = new Date();
    this.payload.updatedAt = new Date();

    return this;
  }

  with(values: any) {
    for (const keypath of Object.keys(values)) {
      _.set(this.payload, keypath, values[keypath]);
    }

    return this;
  }

  withBuilding = (building: Building) =>
    this.with({ building: building.payload._id });

  withOrigin(origin: { kind: string; target: string } | string) {
    this.payload.origin = origin;

    return this;
  }

  withIsBeingDevelopedBy(values: { kind: string; target: string }) {
    if (!Array.isArray(this.payload.isBeingDevelopedBy)) {
      this.payload.isBeingDevelopedBy = [];
    }

    this.payload.isBeingDevelopedBy.push(values);

    return this;
  }
}

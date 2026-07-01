import type { Lease } from "$fixtures/factory/models/lease";

import type { Agency } from "../agency";
import type { Associate } from "../associate";
import type { Customer } from "../customer";
import type { Unit } from "../unit";
import type { UnitsGroup } from "../unitsGroup";
import { MissionBase } from "./missionBase";

type StatusType = "OPEN" | "CLOSED" | "FINISHED";

export class MissionLeaseBack extends MissionBase {
  static aMissionLeaseBack = () =>
    new MissionLeaseBack(defaultPayload).withNewId();

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });

  withStatus = (status: StatusType) => this.with({ status });

  withAssociate = (associate: Associate) =>
    this.with({
      associate: associate.payload._id,
      createdBy: associate.payload._id,
    });

  withCustomer = (customer: Customer) =>
    this.with({ customer: customer.payload._id });

  addUnit = (unit: Unit) =>
    this.with({
      housing: {
        kind: "Unit",
        target: unit.payload._id,
        details: {
          completeAddress: unit.payload.entrance.address.completeAddress,
          address1: unit.payload.entrance.address.address1,
          zipCode: unit.payload.entrance.address.zipCode,
          unitNumber: unit.payload.unitNumber,
        },
      },
    });

  withLease = (lease: Lease) => this.with({ lease: lease.payload });

  withUnitsGroup = (unitsGroup: UnitsGroup) =>
    this.with({
      unitsGroup: unitsGroup.payload._id,
    });
}

const defaultPayload = {
  _id: "64a93a0832d5956608333aff",
  status: "OPEN",
  associatedTo: [],
  reports: [],
  startedAt: "2023-07-07T15:37:05.993Z",
  kind: "MissionLeaseBack",
  label: "Nouvelle gestion MARTIN DUPONT",
  notes: [],
  housing: {
    kind: "Unit",
    target: "64a939e619926c9408e2ed2c",
    details: {
      completeAddress: "1 Bvd pasteur 75015 Paris",
      address1: "1 Bvd pasteur",
      zipCode: "75015",
      unitNumber: "604273387",
    },
  },

  agency: "5e5dafe0b84f4c4645020c81",
  associate: "60e1551a87612a001a1fdc30",
  createdBy: "60e1551a87612a001a1fdc30",
  customer: "5e5db02ea87a1dd3367c26fc",
  documents: [],
  tasks: [],
  createdAt: "2023-07-08T10:27:20.621Z",
  updatedAt: "2023-07-08T10:27:20.764Z",
  __v: 0,
};

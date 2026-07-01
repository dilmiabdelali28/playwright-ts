import { BaseObject } from "../baseObject";
import type { Building } from "./building";
import type { CoOwnerAccount } from "./coOwnerAccount";
import { appartment2Payload } from "./unitsPayloads/appartment2Payload";
import { appartmentPayload } from "./unitsPayloads/appartmentPayload";
import {
  appartment1PayloadAGC,
  appartment2PayloadAGC,
} from "./unitsPayloads/appartmentPayloadForAGC";
import { housePayload } from "./unitsPayloads/housePayload";
import { parkingPayload } from "./unitsPayloads/parkingPayload";

export class Unit extends BaseObject {
  static anAppartment = () => new Unit(appartmentPayload).withNewId();

  static anAppartment2 = () => new Unit(appartment2Payload).withNewId();

  static aHouse = () => new Unit(housePayload).withNewId();

  static aParking = () => new Unit(parkingPayload).withNewId();

  static anAppartment1ForAGC = () =>
    new Unit(appartment1PayloadAGC).withNewId();

  static anAppartment2ForAGC = () =>
    new Unit(appartment2PayloadAGC).withNewId();

  // only use this method when passing the unit to a unitGroup factory
  // if you use this method while creating the unit, it will be invalid
  setIsMain = (isMain: boolean) =>
    this.with({
      description: {
        ...this.payload.description,
        isMainUnit: isMain,
      },
    });

  withCoOwnershipBylawsId = (coOwnershipBylawsId: string) =>
    this.with({
      coOwnershipBylawsId,
    });

  ofBuilding = (building: Building) =>
    this.with({
      entrance: {
        ...this.payload.entrance,
        ...(building.payload?.physicalBuildings?.[0]?.access?.entrances?.[0]
          ?.info ?? { address: building?.payload?.address }),
      },
      building: building.payload._id,
    });

  withCoOwnerAccount = (coOwnerAccount: CoOwnerAccount) =>
    this.with({
      coownershipManagement: {
        coOwner: coOwnerAccount.payload._id,
      },
    });

  withDelivery(delivered: boolean) {
    if (delivered === true) {
      this.with({
        delivery: {
          deliveredAt: new Date(),
          isDelivered: delivered,
          accountedDeliveredAt: new Date(),
        },
      });
    } else {
      this.with({
        delivery: {
          isDelivered: delivered,
        },
      });
    }

    return this;
  }
}

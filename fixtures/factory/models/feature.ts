import { BaseObject } from "../baseObject";

export class Feature extends BaseObject {
  static natixisPayment = () =>
    new Feature(defaultPayload).withNewId().with({
      feature: "NatixisPayment",
    });

  static missionLeaseBack = () =>
    new Feature(defaultPayload).withNewId().with({
      feature: "MissionLeaseBack",
    });

  static missionCurrentExpensesRecovery = () =>
    new Feature(defaultPayload).withNewId().with({
      feature: "ExternalGrowthMissions",
    });

  static missionAGConstitutive = () =>
    new Feature(defaultPayload).withNewId().with({
      feature: "MissionGeneralAssemblyConstitutive",
    });
}

const defaultPayload = {
  qualified: {
    _ids: ["*"],
    type: "*",
  },
  environments: ["docker", "dev1", "development", "lt", "qa"],
  feature: "<TO FILL name>",
};

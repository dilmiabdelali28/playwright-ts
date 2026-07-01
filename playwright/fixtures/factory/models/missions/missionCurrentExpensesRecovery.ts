import type { Amount } from "../../amount";
import type { Kind } from "../accounting/budget";
import { MissionBase } from "./missionBase";

export class MissionCurrentExpensesRecovery extends MissionBase {
  static aMissionCurrentExpensesRecovery = () =>
    new MissionCurrentExpensesRecovery(defaultPayload).withNewId();

  withProvisionMeters = (
    provisionMeters: {
      accountingPeriod: string;
      budgetKind: Kind;
      credit: Amount;
    }[],
  ) => this.with({ provisionMeters });
}

const defaultPayload = {
  _id: "<TO FILL>",
  kind: "MissionCurrentExpensesRecovery",
  label: "Missio Reprise CC",
  notes: [],
  tasks: [],
  agency: "<TO FILL>",
  status: "OPEN",
  housing: {
    kind: "Building",
    target: "<TO FILL>",
  },
  reports: [],
  associate: "<TO FILL>",
  documents: [],
  associatedTo: [],
  provisionMeters: [],
};

import { MissionBase } from "./missionBase";

export class MissionTrusteeContract extends MissionBase {
  static aMissionTrusteeContract = () =>
    new MissionTrusteeContract(defaultPayload).withNewId();

  withPropositions = (propositions: any[]) => this.with({ propositions });

  withCurrentAccountingPeriod = (currentAccountingPeriod: {
    _id: string;
    closingDate: Date;
  }) => this.with({ currentAccountingPeriod });
}

const defaultPayload = {
  _id: "<TO FILL>",
  kind: "MissionTrusteeContract",
  label: "Mission contract syndic",
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
  propositions: [],
  currentMandateEndDate: new Date(),
  currentMandateBaseAmount: {
    amountHT: {
      value: 339336,
      currency: "EUR",
    },
    rateVAT: 20,
    amountVAT: {
      value: 67867,
      currency: "EUR",
    },
    amountTTC: {
      value: 407203,
      currency: "EUR",
    },
  },
};

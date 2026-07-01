import { BaseObject } from "../../baseObject";
import type { Agency } from "../agency";
import type { Branch } from "../branch";

export type Status =
  | "ACTIVE"
  | "SUSPENDED"
  | "CLOSE"
  | "DRAFT"
  | "TEMPORARY"
  | "ACTIVE_SOON_EFFECTIVE"
  | "CONTRACT_TO_EDIT";

type LossOfContractReason =
  | "COURT_MANAGEMENT"
  | "SOLD_BY_FONCIA"
  | "TRUSTEE_RESIGNATION"
  | "REFUSAL_BUYBACK_FONCIA"
  | "QUALITY_MANAGEMENT_ACCOUNTING"
  | "QUALITY_MANAGEMENT_TRUSTEE"
  | "SET_FOR_FINANCIAL_COMPETITIVE_CALL"
  | "TRANSFERT_INTER_FONCIA"
  | "VOLONTARY_TRUSTEE"
  | "COURT_MANAGEMENT"
  | "PORTFOLIO_SALE"
  | "NEW_BUILDING_NAMEINATION_REFUSAL"
  | "UNIQUE_OWNER"
  | "SATISFIED_OR_MONEY_BACK"
  | "CUSTOMER_RELATIONSHIP_QUALITY"
  | "CHANGE_OF_ASSOCIATE"
  | "E_REPUTATION"
  | "TRUSTEE_PRO_ASSIMILATION";

export class CoOwnershipMandate extends BaseObject {
  static aCoOwnershipMandate = () =>
    new CoOwnershipMandate(defaultPayload).withNewId();

  static anAGCoOwnershipMandate = () =>
    new CoOwnershipMandate(payloadForAG).withNewId();

  withAgency = (agency: Agency) =>
    this.with({ currentAgency: agency.payload._id });

  withBranch = (branch: Branch) =>
    this.with({ currentBranch: branch.payload._id });

  withStatus = (status: Status) => this.with({ status });

  withLossOfContractReason = (lossOfContractReason: LossOfContractReason) =>
    this.with({
      "contractualConditions.lossOfContractReason": lossOfContractReason,
    });

  withLostContractDate = (lostContractDate: number) =>
    this.with({
      "contractualConditions.lostContractDate": lostContractDate,
    });

  withMainAssociate = (associate_id: string, associateId: string) =>
    this.with({
      "associates[0]._id": associate_id,
      "associates[0].associate": associateId,
      "associates[0].isMain": true,
    });

  withEndDate = (endDate: Date) =>
    this.with({
      "contractualConditions.contract.end": endDate,
    });

  withAccountantAssociate = (associate_id: string, associateId: string) =>
    this.with({
      "associates[1]._id": associate_id,
      "associates[1].associate": associateId,
      "associates[1].isMain": false,
    });
}

const defaultPayload = {
  _id: "<TO FILL>",
  status: "DRAFT",
  building: "<TO FILL>",
  associates: [
    {
      _id: "<TO FILL>",
      associate: "<TO FILL>",
      isMain: true,
    },
  ],
  currentAgency: "<TO FILL>",
  currentBranch: "<TO FILL>",
  isBuildingLost: false,
  trusteeLegalName: "22 RUE DE LA RIVIERE",
  contractualConditions: {
    vote: {
      subAccounts: {
        accountant: false,
        extraAccountant: false,
      },
      ceiling_21_1: {
        amount: {
          value: 0,
          currency: "EUR",
        },
      },
      ceiling_21_2: {
        amount: {
          value: 0,
          currency: "EUR",
        },
      },
      accountTypeActuel: "SEPARATE",
    },
    contract: {
      beginning: "2022-06-07T22:00:00Z",
      generalAssemblyMeetingDate: "2022-06-07T22:00:00Z",
    },
    vatTracking: false,
    multiTrustees: {
      isMainTrustee: false,
      isSecondaryUnion: false,
      secondaryTrusteesMandates: [],
    },
    alertCondition: {
      isUnsanitary: false,
      estArretePeril: false,
      isRequiredRepair: false,
    },
    managementType: "SDC",
    firstContractDate: "2022-06-07T22:00:00Z",
    generalAssemblies: {
      contractNumberOfGeneralAssemblies: 1,
    },
    wonContractReason: "REAL_ESTATE_CABINET_ACQUISITION_INTEGRATION",
    trusteeCouncilMembers: [],
    managementTypeInformation: {
      unionType: "SDC",
      statusUpdates: [],
      secondaryUnions: [],
    },
  },
  lastClosingExerciseDate: "2021-12-30T23:00:00Z",
};

const payloadForAG = {
  _id: "<TO FILL>",
  status: "ACTIVE",
  currentAgency: "<TO FILL>",
  currentBranch: "<TO FILL>",
  trusteeLegalName: "Immeuble test AGO",
  contractualConditions: {
    wonContractReason: "CABINET_NEW_LOTS_PROSPECTION",
    managementType: "SDC",
    vatTracking: false,
    vote: {
      accountTypeActuel: "SEPARATE",
    },
    trusteeCouncilMembers: [],
  },
  building: "<TO FILL>",
  associates: [
    {
      _id: "<TO FILL>",
      associate: "<TO FILL>",
      isMain: true,
    },
  ],
  createdAt: "2023-12-14T13:23:33.989+0000",
  updatedAt: "2023-12-14T13:29:26.532+0000",
  __v: 0,
};

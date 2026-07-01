import ObjectID from "bson-objectid";

import type { Agency } from "../agency";
import type { Associate } from "../associate";
import type { Building } from "../building";
import type { LessorAccount } from "../lessorAccount";
import type { MandateDocument } from "../mandateDocument";
import type { RentalManagementMandate } from "../mandates/rentalManagementMandate";
import type { Unit } from "../unit";
import type { UnitsGroup } from "../unitsGroup";
import { MissionBase } from "./missionBase";

type StatusType = "OPEN" | "CLOSED" | "FINISHED";

export class MissionNewMandate extends MissionBase {
  static aMissionNewMandate = () =>
    new MissionNewMandate(defaultPayload).withNewId();

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });

  withBuilding = (building: Building) =>
    this.with({ building: building.payload._id });

  withStatus = (status: StatusType) => this.with({ status });

  withAssociate = (associate: Associate) =>
    this.with({
      associate: associate.payload._id,
      createdBy: associate.payload._id,
    });

  withLessorAccount = (lessorAccount: LessorAccount, associate: Associate) => {
    return this.with({
      lessorAccount: {
        lessors: [
          {
            paymentType: lessorAccount.payload.lessors?.[0]?.paymentType,
            _id: new ObjectID().toHexString(),
            customer: lessorAccount.payload.lessors?.[0]?.customer,
          },
        ],
        branch: lessorAccount.payload.branch,
        fullname: lessorAccount.payload.fullname,
        rentalManagerAssociate: associate.payload._id,
        lessorAccountId: lessorAccount.payload._id,
      },
    });
  };

  withRentalManagementMandate = (
    rentalManagementMandate: RentalManagementMandate,
  ) =>
    this.with({ rentalManagementMandate: rentalManagementMandate.payload._id });

  addUnit = (unit: Unit) => {
    this.payload.units.push({
      _id: new ObjectID().toHexString(),
      unit: unit.payload._id,
    });

    return this;
  };

  addMandateDocument = (mandateDocument: MandateDocument) => {
    this.payload.documents.push(mandateDocument);

    return this;
  };

  withUnitsGroup = (unitsGroup: UnitsGroup, isOccupied = true) => {
    const groupId = unitsGroup.payload._id;

    this.payload.rentData[0].groupId = groupId;
    this.payload.landlordFees[0].groupId = groupId;
    this.payload.diagnostics[0].groupId = groupId;

    return this.with({
      unitGroups: [
        {
          isOccupied,
          _id: groupId,
          units: unitsGroup.payload.units.map((unit: any) => ({
            isMain: unit.isMain,
            unit: unit._id,
          })),
        },
      ],
    });
  };

  withExcludedManagement = () => {
    return this.with({
      mandateType: "excludedManagementMandate",
    });
  };
}

const defaultPayload = {
  _id: "64a939e432d595cf64333ac9",
  managementFees: {
    managementRate: 8,
    administrativeFlatRate: {
      value: 400,
      currency: "EUR",
    },
  },
  mandate: {
    taxation: { vat: { frequencyDeclaration: "NO_FREQUENCY" } },
    leaseBroker: null,
    mandateSurveyOrigin: "CLIENT_REQUEST",
    mandateSurveyOriginCategory: "OLD_GAIN",
    fees: null,
    feesWithVAT: null,
    occasionalServices: [],
  },
  status: "FINISHED",
  associatedTo: [],
  reports: [],
  startedAt: "2023-07-07T15:37:05.993Z",
  kind: "MissionNewMandate",
  label: "AUTOMATION - MISSION - RENTREE MANDAT by API - 1688811996452",
  description: "Création d'une Mission RENTREE MANDAT",
  notes: [],
  agency: "5e5dafe0b84f4c4645020c81",
  lessorAccount: {
    lessors: [
      {
        paymentType: "SELF_PRINTED_CHECK",
        _id: "64a939e574d05e0cf66a0587",
        customer: "5e5db02ea87a1dd3367c26fc",
      },
    ],
    branch: "5e5dafde0de8b924a9fe1338",
    fullname: "MARTIN DUPONT",
    rentalManagerAssociate: "60e1551a87612a001a1fdc30",
    lessorAccountId: "64a93a0832d595c5a4333aed",
  },
  housing: { target: null },
  associate: "60e1551a87612a001a1fdc30",
  createdBy: "60e1551a87612a001a1fdc30",
  visits: [],
  units: [],
  unitGroups: [
    {
      isOccupied: true,
      _id: "64a939e632d595cbd8333ad0",
      units: [{ unit: "64a939e619926c9408e2ed2c", isMain: true }],
    },
  ],
  rentData: [
    {
      groupId: "64a939e632d595cbd8333ad0",
      variables: [
        {
          active: true,
          visible: true,
          entranceProrate: true,
          leaveProrate: true,
          renewal: true,
          numberOfCalls: 0,
          rentType: true,
          provisionType: false,
          depositType: false,
          feeType: false,
          revisable: true,
          subjectToVAT: false,
          visibleOLR: true,
          subjectedToFees: true,
          subjectedToFeesRGIGO: true,
          submittedRGI: true,
          addedManually: false,
          priority: 0,
          _id: "64a939e7ae9d750dae10addb",
          lastCallDate: null,
          effectStartDate: null,
          endEffectDate: null,
          variableNumber: "1010",
          variableLabel: "LOYER PRINCIPAL",
          renewalsNumber: 0,
          vatRate: 0,
          type: "RENT",
          accountingClass: "4500",
          revisionVariableNumber: "7010",
          subAccount: "000000000",
          amount: {
            amountHT: { value: 0, currency: "EUR" },
            rateVAT: 0,
            amountVAT: { value: 0, currency: "EUR" },
            amountTTC: { value: 0, currency: "EUR" },
          },
          thirdPartyAccountingAccount: {
            accountingClass: "4500",
            subAccount: "000000000",
          },
          productAccountingAccount: {
            accountingClass: "7000",
            subAccount: "000000000",
          },
          accountingManagementKinds: ["RENTAL_MANAGEMENT"],
          taxRateConfiguration: {
            taxType: "VAT",
            rateType: "VAT_STANDARD",
          },
        },
        {
          active: true,
          visible: true,
          entranceProrate: true,
          leaveProrate: true,
          renewal: true,
          numberOfCalls: 0,
          rentType: false,
          provisionType: true,
          depositType: false,
          feeType: false,
          revisable: false,
          subjectToVAT: false,
          visibleOLR: true,
          subjectedToFees: true,
          subjectedToFeesRGIGO: true,
          submittedRGI: true,
          addedManually: false,
          priority: 0,
          _id: "64a939e7ae9d7529f410addc",
          lastCallDate: null,
          effectStartDate: null,
          endEffectDate: null,
          variableNumber: "6000",
          variableLabel: "PROVISION CHARGES",
          renewalsNumber: 3,
          vatRate: 0,
          type: "PROVISION",
          accountingClass: "4500",
          subAccount: "000000000",
          amount: {
            amountHT: { value: 0, currency: "EUR" },
            rateVAT: 0,
            amountVAT: { value: 0, currency: "EUR" },
            amountTTC: { value: 0, currency: "EUR" },
          },
          thirdPartyAccountingAccount: {
            accountingClass: "4500",
            subAccount: "000000000",
          },
          productAccountingAccount: {
            accountingClass: "7000",
            subAccount: "000000000",
          },
          accountingManagementKinds: ["RENTAL_MANAGEMENT"],
          taxRateConfiguration: {
            taxType: "VAT",
            rateType: "VAT_STANDARD",
          },
        },
      ],
    },
  ],
  landlordFees: [{ groupId: "64a939e632d595cbd8333ad0" }],
  diagnostics: [
    {
      listSet: [],
      groupId: "64a939e632d595cbd8333ad0",
      value: 0,
    },
  ],
  documents: [
    {
      originalFilename:
        "Document_information_precontractuel_08-07-2023_12_26_47.pdf",
      category: "newMandateDocuments",
      hashFile: "64a939e969f73f18a0c4c559",
      mimeType: "application/pdf",
      subCategory: "precontractual",
      msDocumentId: "64a939e86310fc7d4f0192a5",
      updatedAt: "2023-07-08T10:26:49.608Z",
      createdAt: "2023-07-08T10:26:48.959Z",
      signatures: { isSigned: true, isImported: true },
    },
    {
      originalFilename: "Faculte renonciation PNO_08-07-2023_12_26_47.pdf",
      category: "newMandateDocuments",
      hashFile: "64a939e869f73f18a0c4c551",
      mimeType: "application/pdf",
      subCategory: "waiver",
      msDocumentId: "64a939e86310fc7d4f0192a9",
      updatedAt: "2023-07-08T10:26:48.959Z",
      createdAt: "2023-07-08T10:26:48.959Z",
    },
    {
      originalFilename: "Assurance sérénité PNO_08-07-2023_12_26_47.pdf",
      category: "newMandateDocuments",
      hashFile: "64a939e869f73f18a0c4c553",
      mimeType: "application/pdf",
      subCategory: "insurance",
      msDocumentId: "64a939e86310fc7d4f0192ab",
      updatedAt: "2023-07-08T10:26:48.959Z",
      createdAt: "2023-07-08T10:26:48.959Z",
    },
    {
      originalFilename:
        "Charte de protection des données_08-07-2023_12_26_47.pdf",
      category: "newMandateDocuments",
      hashFile: "64a939e869f73f18a0c4c555",
      mimeType: "application/pdf",
      subCategory: "appendix",
      msDocumentId: "64a939e86310fc7d4f0192ad",
      updatedAt: "2023-07-08T10:26:48.959Z",
      createdAt: "2023-07-08T10:26:48.959Z",
    },
    {
      originalFilename: "Mandat_Classique_08-07-2023_12_26_47.pdf",
      category: "newMandateDocuments",
      hashFile: "64a93a0869f73f18a0c4c56e",
      mimeType: "application/pdf",
      subCategory: "mandate",
      msDocumentId: "64a939e86310fc7d4f0192a7",
      updatedAt: "2023-07-08T10:27:20.274Z",
      createdAt: "2023-07-08T10:26:48.959Z",
      signatures: { isSigned: true, isImported: true },
    },
  ],
  tasks: [],
  createdAt: "2023-07-08T10:26:44.201Z",
  updatedAt: "2023-07-08T10:27:21.178Z",
  __v: 2,
  building: "64a939e519926c9408e2ed27",
  email: true,
  mandateType: "classic",
  missionVersion: 2,
  rentalManagementMandate: "64a93a0832d59571d6333b45",
};

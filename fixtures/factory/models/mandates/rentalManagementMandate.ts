import ObjectID from "bson-objectid";

import { BaseObject } from "../../baseObject";
import type { LessorAccount } from "../lessorAccount";
import type { Unit } from "../unit";

export class RentalManagementMandate extends BaseObject {
  static aRentalManagementMandate = () =>
    new RentalManagementMandate(defaultPayload).withNewId();

  withLessorAccount = (lessorAccount: LessorAccount) => {
    return this.with({
      lessor: lessorAccount.payload._id,
    });
  };

  addAssociate = (associate: { associate: string; isMain: boolean }) => {
    this.payload.associates.push(associate);

    return this;
  };

  withAgency = (agency: string) => {
    return this.with({
      currentAgency: agency,
    });
  };

  withBranch = (branch: string) => {
    return this.with({
      currentBranch: branch,
    });
  };

  setIsExcludedManagement = () => {
    return this.with({
      openMandate: false,
      endMandateDate: new Date(),
      finalClosingDate: new Date(),
    });
  };

  addUnit = ({
    unit,
    lessorAccount,
  }: {
    unit: Unit;
    lessorAccount: LessorAccount;
  }) => {
    this.payload.units.push({
      unit: unit.payload._id,
      building: unit.payload.building,
      rentalManagement: {
        _id: new ObjectID().toHexString(),
        acquisitionDate: "2023-05-01T00:00:00.000Z",
        coverages: {
          _id: new ObjectID().toHexString(),
          occupancyGuaranteeInsurance: {
            submitted: false,
          },
          rentGuaranteeInsurance: {
            isContractSubscript: false,
          },
        },
        fees: {
          _id: new ObjectID().toHexString(),
          fixedFees: {
            admnistrative: {
              value: 0,
              currency: "EUR",
            },
            propertyIncomeFilling: {
              value: 13750,
              currency: "EUR",
            },
            declarationVAT: {
              value: 0,
              currency: "EUR",
            },
          },
          managementFees: {
            rateOnIncome: 4.5,
            billingMethod: "RATE",
          },
        },
        manager: "61df4a689dcfef1ae937c5f7",
        leaseBroker: "61df4a689dcfef1ae937c5f7",
        lessor: lessorAccount.payload._id,
        management: {
          startDate: "2023-05-01T00:00:00.000Z",
        },
        managementStartDate: "2023-05-01T00:00:00.000Z",
        managementType: "FONCIA_PROPERTY_MANAGEMENT",
        taxIncentiveLaws: [],
      },
    });

    return this;
  };
}

const defaultPayload = {
  currentAgency: "5e5dafe018bb1b1dce020cb6",
  currentBranch: "5e5dafde101332be2afe132d",
  isManagedByFoncia: true,
  contractRegisterNumber: 1839,
  openMandate: true,
  mandateStartDate: "2009-08-03T22:00:00.000Z",
  endMandateDate: "2039-08-02T22:00:00.000Z",
  lessor: "5e5db02ce3356b7cd3798824",
  units: [
    {
      building: "5e5db02d75998d35ed7b0955",
      unit: "5e5db0334c7ab631ed868983",
      rentalManagement: {
        _id: "647621fafbc43d3a0f6697f3",
        acquisitionDate: "2023-05-01T00:00:00.000Z",
        coverages: {
          _id: "647621fafbc43d26586697f4",
          occupancyGuaranteeInsurance: {
            submitted: false,
          },
          rentGuaranteeInsurance: {
            isContractSubscript: false,
          },
        },
        fees: {
          _id: "647621fafbc43d15b16697f5",
          fixedFees: {
            admnistrative: {
              value: 0,
              currency: "EUR",
            },
            propertyIncomeFilling: {
              value: 13750,
              currency: "EUR",
            },
            declarationVAT: {
              value: 0,
              currency: "EUR",
            },
          },
          managementFees: {
            rateOnIncome: 4.5,
            billingMethod: "RATE",
          },
        },
        manager: "61df4a689dcfef1ae937c5f7",
        leaseBroker: "61df4a689dcfef1ae937c5f7",
        lessor: "647621234e46c0763100c77e",
        management: {
          startDate: "2023-05-01T00:00:00.000Z",
        },
        managementStartDate: "2023-05-01T00:00:00.000Z",
        managementType: "FONCIA_PROPERTY_MANAGEMENT",
        taxIncentiveLaws: [],
      },
    },
  ],
  associates: [
    {
      _id: "641b33b503850797575c0d7c",
      associate: "60e1551d8778c60019117271",
      isMain: true,
    },
  ],
  mandateDuration: "MANAGEMENT_3YEARS",
  renewal: {
    renewableMandate: true,
    agreementTacit: true,
    nextRenewalDate: "2010-08-03T22:00:00.000Z",
    renewalFrequency: "ANNUAL",
    notice: {
      numberOfMonthsNoticeLeaseBreaking: 3,
    },
  },
};

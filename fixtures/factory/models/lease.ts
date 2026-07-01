import ObjectID from "bson-objectid";

import { BaseObject } from "../baseObject";
import type { Customer } from "./customer";
import type { LessorAccount } from "./lessorAccount";
import type { UnitsGroup } from "./unitsGroup";

export class Lease extends BaseObject {
  static aLease = () => new Lease(defaultPayload).withNewId();

  withUnitsGroup = (unitsGroup: UnitsGroup) => {
    return this.with({
      unitsGroup: unitsGroup.payload._id,
      units: unitsGroup.payload.units,
      building: unitsGroup.payload.building,
      leaseNumber: unitsGroup.payload.unitsGroupNumber,
    });
  };

  withLessorAccount = (lessorAccount: LessorAccount) => {
    return this.with({
      lessor: lessorAccount.payload._id,
    });
  };

  withStatus = (status: string) => {
    return this.with({
      status,
    });
  };

  withTenant = (tenant: Customer) => {
    return this.with({
      tenants: [
        {
          isMain: true,
          _id: new ObjectID().toHexString(),
          customer: tenant.payload._id,
        },
      ],
    });
  };
}

const defaultPayload = {
  rentIssuance: {
    parameters: {
      alur: {
        moveOutInspectionFeeCeiling: {
          value: 300,
          currency: "EUR",
        },
      },
      automatic: true,
      term: "DEPOSIT",
      hasEditionNotice: false,
      frequency: "MONTHLY",
      paymentType: "CHECK",
      hasEditionReceipt: false,
      subjectToVAT: false,
      subjectToCRL: false,
      threeTimesWithoutFeesTenantFees: false,
      threeTimesWithoutFeesSecurityDeposit: false,
      directDebitDay: 5,
      tenseAreasDecree: {},
      lesseeFeesCallDate: "2022-09-01T13:25:50.796Z",
      lastRentBillingDate: "2023-04-30T22:00:00.000Z",
      lastValidationDateCall: "2023-04-26T17:05:46.343Z",
      nextDueDate: "2023-05-31T22:00:00.000Z",
      lastRentAmount: {
        value: 12500,
        currency: "EUR",
      },
      lastRentPaymentDate: "2023-04-06T01:03:17.742Z",
    },
    rentalFees: {
      feesTenantAmount: {
        location: {
          amountHT: {
            value: 9583,
            currency: "EUR",
          },
          rateVAT: 20,
          amountVAT: {
            value: 1917,
            currency: "EUR",
          },
          amountTTC: {
            value: 11500,
            currency: "EUR",
          },
        },
        setForRental: {
          amountHT: {
            value: 0,
            currency: "EUR",
          },
          rateVAT: 20,
          amountVAT: {
            value: 0,
            currency: "EUR",
          },
          amountTTC: {
            value: 0,
            currency: "EUR",
          },
        },
        rentalInspectionReportCost: {
          amountHT: {
            value: 0,
            currency: "EUR",
          },
          rateVAT: 20,
          amountVAT: {
            value: 0,
            currency: "EUR",
          },
          amountTTC: {
            value: 0,
            currency: "EUR",
          },
        },
        retrocession: {
          amountHT: {
            value: 0,
            currency: "EUR",
          },
          rateVAT: 0,
          amountVAT: {
            value: 0,
            currency: "EUR",
          },
          amountTTC: {
            value: 0,
            currency: "EUR",
          },
        },
      },
      feesOwnerAmount: {
        location: {
          amountHT: {
            value: 9583,
            currency: "EUR",
          },
          rateVAT: 20,
          amountVAT: {
            value: 1917,
            currency: "EUR",
          },
          amountTTC: {
            value: 11500,
            currency: "EUR",
          },
        },
        setForRental: {
          amountHT: {
            value: 0,
            currency: "EUR",
          },
          rateVAT: 20,
          amountVAT: {
            value: 0,
            currency: "EUR",
          },
          amountTTC: {
            value: 0,
            currency: "EUR",
          },
        },
        rentalInspectionReportCost: {
          amountHT: {
            value: 0,
            currency: "EUR",
          },
          rateVAT: 20,
          amountVAT: {
            value: 0,
            currency: "EUR",
          },
          amountTTC: {
            value: 0,
            currency: "EUR",
          },
        },
        retrocession: {
          amountHT: {
            value: 0,
            currency: "EUR",
          },
          rateVAT: 0,
          amountVAT: {
            value: 0,
            currency: "EUR",
          },
          amountTTC: {
            value: 0,
            currency: "EUR",
          },
        },
      },
    },
    initialVariables: [],
    rentBilledAmount: [],
    amountRentBilledHistory: [],
  },
  renewal: {
    nextRenewalDate: "2023-06-01T22:00:00.000Z",
    numberOfMonthsNotice: 3,
    tacit: true,
  },
  status: "ACTIVE",
  visible: true,
  visibleOLR: true,
  leaseTypeCode: "01",
  leaseTypeUsage: "HABI",
  applicableLaw: [],
  isFurnished: false,
  isMixed: false,
  monthsDuration: 12,
  contractualDuration: 36,
  numberOfMonthsRentDeposit: 1,
  rentReview: {
    splitting: false,
    automatic: true,
    numberOfMonthsNotice: 1,
    frequency: "ANNUAL",
    reference: {
      mode: "INDEX",
      code: "ICC_INDEX",
      firstRevisionDate: "2023-06-01T22:00:00.000Z",
      month: 1,
      year: 2021,
      valeur: 182200,
    },
    inProcess: {
      mode: "INDEX",
      code: "ICC_INDEX",
      toValidate: false,
      month: 1,
      year: 2021,
      valeur: 182200,
    },
    next: {
      month: 1,
      year: 2022,
      nextRevisionDate: "2023-06-01T22:00:00.000Z",
    },
  },
  numbeOfMonthsNoticeLeave: 3,
  isTenantOccupied: true,
  sendeeHolder: true,
  repairsAmount: {
    value: 0,
    currency: "EUR",
  },
  optIn: false,
  unitsGroup: "61a8ced8c18a4211f85b9587",
  manager: "60e1551d8778c60019117271",
  leaseType: "BOXCODECIVIL",
  units: [
    {
      _id: "61a8ced8c18a42531b5b9588",
      isMain: true,
      unit: "5e5db0334c7ab631ed868983",
    },
  ],
  managementBranch: "5e5dafde101332be2afe132d",
  rentalBranch: "5e5dafdedf5c148a5dfe1480",
  lessor: "5e5db02ce3356b7cd3798824",
  building: "5e5db02d75998d35ed7b0955",
  entryDate: "2022-06-01T22:00:00.000Z",
  startDate: "2022-06-01T22:00:00.000Z",
  isManagedByFoncia: true,
  recovery: {
    customerTypeCode: "NORMAL_NO_COST",
    _id: "61a8da3ecda549ab21a20fc3",
    applyRecoveryFees: false,
  },
  rentAnnualHTInitial: {
    value: 447600,
    currency: "EUR",
  },
  documents: [],
  tenants: [
    {
      isMain: true,
      _id: "62b418d6a759280cb2b25624",
      customer: "62a23337850cb7001bd03455",
    },
  ],
  addresses: [],
  guarantor: [],
  clauses: [],
  expenseProvisionLastUpdate: "2021-12-02T14:37:50.041Z",
  createdAt: "2021-12-02T14:37:50.066Z",
  updatedAt: "2023-04-26T17:11:34.767Z",
  insurances: {
    multiriskUnit: {
      startDate: "2022-06-01T22:00:00.000Z",
      hasInsurance: false,
      insuranceType: "EXTERNAL",
    },
  },
  previousTenant: {},
  tenantLeaveManagement: {},
  tenantSettlement: {
    isRgiEligible: false,
    _id: "61dea7ba95bcab593462de2c",
    indexes: [],
    variablesMisc: [],
    variablesRepair: [],
    paymentType: "TRANSFER",
  },
  endDate: "2023-05-31T22:00:00.000Z",
  signatureType: "inPerson",
  virtualIban: {
    iban: "FR7616658000010000126970934",
    status: "AFFECTED",
    updatedAt: "2022-09-03T06:03:00.795Z",
  },
  onDemandBankInformation: "642d9191e2e56df9d494c454",
  payments: {
    automaticLettering: true,
    letteringMethod: "CHRONOLOGICAL_PRIORITY_PRORATED_SANS_LITIGATION",
    litigationLettering: false,
  },
};

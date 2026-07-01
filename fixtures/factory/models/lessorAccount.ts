import { BaseObject } from "../baseObject";
import type { Agency } from "./agency";
import type { BankInformation } from "./bankInformation";
import type { Branch } from "./branch";
import type { Customer } from "./customer";

export class LessorAccount extends BaseObject {
  static anAccount = ({ isInstitutional = false } = {}) =>
    new LessorAccount({
      ...defaultPayload,
      ...(isInstitutional
        ? {
            keyAccountCustomer: {
              kind: "INSTITUTIONAL",
              _id: "5e5db2c148ab0119afe681f6",
              name: "Compte de gestion",
            },
          }
        : {}),
    }).withNewId();

  addLessor({
    customer,
    bankInformation,
    share = 10000,
    paymentType = "TRANSFER",
  }: {
    customer: Customer;
    bankInformation: BankInformation;
    share?: number;
    paymentType?: string;
  }) {
    this.payload.lessors = [
      ...this.payload.lessors,
      {
        customer: customer.payload._id,
        share,
        paymentType,
        bankInformation: bankInformation.payload._id,
      },
    ];

    return this;
  }

  withBranch = (branch: Branch) => this.with({ branch: branch.payload._id });

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });
}

const defaultPayload = {
  accounting: {
    paymentType: "DUE_DATE_TRANSFER",
    managementType: "PROPERTY_MANAGEMENT_CLASSIC",
    isInstitutional: false,
    compteInvoicesToPay: true,
    tresorerieSpecifique: false,
    jointOwnership: false,
    startDateExercise: "2012-12-31T23:00:00.000Z",
    endDateExercise: "2013-12-30T23:00:00.000Z",
    typeOwner: "CLIENT",
    detailEcrituresFees: true,
  },
  bankAccountingAccount: "5e5db2c148ab0119afe681f6",
  branch: "5e5dafde101332be2afe132d",
  createdAt: "2020-03-03T01:23:51.905Z",
  defaultValues: {
    fees: {
      entryFees: {
        package: null,
        rate: null,
        type: null,
      },
      fixedFees: {
        admnistrative: null,
        propertyIncomeFilling: null,
        declarationVAT: null,
        smokeDetector: null,
        guarantedFixedRent: null,
        managementUnpaidRentGuarantee: null,
      },
      managementFees: {
        billingMethod: "RATE",
        inclusiveAmount: {
          value: 0,
          currency: "EUR",
        },
        rateOnIncome: 10,
        rateOnRentBill: 0,
      },
    },
    rentGuaranteeInsurance: {
      externalManagementFeeRate: 0,
      fonciaGlobalRate: 0,
      frequencyCalculation: "MONTHLY",
      isContractSubscript: false,
      rateForFeesOnIncomes: 0,
      rateForFeesOnRentBilling: 0,
    },
  },
  deposits: {
    amountLast: {
      value: 38500,
      currency: "EUR",
    },
    authorizedDebit: false,
    controle: true,
    dateLastDeposit: "2013-05-12T22:00:00.000Z",
    frequency: "NO_FREQUENCY",
    inclusiveAmount: {
      value: 0,
      currency: "EUR",
    },
    paymentDate: 10,
    rateDisponible: 0,
    onMonthOLR: false,
  },
  fullname: "nomComplet_200000367",
  isManagedByFoncia: true,
  lessorLegacyNumber: "4539",
  lessors: [],
  operatingLeaseReport: {
    authorizedDebit: false,
    _id: "5e7fa7752016307ba6e16f42",
    balanceLastOLR: {
      value: 12056,
      currency: "EUR",
    },
    dateInProcessOLR: "2023-05-31T22:00:00.000Z",
    dateLastCalculOLR: "2023-04-25T17:31:28.013Z",
    dateLastOLR: "2023-04-30T22:00:00.000Z",
    dateProchainOLR: "2023-06-30T22:00:00.000Z",
    frequency: "MONTHLY",
    previousBalance: {
      value: 0,
      currency: "EUR",
    },
  },
  propertyManagementFee: {
    accepted: false,
    authorizedDebit: false,
    reservedAmount: {
      value: 0,
      currency: "EUR",
    },
  },
  rentGuaranteeInsurance: {},
  taxation: {
    additionalTaxConservation: "OWNER",
    expenseProvisionConservation: "OWNER",
    leaseLawConservaton: "OWNER",
    revenueFoncier: {
      management: "NON",
    },
    vat: {
      frequencyDeclaration: "NO_FREQUENCY",
      typeAccountingEntry: "TTC",
      typeDeclaration: "AMOUNTS_PAID",
    },
  },
  updatedAt: "2023-04-25T17:31:28.036Z",
  documents: [],
  reservedAmount: {
    currency: "EUR",
    value: 0,
  },
  reservedComment: null,
  hasFapReserved: true,
  agency: "5e5dafe018bb1b1dce020cb6",
};

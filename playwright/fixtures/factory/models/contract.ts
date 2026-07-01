import type { Amount } from "../amount";
import { BaseObject } from "../baseObject";
import type { ExpenseType } from "./accounting/expensType";
import type { Agency } from "./agency";
import type { AllocationKey } from "./allocationKey";
import type { Supplier } from "./supplier";

const RenewalDurationUnits = {
  MONTHS: "MONTHS",
  YEARS: "YEARS",
} as const;

type RenewalDurationUnits =
  (typeof RenewalDurationUnits)[keyof typeof RenewalDurationUnits];

const BillingFrequency = {
  FORTNIGHTLY: "FORTNIGHTLY",
  MONTHLY: "MONTHLY",
  BIMONTHLY: "BIMONTHLY",
  QUARTERLY: "QUARTERLY",
  FOUR_MONTHLY: "FOUR_MONTHLY",
  HALF_YEARLY: "HALF_YEARLY",
  YEARLY: "YEARLY",
} as const;

type BillingFrequency =
  (typeof BillingFrequency)[keyof typeof BillingFrequency];

const BillingRecurrence = {
  DUE: "DUE",
  EXPIRE: "EXPIRE",
} as const;

type BillingRecurrence =
  (typeof BillingRecurrence)[keyof typeof BillingRecurrence];

export const PaymentMean = {
  TRANSFER: "TRANSFER",
  SELF_PRINTED_CHECK: "SELF_PRINTED_CHECK",
  DIRECT_DEBIT: "DIRECT_DEBIT",
} as const;

export type PaymentMean = (typeof PaymentMean)[keyof typeof PaymentMean];

export class Contract extends BaseObject {
  static aContract = () => new Contract(defaultPayload).withNewId();

  withAgency = (agency: Agency) => this.with({ agency: agency.getId() });

  withSupplier = (supplier: Supplier) =>
    this.with({ supplier: supplier.getId(), supplierPaid: supplier.getId() });

  withAmount = (amount: Amount) => this.with({ amount });

  withLabel = (label: string) => this.with({ label });

  withDescription = (description: string) => this.with({ description });

  withFonciaContractNumber = (fonciaContractNumber: string) =>
    this.with({ fonciaContractNumber });

  withSecondaryReference = (secondaryReference: string) =>
    this.with({ secondaryReference });

  withBillingFrequency = (billingFrequency: BillingFrequency) =>
    this.with({ billingFrequency });

  withBillingRecurrence = (billingRecurrence: BillingRecurrence) =>
    this.with({ billingRecurrence });

  withPaymentMean = (paymentMeans: PaymentMean) => this.with({ paymentMeans });

  withRenewalDuration = (
    renewalDuration: number,
    renewalDurationTimeUnit: RenewalDurationUnits,
  ) => this.with({ renewalDuration, renewalDurationTimeUnit });

  withIsTacitAgreement = (isTacitAgreement: boolean) =>
    this.with({ isTacitAgreement });

  withSignatureDate = (signatureDate: Date) => this.with({ signatureDate });

  withStartingDate = (startingDate: Date) => this.with({ startingDate });

  withEndingDate = (endingDate: Date) => this.with({ endingDate });

  addCodification = ({
    allocationKey,
    expenseType,
    rate,
  }: {
    allocationKey?: AllocationKey;
    expenseType: ExpenseType;
    rate: number;
  }) => {
    this.payload.codification.push({
      expenseType: expenseType.getId(),
      rate,
      ...(allocationKey && { allocationKey: allocationKey.getId() }),
    });

    return this;
  };
}

const defaultPayload = {
  _id: "<TO_FILL>",
  agency: "<TO_FILL>",
  label: "ARCHIVAGE ",
  family: "CLASSIC",
  type: "ARCHIVAGE",
  subCategory: "",
  codification: [],
  supplier: "<TO_Fill>",
  supplierPaid: "<TO_Fill>",
  building: "<TO_FILL>",
  amount: {
    value: 0,
    currency: "EUR",
  },
  lineOfBusiness: "S",
  paymentMeans: "TRANSFER",
  fonciaContractNumber: "<TO_FILL>",
  secondaryReference: "",
  additionalInfo: "",
  description: "",
  signatureDate: new Date(),
  noticeDelay: 0,
  hasAdditionalClause: false,
  competitiveBiddingFrequency: 3,
  billingFrequency: "YEARLY",
  billingRecurrence: "EXPIRE",
  isArchived: false,
  consumption: false,
  subCategories: [],
  isCurrent: true,
  startingDate: new Date(),
  endingDate: new Date(),
  isTacitAgreement: true,
  renewalDuration: 1,
  renewalDurationTimeUnit: "YEARS",
};

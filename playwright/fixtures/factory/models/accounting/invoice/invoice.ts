import type { Amount } from "../../../amount";
import { BaseObject } from "../../../baseObject";
import type { Agency } from "../../agency";

const Unit = {
  KWH: "KWH",
  KWHC: "KWHC",
  KWHG: "KWHG",
  KWHE: "KWHE",
  M3: "M3",
  KW: "KW",
  HOURS: "HOURS",
  LITERS: "LITERS",
  L: "LITERS",
  NBRE: "NOMBRE",
} as const;

type Unit = (typeof Unit)[keyof typeof Unit];

const Status = {
  DELETED: -1,
  RECEIVED: 0,
  INTEGRATED: 1,
  ACCOUNTING_ENTERED: 2,
  PAID: 3,
} as const;

type Status = (typeof Status)[keyof typeof Status];

export type InvoiceOrigin = "OCR" | "DOCAPOSTE" | "MANUAL" | "TENOR";

const InternalReferenceKind = {
  WORK_ORDER: "WorkOrder",
  CONTRACT: "Contract",
  EXTERNAL_TRUSTEE_REFERENCE: "ExternalTrusteeReference",
  ACCOUNT_OFFSET: "AccountOffset",
  FUNDS_CALL: "FundsCall",
  ALLOCATION_PROPOSITION: "AllocationProposition",
} as const;

type InternalReferenceKind =
  (typeof InternalReferenceKind)[keyof typeof InternalReferenceKind];

export class Invoice extends BaseObject {
  static anInvoice = () => new Invoice(defaultPayload).withNewId();

  withStatus = (status: Status) => this.with({ status });

  withReferenceNumber = (referenceNumber: string) =>
    this.with({ referenceNumber });

  withInvoiceNumber = (invoiceNumber: string) => this.with({ invoiceNumber });

  withQuantity = (quantity: number, unit: Unit) =>
    this.with({ quantity, unit });

  withAgency = (agency: Agency | null) =>
    this.with({ agency: agency ? agency.getId() : null });

  withAmountHT = (amount: Amount) => this.with({ "amount.amountHT": amount });

  withAmountVAT = (amount: Amount) => this.with({ "amount.amountVAT": amount });

  withRateVAT = (value: number) => this.with({ "amount.rateVAT": value });

  withAmountTTC = (amount: Amount) => this.with({ "amount.amountTTC": amount });

  withPeriod = (startPeriod: Date, endPeriod: Date) =>
    this.with({ startPeriod, endPeriod });

  withReceptionDate = (receptionDate: Date) => this.with({ receptionDate });

  withInvoiceDate = (invoiceDate: Date) => this.with({ invoiceDate });

  withOrigin = (origin: InvoiceOrigin) => this.with({ origin });

  withIsCreditNote = (isCreditNote: boolean) => this.with({ isCreditNote });

  withInternalReference = (internalReference: {
    kind: InternalReferenceKind;
    target: string;
  }) => this.with({ internalReference });

  withPaymentPriority = (paymentPriority: number) =>
    this.with({ paymentPriority });
}

const defaultPayload = {
  _id: "<TO FILL>",
  amount: {
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
  referenceNumber: "300 002 533 413",
  invoiceDate: new Date(),
  invoiceNumber: "TPH40000001",
  status: 0,
  stampCounter: 0,
  startPeriod: "",
  endPeriod: "",
  origin: "MANUAL",
  metadata: "664328dbc308db5905220113",
  receptionDate: new Date(),
};

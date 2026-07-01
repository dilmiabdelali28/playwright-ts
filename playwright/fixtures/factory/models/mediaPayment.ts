import type { Amount } from "../amount";
import { BaseObject } from "../baseObject";
import type { Agency } from "./agency";
import type { BankInformation } from "./bankInformation";
import type { CoOwnerAccount } from "./coOwnerAccount";
import type { Lease } from "./lease";

export class MediaPayment extends BaseObject {
  static natixisPayment = ({
    amount,
    status,
  }: {
    amount: Amount;
    status: string;
  }) =>
    this.aPayment().with({
      amount,
      status,
      kind: "NatixisPayment",
      direction: "ENTRANT",
    });

  private static aPayment = () => new MediaPayment(defaultPayload).withNewId();

  withCreditorBankInformation = (creditorBankInformation: BankInformation) =>
    this.with({
      "creditor.bankInformation._id": creditorBankInformation.payload._id,
    });

  withBeneficiaryCoownerAccount = (coOwnerAccount: CoOwnerAccount) =>
    this.with({
      lineOfBusiness: "S",
      "beneficiaries.0._id": coOwnerAccount.payload._id,
      "beneficiaries.0.amount": this.payload.amount,
      "beneficiaries.0.target": coOwnerAccount.payload._id,
      "beneficiaries.0.kind": "CoOwnerAccount",
    });

  withBeneficiaryLease = (lease: Lease) =>
    this.with({
      lineOfBusiness: "G",
      "beneficiaries.0._id": lease.payload._id,
      "beneficiaries.0.amount": this.payload.amount,
      "beneficiaries.0.target": lease.payload._id,
      "beneficiaries.0.kind": "Lease",
    });

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });
}

const defaultPayload = {
  creditor: {
    bankInformation: {
      _id: "643200002cf50ca23af8cff4",
    },
  },
  paymentDetails: {
    invoices: [],
  },
  direction: "ENTRANT",
  status: "PROCESSING",
  accountingLines: [],
  invoices: [],
  kind: "NatixisPayment",
  amount: {
    value: 10000,
    currency: "EUR",
  },
  lineOfBusiness: "S",
  motive: "Foncia initiation de paiement",
  beneficiaries: [
    {
      letteringStatus: "TO_DO",
      _id: "6453ceff4474ef7279372607",
      amount: {
        value: 10000,
        currency: "EUR",
      },
      kind: "CoOwnerAccount",
      target: "64391c97b6513029f3bac295",
      filters: [],
    },
  ],
  agency: null,
  triggeredAt: "2023-05-04T17:27:59.052+02:00",
  endToEndId: "1234567",
  rejectedAccountingLines: [],
  historyStatus: [],
  reference: "1234567",
  natixisResourceId: "bf86ca8e7c23450abf89ca40cff8b3d4",
};

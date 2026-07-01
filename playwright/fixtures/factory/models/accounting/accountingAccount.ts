import { BaseObject } from "../../baseObject";
import type { Agency } from "../agency";
import type { CoOwnerAccount } from "../coOwnerAccount";
import type { Lease } from "../lease";
import type { LessorAccount } from "../lessorAccount";

export class AccountingAccount extends BaseObject {
  static anAccount = () => new AccountingAccount(defaultPayload).withNewId();

  ofCoOwnerAccount = (coOwnerAccount: CoOwnerAccount) =>
    this.with({
      "third.kind": "CoOwnerAccount",
      "third.target": coOwnerAccount.payload._id,
      lineOfBusiness: "S",
      accountingClass: "4501",
      building: coOwnerAccount.payload.building,
    });

  ofLease = (lease: Lease) =>
    this.with({
      "third.kind": "Lease",
      "third.target": lease.payload._id,
      lineOfBusiness: "G",
      building: lease.payload.building,
      accountingClass: "4510",
      subAccount: lease.payload.leaseNumber,
    });

  ofLessorAccount = (lessorAccount: LessorAccount) =>
    this.with({
      "third.kind": "LessorAccount",
      "third.target": lessorAccount.payload._id,
      lineOfBusiness: "G",
      accountingClass: "4500",
      subAccount: lessorAccount.payload.lessorNumber,
    });

  withAccountingClass(accountingClass: string) {
    this.payload.accountingClass = accountingClass;

    return this;
  }

  withLineOfBusiness(lineOfBusiness: string) {
    this.payload.lineOfBusiness = lineOfBusiness;

    return this;
  }

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });
}

const defaultPayload = {
  computedBalance: {
    value: 0,
    currency: "EUR",
  },
  computedBalanceValueDate: {
    value: 0,
    currency: "EUR",
  },
  anomalies: {
    bankbalanceError: false,
    isBalancedError: false,
  },
  status: "TO_BALANCE",
  accountingClass: "4501",
  third: {
    kind: "CoOwnerAccount",
    target: "64380bb2687e7c447697af25",
  },
  lineOfBusiness: "S",
  agency: null,
  building: null,
  label: "DELCORDE",
};

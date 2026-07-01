import type { AllocationKey } from "$fixtures/factory/models/allocationKey";

import type { Amount } from "../../amount";
import { BaseObject } from "../../baseObject";
import type { AccountingAccount } from "./accountingAccount";
import type { ExpenseType } from "./expensType";

export class AccountingLine extends BaseObject {
  static debit = (amount: Amount) =>
    this.anAccountingLine().with({
      debit: amount,
    });

  static credit = (amount: Amount) =>
    this.anAccountingLine().with({
      credit: amount,
    });

  withAllocationKey = (allocationKey: AllocationKey) => {
    return this.with({
      allocationKey: allocationKey.payload._id,
    });
  };

  private static anAccountingLine = () =>
    new AccountingLine(defaultPayload).withNewId();

  inAccount = (accountingAccount: AccountingAccount) =>
    this.with({
      accountingAccount: accountingAccount.payload._id,
      agency: accountingAccount.payload.agency,
      building: accountingAccount.payload.building,
      kind: accountingAccount.payload.lineOfBusiness,
      accountingClass: accountingAccount.payload.accountingClass,
    });

  withExpenseType = (expenseType: ExpenseType) =>
    this.with({
      expenseType: expenseType.payload._id,
    });

  withAccountingRegularizationDate = (date: Date) =>
    this.with({ accountingRegularizationDate: date });
}

const defaultPayload = {
  hidden: false,
  letteringStatus: "TOTAL",
  accountingAccount: "64380c9558d3a0a8a9627f94",
  accountingClass: "4501",
  kind: "S",
  agency: null,
  building: null,
  journalCode: "VECC",
  inputDate: "2023-04-13T14:07:17.274Z",
  valueDate: "2023-04-13T14:07:17.258Z",
  accountingRegularizationDate: "2023-04-13T14:07:17.258Z",
  label: "Appel avance de trésorerie",
  budget: "63e82c00572c69e17aa7b159",
  processType: "USER",
  processCode: "ORIGINE_INCONNUE",
  dueDate: "2023-04-13T14:07:17.258Z",
  accountingEntryId: "3fd1f318-dddf-4484-a5cf-232446617dff",
  ___doNotSetThisManually___: true,
  createdBy: "6433c1d31ad323053b0e9751",
  history: [],
  accountingEntryNumber: 1179,
  computedBalance: {
    value: 0,
    currency: "EUR",
  },
  notLetteredAmount: {
    value: 0,
    currency: "EUR",
  },
};

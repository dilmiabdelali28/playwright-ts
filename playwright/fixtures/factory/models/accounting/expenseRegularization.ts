import { BaseObject } from "$fixtures/factory/baseObject";

import type { Agency } from "../agency";
import type { Building } from "../building";
import type { LessorAccount } from "../lessorAccount";
import type { AccountingPeriod } from "./accountingPeriod";

export class ExpenseRegularization extends BaseObject {
  static anExpenseRegularization = () =>
    new ExpenseRegularization(defaultPayload).withNewId();

  withBuilding = (building: Building) =>
    this.with({
      "building._id": building.payload._id,
    });

  withAgency = (agency: Agency) =>
    this.with({
      "agency._id": agency.payload._id,
    });

  withAccountingPeriod = (accountingPeriod: AccountingPeriod) =>
    this.with({
      "accountingPeriod._id": accountingPeriod.payload._id,
    });

  withLessorAccount = (lessorAccount: LessorAccount) =>
    this.with({
      lessorAccountId: lessorAccount.payload._id,
    });
}

const defaultPayload = {
  _id: "6583156dd2200b7e7f7d3ffd",
  canBeRegularized: true,
  building: {
    _id: "65831566923f7f1125670eb2",
  },
  accountingPeriod: {
    _id: "65831566923f7f1125670ec0",
    openingDate: "2022-12-01T00:00:00.000Z",
    closingDate: "2023-12-01T00:00:00.000Z",
  },
  agency: {
    _id: "5e5dafe018bb1b1dce020cb6",
  },
  kind: "EXTERN_TRUSTEE",
  status: "TO_DO",
  hasProvisionsBeenReassessed: false,
  leases: [],
  lessorAccountId: "65831566923f7f1125670eb5",
};

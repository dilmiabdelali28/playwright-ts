import { EUR } from "$fixtures/factory/amount";
import type { Lease } from "$fixtures/factory/models/lease";

import { BaseObject } from "../baseObject";
import type { Agency } from "./agency";
import type { Building } from "./building";
import type { LessorAccount } from "./lessorAccount";
import type { UnitsGroup } from "./unitsGroup";

export class RentDetailsCall extends BaseObject {
  static aRentDetailsCall = () =>
    new RentDetailsCall(rentDetailsCallDefaultPayload).withNewId();

  withUnitsGroup = (unitsGroup: UnitsGroup) => {
    return this.with({
      units: unitsGroup.payload.units,
      building: unitsGroup.payload.building,
      leaseNumber: unitsGroup.payload.unitsGroupNumber,
    });
  };

  withLease = (lease: Lease) => {
    return this.with({
      leaseId: lease.payload._id,
    });
  };

  withAgency = (agency: Agency) => {
    return this.with({
      agency: agency.payload._id,
    });
  };

  withLessorAccount = (lessorAccount: LessorAccount) =>
    this.with({
      lessorAccounts: lessorAccount.payload._id,
    });

  withBuilding = (building: Building) =>
    this.with({
      building: building.payload._id,
    });

  withPeriodStartDate = (date: Date) => this.with({ periodStartDate: date });

  withEndPeriodDate = (date: Date) => this.with({ endPeriodDate: date });

  withStatementDate = (date: Date) => this.with({ statementDate: date });

  withVariables = (variables: RentDetailsCallVariable[]) =>
    this.with({ variables: variables.map((v) => v.payload) });
}

export class RentDetailsCallVariable extends BaseObject {
  static aVariable = () =>
    new RentDetailsCallVariable(rentDetailsCallVariableDefaultPayload);

  from = (effectStartDate: Date) => this.with({ effectStartDate });

  to = (endEffectDate: Date) => this.with({ endEffectDate });
}

const rentDetailsCallDefaultPayload = {
  building: "6560bd83c06083eaf027a9a3",
  leaseId: "655912d66afc1afae9f4fc09",
  agency: "654f27dcc82e38c54cdca210",
  periodStartDate: "2023-04-30T00:00:00.000Z",
  endPeriodDate: "2023-04-30T23:59:59.000Z",
  statementDate: "2023-04-30T22:00:00.000Z",
  variables: [
    {
      type: "PROVISION",
      variableLabel: "provision sur charge d'eau froide",
      variableNumber: "6000",
      amount: { amountTTC: EUR(100) },
      effectStartDate: new Date("2023-06-06T00:00:00.000Z"),
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
  kind: "STANDARD_CALL",
  lessorAccounts: "654f27dcc82e38c54cdca210",
  lessor: {
    lessorId: "654f27dcc82e38c54cdca210",
    lessorNumber: "200000000",
    fullname: "Lessor Name",
  },
};

const rentDetailsCallVariableDefaultPayload = {
  type: "PROVISION",
  variableLabel: "provision sur charge d'eau froide",
  variableNumber: "6000",
  amount: { amountTTC: EUR(100) },
  effectStartDate: new Date("2023-06-06T00:00:00.000Z"),
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
};

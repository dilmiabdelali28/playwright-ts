import type { Amount } from "../../amount";
import { BaseObject } from "../../baseObject";
import type { AllocationKey } from "../allocationKey";
import type { AccountingPeriod } from "./accountingPeriod";
import type { ExpenseType } from "./expensType";

export type Kind =
  | "CURRENT_EXPENSES"
  | "REPAIR_TO_DO"
  | "CASH_ADVANCE"
  | "CASH_ADVANCE_ART186"
  | "OTHERS_CASH_ADVANCE"
  | "WORK_FUND_RESERVE";

type Status =
  | "TO_BE_VALIDATED_BY_PROPERTY_MANAGER"
  | "TO_VALIDATE_BY_TRUSTEE"
  | "TO_SEND_TO_TRUSTEE"
  | "PROPOSED"
  | "APPROVED"
  | "VALIDATED"
  | "TO_CLOSE"
  | "CLOSED"
  | "DIVIDED"
  | "INVALIDATED";

export class Budget extends BaseObject {
  static aBudget = () => new Budget(defaultPayload).withNewId();

  withAccountingPeriod = (accountingPeriod: AccountingPeriod) =>
    this.with({ accountingPeriod: accountingPeriod.payload._id });

  withKind = (kind: Kind) => this.with({ kind });

  withStatus = (status: Status) => this.with({ status });

  withLabel = (label: string) => this.with({ label });

  withApproved = (approved: BudgetDetails) =>
    this.with({ approved: approved.payload });

  withProposed = (proposed: BudgetDetails) =>
    this.with({ proposed: proposed.payload });

  withValidated = (validated: BudgetDetails) =>
    this.with({ validated: validated.payload });

  withCalRecurrence = (calRecurrence: number) => this.with({ calRecurrence });

  withDividedAt = () => this.with({ dividedAt: new Date() });

  withAllocationKey = (allocationKey: AllocationKey) => {
    if (this.payload.kind === "WORK_FUND_RESERVE") {
      return this.with({ allocationKeyFundRepair: allocationKey.payload._id });
    }

    return this;
  };
}

const defaultPayload = {
  _id: "<TO FILL>",
  label: "Budget",
  kind: "CURRENT_EXPENSES",
  status: "PROPOSED",
  accountingPeriod: "<TO FILL>",
  building: "<TO FILL>",
  proposed: {
    amount: {
      value: 0,
      currency: "EUR",
    },
    votedAmount: {
      value: 0,
      currency: "EUR",
    },
    amountPerExpenseType: [],
    timetable: [],
    financing: {},
  },
  calRecurrence: 0,
};

export class BudgetDetails extends BaseObject {
  static aBudgetDetails = () => new BudgetDetails(defaultPayload.proposed);

  withFinancing = (financing: {
    [K in "FUNDS_CALL" | "CASH_ADVANCE" | "WORK_FUND_RESERVE" | "LOAN"]?: {
      amount: Amount;
      amountPerAllocationKey: AmoutPerAllocationKey[];
    };
  }) =>
    this.with({
      financing: Object.entries(financing).reduce(
        (acc, [key, { amount, amountPerAllocationKey }]) => {
          return {
            // biome-ignore lint/performance/noAccumulatingSpread: TODO
            ...acc,
            [key]: {
              amount,
              amountPerAllocationKey: amountPerAllocationKey.map(
                (item) => item.payload,
              ),
            },
          };
        },
        {},
      ),
    });

  withTimetable = (timetable: Timetable[]) =>
    this.with({ timetable: timetable.map((item) => item.payload) });

  withAmount = (amount: Amount) => this.with({ amount });

  withVotedAmount = (votedAmount: Amount) => this.with({ votedAmount });

  withAmountPerExpenseType = (amountPerExpenseType: AmoutPerExpenseType[]) =>
    this.with({
      amountPerExpenseType: amountPerExpenseType.map((item) => item.payload),
    });
}

export class Timetable extends BaseObject {
  static aTimetable = () => new Timetable(timetablePayload).withNewId();

  withAmount = (amount: Amount) => this.with({ amount });

  withScheduledAt = (scheduledAt: Date) => this.with({ scheduledAt });

  withToExecuteAt = (toExecuteAt: Date) => this.with({ toExecuteAt });

  withCalledAt = (calledAt: Date) => this.with({ calledAt });
}

const timetablePayload = {
  scheduledAt: "2023-05-01T00:00:00.000Z",
  toExecuteAt: "2023-05-01T00:00:00.000Z",
  calledAt: "2023-05-01T00:00:00.000Z",
  amount: { value: 0, currency: "EUR" },
  status: "DEFAULT",
};

export class AmoutPerAllocationKey extends BaseObject {
  static anAmoutPerAllocationKey = () =>
    new AmoutPerAllocationKey(amoutPerAllocationKeyPayload).withNewId();

  withAmount = (amount: Amount) => this.with({ amount });

  withAllocationKey = (allocationKey: BaseObject) =>
    this.with({ allocationKey: allocationKey.payload._id });
}

const amoutPerAllocationKeyPayload = {
  _id: "<TO FILL>",
  amount: { value: 0, currency: "EUR" },
  allocationKey: "<TO FILL>",
};

export class AmoutPerExpenseType extends AmoutPerAllocationKey {
  static anAmoutPerExpenseType = () =>
    new AmoutPerExpenseType(amoutPerExpenseTypePayload).withNewId();

  withExpenseType = (expenseType: ExpenseType) =>
    this.with({ expenseType: expenseType.payload._id });
}

const amoutPerExpenseTypePayload = {
  ...amoutPerAllocationKeyPayload,
  expenseType: "<TO FILL>",
};

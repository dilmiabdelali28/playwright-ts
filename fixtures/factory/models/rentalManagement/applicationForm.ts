import { BaseObject } from "../../baseObject";
import type { Customer } from "../customer";

export class ApplicationForm extends BaseObject {
  static anApplicationForm = () =>
    new ApplicationForm(defaultPayload).withNewId();

  withCandidate(
    customer: Customer,
    {
      isMain = false,
      revenues = [],
    }: { isMain?: boolean; revenues?: unknown[] } = {},
  ) {
    if (!this.payload.candidates) {
      this.payload.candidates = [];
    }

    this.payload.candidates.push({
      isMain,
      revenues,
      customer: customer.payload._id,
    });

    return this;
  }

  withLeaseBroker = (customer: Customer) =>
    this.with({ leaseBroker: customer.payload._id });
}

const defaultPayload = {
  candidates: [],
  criterias: {
    desiredOption: "",
    unitType: [],
    numberOfRooms: [],
  },
  guarantor: [],
  isArchived: false,
  numberOfMonthsValid: 3,
  lastContractDate: new Date(),
  openingDate: new Date(),
};

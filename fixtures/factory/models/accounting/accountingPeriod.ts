import moment from "moment";

import { BaseObject } from "../../baseObject";
import type { Agency } from "../agency";

type StatusType =
  | "OPEN"
  | "TO_VALIDATE_BY_ACCOUNTANT"
  | "TO_BE_VALIDATED_BY_PROPERTY_MANAGER"
  | "TO_VALIDATE_BY_TRUSTEE"
  | "TO_ALLOCATE"
  | "DIVIDED"
  | "APPROVED"
  | "REFUSED";

export class AccountingPeriod extends BaseObject {
  static anAccountingPeriod = () =>
    new AccountingPeriod(defaultPayload).withNewId();

  withStatus = (status: StatusType) => this.with({ status });

  withOpeningDate = (openingDate: Date) => this.with({ openingDate });

  withClosingDate = (closingDate: Date) => this.with({ closingDate });

  withName = (name: string) => this.with({ name });

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });

  withLineOfBusiness = (lineOfBusiness: "S" | "G") =>
    this.with({ lineOfBusiness });

  withAppendixes = () =>
    this.with({
      appendixes: {
        documents: {
          RGDD_REPAIR: [],
          ANNEXE1: {
            originalFilename: "ANNEXE4.pdf",
            category: "accountingPeriodAppendixes",
            hashFile: "hash25",
            mimeType: "application/pdf",
            updatedAt: new Date(),
            createdAt: new Date(),
          },
          ANNEXE2: {
            originalFilename: "ANNEXE1.pdf",
            category: "accountingPeriodAppendixes",
            hashFile: "hash25",
            mimeType: "application/pdf",
            updatedAt: new Date(),
            createdAt: new Date(),
          },
          ANNEXE3: {
            originalFilename: "ANNEXE3.pdf",
            category: "accountingPeriodAppendixes",
            hashFile: "hash25",
            mimeType: "application/pdf",
            updatedAt: new Date(),
            createdAt: new Date(),
          },
          ANNEXE4: {
            originalFilename: "ANNEXE2.pdf",
            category: "accountingPeriodAppendixes",
            hashFile: "hash25",
            mimeType: "application/pdf",
            updatedAt: new Date(),
            createdAt: new Date(),
          },
          ANNEXE5: {
            originalFilename: "ANNEXE5.pdf",
            category: "accountingPeriodAppendixes",
            hashFile: "hash25",
            mimeType: "application/pdf",
            updatedAt: new Date(),
            createdAt: new Date(),
          },
          ANNEXE1_BIS: {
            originalFilename: "ANNEXE1_BIS.pdf",
            category: "accountingPeriodAppendixes",
            hashFile: "hash25",
            mimeType: "application/pdf",
            updatedAt: new Date(),
            createdAt: new Date(),
          },
        },
      },
    });
}

const defaultPayload = {
  _id: "<TO FILL>",
  name: moment().format("YYYY"),
  agency: "<TO FILL>",
  status: "OPEN",
  building: "<TO FILL>",
  closingDate: moment().add(6, "months").subtract(1, "day").toDate(),
  openingDate: moment().subtract(6, "months").toDate(),
  lineOfBusiness: "S",
};

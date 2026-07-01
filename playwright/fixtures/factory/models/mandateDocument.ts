import documents from "../../datasets/mandateDocuments.json";
import { BaseObject } from "../baseObject";

type SubCategoryType =
  | "precontractual"
  | "waiver"
  | "insurance"
  | "appendix"
  | "mandate";

enum SubCategoryTypes {
  PRECONTRACTUAL = "precontractual",
  WAIVER = "waiver",
  INSURANCE = "insurance",
  APPENDIX = "appendix",
  MANDATE = "mandate",
}

export class MandateDocument extends BaseObject {
  static aMandateDocument = () =>
    new MandateDocument(defaultPayload).withNewId();

  static anAppendix = (payload = documents.appendix) =>
    new MandateDocument(payload).withSubCategory(SubCategoryTypes.APPENDIX);

  static anInsurance = (payload = documents.insurance) =>
    new MandateDocument(payload).withSubCategory(SubCategoryTypes.INSURANCE);

  static aMandate = (payload = documents.mandate) =>
    new MandateDocument(payload).withSubCategory(SubCategoryTypes.MANDATE);

  static aPrecontractual = (payload = documents.precontractual) =>
    new MandateDocument(payload).withSubCategory(
      SubCategoryTypes.PRECONTRACTUAL,
    );

  static aWaiver = (payload = documents.waiver) =>
    new MandateDocument(payload).withSubCategory(SubCategoryTypes.WAIVER);

  withSignature = () =>
    this.with({ signatures: { isSigned: true, isImported: true } });

  withSubCategory = (subCategory: SubCategoryType) =>
    this.with({ subCategory });
}

const defaultPayload = {
  originalFilename:
    "Document_information_precontractuel_08-07-2023_12_26_47.pdf",
  category: "newMandateDocuments",
  hashFile: "64a939e969f73f18a0c4c559",
  mimeType: "application/pdf",
  subCategory: "precontractual",
  msDocumentId: "64a939e86310fc7d4f0192a5",
  updatedAt: "2023-07-08T10:26:49.608Z",
  createdAt: "2023-07-08T10:26:48.959Z",
};

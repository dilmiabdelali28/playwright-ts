import { BaseObject } from "$fixtures/factory/baseObject";

import type { Invoice } from "./invoice";

export class InvoiceMetadata extends BaseObject {
  static anInvoiceMetadata = () =>
    new InvoiceMetadata(defaultPayload).withNewId();

  withInvoice = (invoice: Invoice) => {
    invoice.with({ metadata: this.getId() });

    return this.with({ "invoice._id": invoice.getId() });
  };

  withTenorMetadata = (externalId: number) =>
    this.with({ tenorEdiExtraction: { externalId } });
}

const defaultPayload = {
  _id: "<TO FILL>",
  invoice: { _id: "<TO FILL>" },
  tenorEdiExtraction: { externalId: 104 },
};

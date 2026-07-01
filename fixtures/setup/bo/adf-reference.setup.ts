import { loadAdfReferenceSeedSupplierId } from "$fixtures/datasets/bo/adf-reference-seed";

import type { BoApiContext } from "../bo-api-context";
import { createAdfReference } from "./adf-api.setup";
import { setupInvoiceOptions } from "./invoice-options.setup";
import { resolveFirstSupplierId } from "./supplier-resolver.setup";

/** Scenario: external ADF reference ready for invoice internal reference. */
export async function setupAdfReference(ctx: BoApiContext): Promise<string> {
  const references = await setupInvoiceOptions(ctx);
  const supplierId =
    (await resolveFirstSupplierId(ctx)) || loadAdfReferenceSeedSupplierId();

  if (!supplierId) {
    throw new Error("setupAdfReference: unable to resolve supplier id");
  }

  return createAdfReference(ctx, {
    buildingId: references.buildingId,
    supplierId,
    lessorIds: references.lessorIds,
  });
}

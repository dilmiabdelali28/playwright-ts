import { lessorContext } from "$fixtures/factory/contexts/lessorContext";

import type { BoApiContext } from "../bo-api-context";
import { BoFixtureApiClient } from "./fixture-api.client";

type FixtureEntity = { _id?: string };
type FixtureUnit = { _id?: string; building?: string };

type InvoiceOptionsFixtureContext = {
  buildings?: FixtureEntity[];
  units?: FixtureUnit[];
  lessorAccounts?: FixtureEntity[];
  customers?: FixtureEntity[];
  coOwnerAccounts?: FixtureEntity[];
};

type InvoiceOptionsReferences = {
  buildingId: string;
  lessorIds: string[];
};

export async function setupInvoiceOptions(
  ctx: BoApiContext,
): Promise<InvoiceOptionsReferences> {
  const fixture = new BoFixtureApiClient(ctx);
  const context = await fixture.createFixture<InvoiceOptionsFixtureContext>(
    lessorContext({
      login: `auto.pw.${Date.now()}@example.test`,
    }),
  );

  if (!context) {
    throw new Error("setupInvoiceOptions: fixture creation failed");
  }

  const buildingId =
    context.buildings?.[0]?._id || context.units?.[0]?.building || "";
  const lessorIds = uniqueIds([
    ...(context.lessorAccounts || []),
    ...(context.customers || []),
    ...(context.coOwnerAccounts || []),
  ]);

  if (!buildingId || lessorIds.length === 0) {
    throw new Error("setupInvoiceOptions: missing building or lessor ids");
  }

  return { buildingId, lessorIds };
}

function uniqueIds(values: FixtureEntity[]): string[] {
  return Array.from(
    new Set(values.map((value) => value?._id || "").filter(Boolean)),
  );
}

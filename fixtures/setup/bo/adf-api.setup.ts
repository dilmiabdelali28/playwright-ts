import type { BoApiContext } from "../bo-api-context";

type AdfCreateReferences = {
  buildingId: string;
  supplierId: string;
  lessorIds: string[];
};

export async function createAdfReference(
  ctx: BoApiContext,
  references: AdfCreateReferences,
): Promise<string> {
  if (!ctx.accessToken) {
    throw new Error("createAdfReference: missing access token");
  }
  if (
    !references.buildingId ||
    !references.supplierId ||
    references.lessorIds.length === 0
  ) {
    throw new Error(
      `createAdfReference: missing required fields — buildingId=${references.buildingId}, supplierId=${references.supplierId}, lessorIds.length=${references.lessorIds.length}`,
    );
  }

  const currentYear = `${new Date().getFullYear()}`;
  const externalReference = `AutoPlaywrightADF-${Date.now()}`;
  const failures: string[] = [];

  for (const lessorId of references.lessorIds) {
    const createResp = await ctx.request.post(
      `${ctx.boApiBaseUrl}/external-trustee-references`,
      {
        headers: { authorization: `Bearer ${ctx.accessToken}` },
        data: {
          currentYear,
          endDate: `${currentYear}-12-31`,
          fonciaReference: "AutoPlaywright",
          label: externalReference,
          frequency: "TWICE_YEARLY",
          startDate: `${currentYear}-01-01`,
          status: "ONGOING",
          externalReference,
          building: references.buildingId,
          lessor: lessorId,
          supplier: references.supplierId,
        },
      },
    );
    if (!createResp.ok()) {
      const body = await createResp.text().catch(() => "(unreadable)");
      failures.push(
        `POST lessorId=${lessorId} → ${createResp.status()} ${body}`,
      );
      continue;
    }

    const created = (await createResp.json()) as { id?: string };
    if (!created.id) {
      failures.push(`POST lessorId=${lessorId} → 2xx but no id in body`);
      continue;
    }

    const getResp = await ctx.request.get(
      `${ctx.boApiBaseUrl}/external-trustee-references/${created.id}`,
      {
        headers: { authorization: `Bearer ${ctx.accessToken}` },
      },
    );
    if (!getResp.ok()) {
      const body = await getResp.text().catch(() => "(unreadable)");
      failures.push(`GET id=${created.id} → ${getResp.status()} ${body}`);
      continue;
    }

    const adf = (await getResp.json()) as { number?: string };
    if (adf.number) {
      return adf.number;
    }
    failures.push(`GET id=${created.id} → 2xx but no number in body`);
  }

  throw new Error(
    `createAdfReference failed for buildingId=${references.buildingId}, supplierId=${references.supplierId}.\nAttempts:\n${failures.join("\n")}`,
  );
}

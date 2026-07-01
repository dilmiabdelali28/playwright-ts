import type { AdbApiContext } from "../adb-api-context";

type IncidentWorkorderParams = {
  supplierId: string;
  expenseTypeId: string;
  buildingId: string;
  allocationKeyId: string;
  budgetId: string;
};

type RepairWorkorderParams = {
  supplierId: string;
};

type RepairWorkorder = {
  number: string;
  label: string;
};

// Seed IDs from dev1 dataset — mirror the Cypress createRepairMissionByApi.
const REPAIR_SEED = {
  buildingId: "5e5db02dae15854d537b0868",
  allocationKeyId: "5e5dafdfe222cddfae008e40",
  expenseTypeId: "5e5dafdd2c671e3005fde052",
  budgetId: "646f9748a7e692182e5e836f",
} as const;

export async function setupIncidentWorkorder(
  ctx: AdbApiContext,
  params: IncidentWorkorderParams,
): Promise<string> {
  const missionId = await createMission(ctx, "/missions/incidents", {
    label: `TEST AUTO INCIDENT MISSION ${Date.now()}`,
    housing: {
      kind: "Building",
      target: params.buildingId,
    },
  });
  if (!missionId) {
    return "";
  }

  return createWorkorder(ctx, missionId, {
    label: `Test AUTO OS${Date.now()}`,
    codification: {
      allocationKey: params.allocationKeyId,
      budget: params.budgetId,
      expenseType: params.expenseTypeId,
    },
    supplier: params.supplierId,
    repairDate: repairDateRange(),
    status: {
      supplier: "DRAFT",
    },
    amountEstimateCost: {
      value: 0,
      currency: "EUR",
    },
  });
}

export async function setupRepairWorkorder(
  ctx: AdbApiContext,
  params: RepairWorkorderParams,
): Promise<RepairWorkorder> {
  const missionId = await createMission(ctx, "/missions/repair", {
    label: `TEST AUTO REPAIR MISSION ${Date.now()}`,
    isEnergyRenovationWork: false,
    housing: {
      kind: "Building",
      target: REPAIR_SEED.buildingId,
    },
  });
  if (!missionId) {
    return { number: "", label: "" };
  }

  const label = `Test AUTO OS${Date.now()}`;
  const number = await createWorkorder(ctx, missionId, {
    label,
    codification: {
      allocationKey: REPAIR_SEED.allocationKeyId,
      budget: REPAIR_SEED.budgetId,
      expenseType: REPAIR_SEED.expenseTypeId,
    },
    supplier: params.supplierId,
    repairDate: repairDateRange(),
    status: {
      supplier: "DRAFT",
    },
  });

  return { number, label };
}

async function createMission(
  ctx: AdbApiContext,
  path: string,
  data: Record<string, unknown>,
): Promise<string> {
  const missionResponse = await ctx.request.post(
    `${ctx.adbApiBaseUrl}${path}`,
    {
      headers: {
        Authorization: `Bearer ${ctx.accessToken}`,
      },
      data,
    },
  );
  if (!missionResponse.ok()) {
    return "";
  }

  const mission = (await missionResponse.json()) as { id?: string };
  return mission.id ?? "";
}

async function createWorkorder(
  ctx: AdbApiContext,
  missionId: string,
  data: Record<string, unknown>,
): Promise<string> {
  const workorderResponse = await ctx.request.post(
    `${ctx.adbApiBaseUrl}/work-orders-coownership/missions/${missionId}`,
    {
      headers: {
        Authorization: `Bearer ${ctx.accessToken}`,
      },
      data,
    },
  );
  if (!workorderResponse.ok()) {
    return "";
  }

  const workorder = (await workorderResponse.json()) as {
    body?: { number?: string };
    number?: string;
  };
  return workorder.number ?? workorder.body?.number ?? "";
}

function repairDateRange(): { start: string; end: string } {
  const now = new Date();
  const start = now.toISOString();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return { start, end };
}

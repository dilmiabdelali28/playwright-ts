import type { BoApiContext } from "../bo-api-context";

type SupplierApiResponse = {
  _id?: string;
  id?: string;
  items?: Array<{ _id?: string; id?: string }>;
};

export async function resolveFirstSupplierId(
  ctx: BoApiContext,
): Promise<string> {
  if (!ctx.accessToken) {
    return "";
  }

  const paths = [
    "/suppliers?pageNumber=1&itemsPerPage=1",
    "/suppliers/favorites?pageNumber=1&itemsPerPage=1",
  ];

  for (const path of paths) {
    const id = await resolveFromPath(ctx, path);
    if (id) {
      return id;
    }
  }

  return "";
}

async function resolveFromPath(
  ctx: BoApiContext,
  path: string,
): Promise<string> {
  const response = await ctx.request.get(`${ctx.boApiBaseUrl}${path}`, {
    headers: { authorization: `Bearer ${ctx.accessToken}` },
  });
  if (!response.ok()) {
    return "";
  }

  const body = (await response.json()) as
    | SupplierApiResponse
    | SupplierApiResponse[];

  if (Array.isArray(body)) {
    return body[0]?._id || body[0]?.id || "";
  }

  return (
    body.items?.[0]?._id || body.items?.[0]?.id || body._id || body.id || ""
  );
}

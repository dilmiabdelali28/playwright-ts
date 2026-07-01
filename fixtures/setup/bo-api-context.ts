import type { APIRequestContext } from "@playwright/test";

export type BoApiContext = {
  request: APIRequestContext;
  boApiBaseUrl: string;
  accessToken: string;
};

export function createBoApiContext(
  request: APIRequestContext,
  boApiBaseUrl: string,
  accessToken: string,
): BoApiContext {
  return { request, boApiBaseUrl, accessToken };
}

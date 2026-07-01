import type { APIRequestContext } from "@playwright/test";

export type AdbApiContext = {
  request: APIRequestContext;
  adbApiBaseUrl: string;
  accessToken: string;
};

export function createAdbApiContext(
  request: APIRequestContext,
  adbApiBaseUrl: string,
  accessToken: string,
): AdbApiContext {
  return { request, adbApiBaseUrl, accessToken };
}

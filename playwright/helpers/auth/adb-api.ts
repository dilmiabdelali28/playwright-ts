import { getOktaAccessTokenWithRetry } from "@helpers/auth/bo-auth";
import { TEST_CONFIG } from "@helpers/common/test-config";
import type { Page } from "@playwright/test";

import {
  loadEnvironmentConfig,
  resolveFixturesRoot,
} from "./environment-fixtures";

export async function resolveAdbApi(
  page: Page,
): Promise<{ baseUrl: string; token: string }> {
  const token = await getOktaAccessTokenWithRetry(page);
  if (!token) {
    throw new Error("Unable to resolve access token for ADB API request");
  }

  const config = loadEnvironmentConfig(
    resolveFixturesRoot(TEST_CONFIG.fixturesDir),
  );
  const baseUrl = config.env?.ADB?.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing API_BASE_URL for ADB");
  }

  return { baseUrl, token };
}

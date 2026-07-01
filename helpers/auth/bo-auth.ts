import fs from "node:fs";
import path from "node:path";

import {
  loadEnvironmentConfig,
  resolveFixturesRoot,
} from "@helpers/auth/environment-fixtures";
import type { Page } from "@playwright/test";

import {
  assertRedirectedToOkta,
  resolveOktaIssuer,
  submitOktaCredentials,
  visitAdbLoginPage,
} from "./adb-login";

export type BoUser = {
  boBaseUrl: string;
  boApiBaseUrl: string;
  login: string;
  password: string;
};

export function loadBoUserFromFixtures(
  userName: string,
  fixturesDir?: string,
): BoUser {
  const root = resolveFixturesRoot(fixturesDir);
  const usersPath = path.join(root, "users_dev.json");

  const users = JSON.parse(fs.readFileSync(usersPath, "utf8")) as Record<
    string,
    { login: string; Password: string }
  >;
  const environmentConfig = loadEnvironmentConfig(root);

  const selectedUser = users[userName];
  const boBaseUrl = environmentConfig.env?.BO?.BASE_URL;
  const boApiBaseUrl = environmentConfig.env?.BO?.API_BASE_URL;

  if (
    !selectedUser?.login ||
    !selectedUser?.Password ||
    !boBaseUrl ||
    !boApiBaseUrl
  ) {
    throw new Error(
      `Invalid fixtures for user "${userName}" or missing BO base/api URL.`,
    );
  }

  return {
    boBaseUrl,
    boApiBaseUrl,
    login: selectedUser.login,
    password: selectedUser.Password,
  };
}

export async function loginToBo(page: Page, user: BoUser): Promise<void> {
  const oktaIssuerFromEnv = process.env.OKTA_ISSUER;
  await visitAdbLoginPage(page, user.boBaseUrl);
  const oktaIssuer = await resolveOktaIssuer(
    page,
    user.boBaseUrl,
    oktaIssuerFromEnv,
  );
  await assertRedirectedToOkta(page, oktaIssuer);
  await submitOktaCredentials(page, user.login, user.password);
  await page
    .waitForURL(
      (url) =>
        url.toString().startsWith(user.boBaseUrl) &&
        !url.toString().includes("/implicit/callback") &&
        !url.toString().includes("login.dev1.fonciamillenium.net"),
      { timeout: 45000 },
    )
    .catch(() => undefined);

  await assertBoLoggedInLanding(page);

  const profileSelection = page.locator(
    '[data-testid="profile-selection-title"]',
  );
  if (await profileSelection.isVisible().catch(() => false)) {
    await page
      .locator('[data-testid="profile-selection-button"]')
      .first()
      .click();
    await page
      .locator('[data-testid="avatar"]')
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
  }
}

export async function assertBoLoggedInLanding(page: Page): Promise<void> {
  const avatar = page.locator('[data-testid="avatar"]').first();
  const profileSelection = page
    .locator('[data-testid="profile-selection-title"]')
    .first();
  const clearCache = page
    .locator('button:has-text("Vider mon cache et recharger la page")')
    .first();

  // One composite wait — do not use Promise.race on parallel waitFor calls:
  // losing locators keep running and can throw "Target page has been closed"
  // after navigation or reload.
  const anyLanding = avatar.or(profileSelection).or(clearCache);

  try {
    await anyLanding.waitFor({ state: "visible", timeout: 60000 });
  } catch {
    throw new Error(
      "BO login failed: avatar or profile selection not visible after 60s (app stuck on splash screen).",
    );
  }

  if (await clearCache.isVisible().catch(() => false)) {
    await clearCache.click();
    await page.waitForLoadState("load");
    // CI runners are slower — allow up to 90 s after clearing the cache.
    const afterCache = avatar.or(profileSelection);
    try {
      await afterCache.waitFor({ state: "visible", timeout: 90000 });
    } catch {
      throw new Error(
        "BO login failed: app still on splash screen after clearing cache.",
      );
    }
  }
}

export async function getOktaAccessTokenWithRetry(
  page: Page,
  maxAttempts = 20,
): Promise<string> {
  try {
    const handle = await page.waitForFunction(
      () => {
        const raw = localStorage.getItem("okta-token-storage");
        if (!raw) {
          return "";
        }
        const parsed = JSON.parse(raw) as {
          accessToken?: { accessToken?: string };
        };
        return parsed.accessToken?.accessToken || "";
      },
      null,
      { timeout: maxAttempts * 1000 },
    );
    return ((await handle.jsonValue()) as string) || "";
  } catch {
    return "";
  }
}

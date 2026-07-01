import fs from "node:fs";
import path from "node:path";

import {
  loadEnvironmentConfig,
  resolveFixturesRoot,
} from "@helpers/auth/environment-fixtures";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const locators = {
  adbShell: {
    userIcon: '[data-testid="avatar"]',
    profileMenuButton: 'button[id="profil-menu-button"]',
    profileSelectionTitle: "text=Sélectionnez un profil de connexion",
    profileSelectionButton: 'button:has-text("Selectionner")',
    createMissionButton: 'button:has-text("Créer une mission")',
    clearCacheButton: 'button:has-text("Vider mon cache et recharger la page")',
  },
  oktaLogin: {
    usernameInput: '[name="identifier"]',
    passwordInput: '[name="credentials.passcode"]',
    submitButton: '[type="submit"]',
  },
} as const;

type PlaywrightUserRecord = {
  login: string;
  Password: string;
};

type PlaywrightDevUsers = Record<string, PlaywrightUserRecord>;

export async function visitAdbLoginPage(
  page: Page,
  baseUrl: string,
): Promise<void> {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
}

export async function resolveOktaIssuer(
  page: Page,
  baseUrl: string,
  issuerFromEnv?: string,
): Promise<string> {
  if (issuerFromEnv) {
    return issuerFromEnv;
  }

  const configUrl = new URL("/config.js", baseUrl).toString();
  const response = await page.request.get(configUrl);
  const content = await response.text();
  const match = [
    /OKTA_ISSUER["']?\s*[:=]\s*["']([^"']+)["']/i,
    /issuer["']?\s*:\s*["']([^"']+)["']/i,
  ]
    .map((pattern) => content.match(pattern))
    .find((result) => result?.[1]);

  if (match?.[1]) {
    return match[1];
  }

  const redirectedIssuer = await waitForIssuerFromRedirect(page);
  if (redirectedIssuer) {
    return redirectedIssuer;
  }

  const currentIssuer = deriveIssuerFromCurrentUrl(page.url());
  if (currentIssuer) {
    return currentIssuer;
  }

  const issuerFromBaseUrl = deriveIssuerFromBaseUrl(baseUrl);
  if (issuerFromBaseUrl) {
    return issuerFromBaseUrl;
  }

  throw new Error(
    "Unable to resolve OKTA_ISSUER from /config.js, redirect URL, or base URL. Set OKTA_ISSUER env var.",
  );
}

export async function assertRedirectedToOkta(
  page: Page,
  oktaIssuer: string,
): Promise<void> {
  const loginOrigin = new URL(oktaIssuer).origin;
  await expect(page).toHaveURL(
    new RegExp(escapeRegExp(`${loginOrigin}/oauth2/`)),
  );
}

export async function submitOktaCredentials(
  page: Page,
  login: string,
  password: string,
): Promise<void> {
  const usernameInput = page.locator(locators.oktaLogin.usernameInput);
  const passwordInput = page.locator(locators.oktaLogin.passwordInput);

  await expect(usernameInput).toBeVisible({ timeout: 30000 });
  await usernameInput.click();
  await usernameInput.fill("");
  await usernameInput.fill(login);
  await expect(usernameInput).toHaveValue(login);

  // Force focus out of the username field before typing the password.
  await usernameInput.press("Tab");

  await expect(passwordInput).toBeVisible({ timeout: 30000 });
  await passwordInput.click();
  await passwordInput.fill("");
  await passwordInput.fill(password);
  await page.locator(locators.oktaLogin.submitButton).click();
}

export async function assertLoggedUserIcon(page: Page): Promise<void> {
  await expect(
    page.locator(locators.adbShell.profileMenuButton).first(),
  ).toBeVisible();
}

export async function assertUsersTableVisible(page: Page): Promise<void> {
  await expect(
    page.locator(locators.adbShell.profileSelectionTitle),
  ).toBeVisible();
  await expect(
    page.locator(locators.adbShell.profileSelectionButton).first(),
  ).toBeVisible();
}

export async function assertLoggedInLanding(page: Page): Promise<void> {
  await assertLoggedInLandingWithRetry(page, 2);
}

async function assertLoggedInLandingWithRetry(
  page: Page,
  remainingRetries: number,
): Promise<void> {
  const avatar = page.locator(locators.adbShell.userIcon).first();
  const profileMenuButton = page
    .locator(locators.adbShell.profileMenuButton)
    .first();
  const createMissionButton = page
    .locator(locators.adbShell.createMissionButton)
    .first();
  const clearCacheButton = page
    .locator(locators.adbShell.clearCacheButton)
    .first();
  const profileTitle = page.locator(locators.adbShell.profileSelectionTitle);
  const landingState = await Promise.race([
    avatar.waitFor({ state: "visible", timeout: 40000 }).then(() => "avatar"),
    profileMenuButton
      .waitFor({ state: "visible", timeout: 40000 })
      .then(() => "profile-menu"),
    createMissionButton
      .waitFor({ state: "visible", timeout: 40000 })
      .then(() => "create-mission"),
    clearCacheButton
      .waitFor({ state: "visible", timeout: 40000 })
      .then(() => "clear-cache"),
    profileTitle
      .waitFor({ state: "visible", timeout: 40000 })
      .then(() => "profile"),
  ]).catch(() => "");

  if (landingState === "avatar") {
    return;
  }
  if (landingState === "profile-menu") {
    return;
  }
  if (landingState === "create-mission") {
    return;
  }
  if (landingState === "clear-cache") {
    await clearCacheButton.click();
    await page.waitForLoadState("domcontentloaded");
    if (remainingRetries > 0) {
      await assertLoggedInLandingWithRetry(page, remainingRetries - 1);
      return;
    }
    return;
  }
  if (landingState === "profile") {
    await page
      .locator(locators.adbShell.profileSelectionButton)
      .first()
      .click();
    await expect(profileMenuButton).toBeVisible({ timeout: 40000 });
    return;
  }

  throw new Error(
    "Unable to reach logged-in landing (avatar or profile selector not visible).",
  );
}

export function loadPlaywrightLoginFixtures(fixturesDir?: string): {
  adbBaseUrl: string;
  adbApiBaseUrl: string;
  celine: { login: string; password: string };
  pierre: { login: string; password: string };
} {
  const root = resolveFixturesRoot(fixturesDir);
  const usersPath = path.join(root, "users_dev.json");

  if (!fs.existsSync(usersPath)) {
    throw new Error(
      `Fixtures not found. Expected file: ${usersPath}. Set PLAYWRIGHT_FIXTURES_DIR if needed.`,
    );
  }

  const users = JSON.parse(
    fs.readFileSync(usersPath, "utf8"),
  ) as PlaywrightDevUsers;
  const environmentConfig = loadEnvironmentConfig(root);

  const celine = users.Celine;
  const pierre = users.Pierre;
  const adbBaseUrl = environmentConfig.env?.ADB?.BASE_URL;
  const adbApiBaseUrl = environmentConfig.env?.ADB?.API_BASE_URL;

  if (
    !celine?.login ||
    !celine?.Password ||
    !pierre?.login ||
    !pierre?.Password ||
    !adbBaseUrl ||
    !adbApiBaseUrl
  ) {
    throw new Error(
      "Invalid fixtures: missing Celine/Pierre credentials or ADB BASE_URL/API_BASE_URL.",
    );
  }

  return {
    adbBaseUrl,
    adbApiBaseUrl,
    celine: { login: celine.login, password: celine.Password },
    pierre: { login: pierre.login, password: pierre.Password },
  };
}

export function loadPlaywrightAdbUser(
  userName: string,
  fixturesDir?: string,
): {
  adbBaseUrl: string;
  adbApiBaseUrl: string;
  login: string;
  password: string;
} {
  const root = resolveFixturesRoot(fixturesDir);
  const usersPath = path.join(root, "users_dev.json");

  if (!fs.existsSync(usersPath)) {
    throw new Error(
      `Fixtures not found. Expected file: ${usersPath}. Set PLAYWRIGHT_FIXTURES_DIR if needed.`,
    );
  }

  const users = JSON.parse(
    fs.readFileSync(usersPath, "utf8"),
  ) as PlaywrightDevUsers;
  const environmentConfig = loadEnvironmentConfig(root);
  const selectedUser = users[userName];
  const adbBaseUrl = environmentConfig.env?.ADB?.BASE_URL;
  const adbApiBaseUrl = environmentConfig.env?.ADB?.API_BASE_URL;

  if (
    !selectedUser?.login ||
    !selectedUser?.Password ||
    !adbBaseUrl ||
    !adbApiBaseUrl
  ) {
    throw new Error(
      `Invalid fixtures for user "${userName}" or missing ADB BASE_URL/API_BASE_URL.`,
    );
  }

  return {
    adbBaseUrl,
    adbApiBaseUrl,
    login: selectedUser.login,
    password: selectedUser.Password,
  };
}

export async function logoutFromShell(page: Page): Promise<void> {
  const profileButton = page
    .locator(locators.adbShell.profileMenuButton)
    .first();
  if (!(await profileButton.isVisible().catch(() => false))) {
    return;
  }

  await profileButton.click();
  await page.locator('li[data-cy="profil-menu-logout-button"]').first().click();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deriveIssuerFromCurrentUrl(currentUrl: string): string {
  if (!currentUrl) {
    return "";
  }

  try {
    const parsed = new URL(currentUrl);
    const v1Index = parsed.pathname.indexOf("/v1/");

    if (v1Index >= 0) {
      return `${parsed.origin}${parsed.pathname.slice(0, v1Index)}`;
    }

    if (
      parsed.hostname.includes("login.") ||
      parsed.hostname.includes("okta") ||
      parsed.pathname.includes("/oauth2/")
    ) {
      return parsed.origin;
    }
  } catch {
    return "";
  }

  return "";
}

async function waitForIssuerFromRedirect(page: Page): Promise<string> {
  try {
    await page.waitForURL(
      (url) => {
        const value = url.toString();
        return (
          value.includes("/oauth2/") ||
          value.includes("/v1/") ||
          value.includes("login.") ||
          value.includes("okta")
        );
      },
      { timeout: 10000 },
    );
  } catch {
    return "";
  }

  return deriveIssuerFromCurrentUrl(page.url());
}

function deriveIssuerFromBaseUrl(baseUrl: string): string {
  try {
    const parsed = new URL(baseUrl);
    const host = parsed.hostname;

    if (host.includes(".review.dev1.fonciamillenium.net")) {
      return "https://login.dev1.fonciamillenium.net/oauth2/default";
    }

    if (host.includes(".dev1.fonciamillenium.net")) {
      return "https://login.dev1.fonciamillenium.net/oauth2/default";
    }

    const parts = host.split(".");
    if (parts.length >= 4) {
      const envName = parts[1];
      return `https://login.${envName}.fonciamillenium.net/oauth2/default`;
    }
  } catch {
    return "";
  }

  return "";
}

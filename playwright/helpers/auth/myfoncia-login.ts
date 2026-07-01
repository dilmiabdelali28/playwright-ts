import fs from "node:fs";
import path from "node:path";

import {
  loadEnvironmentConfig,
  resolveFixturesRoot,
} from "@helpers/auth/environment-fixtures";
import { expect, type Page } from "@playwright/test";

type UserRecord = {
  login: string;
  Password: string;
  roles?: string[];
};

export type MyFonciaUser = {
  login: string;
  password: string;
  roles: string[];
  myFonciaBaseUrl: string;
};

const ROLE_QUALITY_MAP: Record<string, string> = {
  "CO-OWNER": "CO_OWNER",
  LESSOR: "LANDLORD",
  TENANT: "TENANT",
};

function resolveQuality(role: string): string {
  return ROLE_QUALITY_MAP[role] ?? "CO_OWNER";
}

function isAccountSelectionPath(pathname: string): boolean {
  return /^\/account\/?$/.test(pathname);
}

function isLoggedInPath(pathname: string): boolean {
  return /\/account\/[^/]+/.test(pathname);
}

/**
 * Handles intermediate /account screens after login: role selection (multi-
 * profile users) and account selection (multi-account users). Repeats until
 * the URL leaves /account or the deadline is reached.
 */
export async function completeMyFonciaSelectionScreen(
  page: Page,
  role: string,
  options: { timeoutMs?: number } = {},
): Promise<void> {
  const quality = resolveQuality(role);
  const deadline = Date.now() + (options.timeoutMs ?? 30000);

  while (Date.now() < deadline) {
    const pathname = new URL(page.url()).pathname;
    if (!isAccountSelectionPath(pathname)) {
      return;
    }

    const qualityButton = page.locator(`button[quality="${quality}"]`).first();
    const accessButton = page
      .getByRole("button", { name: /Accéder au compte/i })
      .first();

    const qualityVisible = await qualityButton
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const accessVisible =
      !qualityVisible &&
      (await accessButton.isVisible({ timeout: 1000 }).catch(() => false));

    if (!qualityVisible && !accessVisible) {
      await page.waitForTimeout(500);
      continue;
    }

    const target = qualityVisible ? qualityButton : accessButton;
    await target.click();
    await page
      .waitForURL(
        (url) =>
          isLoggedInPath(url.pathname) || !isAccountSelectionPath(url.pathname),
        { timeout: 15000 },
      )
      .catch(() => undefined);
  }
}

export function loadMyFonciaUser(
  userName: string,
  fixturesDir?: string,
): MyFonciaUser {
  const root = resolveFixturesRoot(fixturesDir);
  const usersPath = path.join(root, "users_dev.json");
  const users = JSON.parse(fs.readFileSync(usersPath, "utf8")) as Record<
    string,
    UserRecord
  >;

  const selectedUser = users[userName];
  if (!selectedUser?.login || !selectedUser.Password) {
    throw new Error(
      `MyFoncia user "${userName}" not found or missing credentials in ${usersPath}.`,
    );
  }

  const environmentConfig = loadEnvironmentConfig(root);
  const myFonciaBaseUrl = environmentConfig.env?.MYFONCIA?.BASE_URL;
  if (!myFonciaBaseUrl) {
    throw new Error("MYFONCIA.BASE_URL not found in environment config.");
  }

  return {
    login: selectedUser.login,
    password: selectedUser.Password,
    roles: selectedUser.roles ?? [],
    myFonciaBaseUrl,
  };
}

/**
 * Logs into the MyFoncia portal.
 *
 * The login form checks via a `LoginCheck` GraphQL query whether the user
 * authenticates through the Okta widget or the native password field.
 * After a successful login, if the user has multiple roles, a role-selection
 * screen appears and the caller-supplied `role` is selected.
 */
export async function loginToMyFoncia(
  page: Page,
  user: MyFonciaUser,
  role: string,
): Promise<void> {
  await page.goto(`${user.myFonciaBaseUrl}/login`, {
    waitUntil: "domcontentloaded",
  });

  await page.locator('input[name="username"]').fill(user.login);

  // Buffer the LoginCheck response to decide which password field to use.
  let isOkta = false;
  const loginCheckPromise = page.waitForResponse(
    async (r) => {
      if (r.request().method() !== "POST" || !r.url().includes("/graphql")) {
        return false;
      }
      const postData = r.request().postData() ?? "";
      return postData.includes("LoginCheck") || postData.includes("loginCheck");
    },
    { timeout: 15000 },
  );
  await page.locator('button[data-cy="login-submit"]').click();

  const loginCheckResponse = await loginCheckPromise.catch(() => null);
  if (loginCheckResponse) {
    try {
      const body = (await loginCheckResponse.json()) as {
        data?: { loginCheck?: { isLoginWithOktaEnabled?: boolean } };
      };
      isOkta = !!body.data?.loginCheck?.isLoginWithOktaEnabled;
    } catch {
      // ignore — assume native login
    }
  }

  if (isOkta) {
    await page
      .locator(
        '#okta-sign-in-widget input[name="mui-input-credentials.passcode"]',
      )
      .fill(user.password);
    await page
      .locator('#okta-sign-in-widget input.button[type="submit"]')
      .click();
  } else {
    await page.locator('input[name="password"]').fill(user.password);
    await page.locator('button[data-cy="login-submit"]').click();
  }

  // Wait until we reach either the home page or an intermediate selection screen.
  await page
    .waitForURL(
      (url) =>
        isLoggedInPath(url.pathname) || isAccountSelectionPath(url.pathname),
      { timeout: 30000 },
    )
    .catch(() => undefined);

  await completeMyFonciaSelectionScreen(page, role);

  await assertMyFonciaLoggedIn(page);
}

export async function assertMyFonciaLoggedIn(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/account\/[^/]/, { timeout: 30000 });
}

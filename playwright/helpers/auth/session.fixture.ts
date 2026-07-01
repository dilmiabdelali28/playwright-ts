import fs from "node:fs";

import {
  assertLoggedInLanding,
  assertRedirectedToOkta,
  loadPlaywrightAdbUser,
  resolveOktaIssuer,
  submitOktaCredentials,
  visitAdbLoginPage,
} from "@helpers/auth/adb-login";
import {
  assertBoLoggedInLanding,
  getOktaAccessTokenWithRetry,
  loadBoUserFromFixtures,
  loginToBo,
} from "@helpers/auth/bo-auth";
import type { BoUser } from "@helpers/auth/bo-auth";
import {
  hasValidStorageState,
  persistStorageStateAtomically,
  storageStatePath,
} from "@helpers/auth/storage";
import { TEST_CONFIG } from "@helpers/common/test-config";
import type { BrowserContext, Page } from "@playwright/test";

import { baseTest as base, expect } from "../../report/base.fixture";

type SessionFixtures = {
  sessionFor: (identity: string) => Promise<Page>;
  boUser: BoUser;
  boAccessToken: string;
};

export const test = base.extend<SessionFixtures>({
  sessionFor: [
    async ({ browser }, use, testInfo) => {
      const sessions = new Map<
        string,
        { context: BrowserContext; page: Page }
      >();

      async function sessionFor(identity: string): Promise<Page> {
        if (sessions.has(identity)) {
          return sessions.get(identity)!.page;
        }

        const colonIndex = identity.indexOf(":");
        const app = identity.slice(0, colonIndex);
        const rawName = identity.slice(colonIndex + 1);
        const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        const savedStorage = storageStatePath(identity);
        const hasStorageState = hasValidStorageState(savedStorage);

        const context = await browser.newContext({
          ...(hasStorageState ? { storageState: savedStorage } : {}),
          recordVideo: { dir: testInfo.outputDir },
        });
        const page = await context.newPage();

        let freshLogin = false;

        if (app === "bo") {
          const user = loadBoUserFromFixtures(
            userName,
            TEST_CONFIG.fixturesDir,
          );
          if (hasStorageState) {
            await page.goto(user.boBaseUrl, { waitUntil: "domcontentloaded" });
            // If the BO session is stale (new deployment cleared localStorage),
            // assertBoLoggedInLanding will fail. Fall back to a full Okta login
            // so the test can continue without manual intervention.
            try {
              await assertBoLoggedInLanding(page);
            } catch {
              await loginToBo(page, user);
              freshLogin = true;
            }
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
          } else {
            await loginToBo(page, user);
            freshLogin = true;
          }
        } else if (app === "adb") {
          const user = loadPlaywrightAdbUser(userName, TEST_CONFIG.fixturesDir);
          if (hasStorageState) {
            await page.goto(user.adbBaseUrl, { waitUntil: "domcontentloaded" });

            // Read localStorage immediately after navigation: if no valid Okta
            // token is present (missing or expired), skip the 40s landing wait
            // and trigger a full Okta login straight away.
            const hasValidToken = await page
              .evaluate(() => {
                try {
                  const raw = localStorage.getItem("okta-token-storage");
                  if (!raw) {
                    return false;
                  }
                  const parsed = JSON.parse(raw) as {
                    accessToken?: { accessToken?: string; expiresAt?: number };
                  };
                  const token = parsed.accessToken;
                  if (!token?.accessToken) {
                    return false;
                  }
                  // Treat token as expired if it lapses within the next 60 s.
                  if (
                    token.expiresAt &&
                    token.expiresAt < Date.now() / 1000 + 60
                  ) {
                    return false;
                  }
                  return true;
                } catch {
                  return false;
                }
              })
              .catch(() => false);

            if (hasValidToken) {
              // Token looks fresh — race between landing success and an Okta
              // redirect. If the app redirects to Okta (revoked token, new
              // deployment…) we detect it in ~2-3 s instead of waiting 40 s
              // for assertLoggedInLanding to time out.
              const landingPromise = assertLoggedInLanding(page).then(
                () => "landed" as const,
              );
              const redirectPromise = page
                .waitForURL(
                  (url) => {
                    const s = url.toString();
                    return (
                      s.includes("/oauth2/") ||
                      s.includes("login.") ||
                      s.includes("okta")
                    );
                  },
                  { timeout: 40000 },
                )
                .then(() => "okta-redirect" as const);

              const raceResult = await Promise.race([
                landingPromise,
                redirectPromise,
              ]).catch(() => "failed" as const);

              // Silence unhandled rejections on the losing promise.
              landingPromise.catch(() => undefined);
              redirectPromise.catch(() => undefined);

              if (raceResult === "okta-redirect" || raceResult === "failed") {
                const oktaIssuer = await resolveOktaIssuer(
                  page,
                  user.adbBaseUrl,
                  process.env.OKTA_ISSUER,
                );
                await assertRedirectedToOkta(page, oktaIssuer);
                await submitOktaCredentials(page, user.login, user.password);
                await assertLoggedInLanding(page);
                freshLogin = true;
              }
            } else {
              // No valid token in localStorage — but the app may still be
              // authenticated via a refresh token or cookie. Race between the
              // ADB landing and an actual Okta redirect to handle both cases.
              const landingPromise = assertLoggedInLanding(page).then(
                () => "landed" as const,
              );
              const redirectPromise = page
                .waitForURL(
                  (url) => {
                    const s = url.toString();
                    return (
                      s.includes("/oauth2/") ||
                      s.includes("login.") ||
                      s.includes("okta")
                    );
                  },
                  { timeout: 40000 },
                )
                .then(() => "okta-redirect" as const);

              const raceResult = await Promise.race([
                landingPromise,
                redirectPromise,
              ]).catch(() => "failed" as const);

              landingPromise.catch(() => undefined);
              redirectPromise.catch(() => undefined);

              if (raceResult === "okta-redirect" || raceResult === "failed") {
                const oktaIssuer = await resolveOktaIssuer(
                  page,
                  user.adbBaseUrl,
                  process.env.OKTA_ISSUER,
                );
                await assertRedirectedToOkta(page, oktaIssuer);
                await submitOktaCredentials(page, user.login, user.password);
                await assertLoggedInLanding(page);
                freshLogin = true;
              }
              // If "landed": app refreshed the session silently — no re-login needed.
            }
          } else {
            await visitAdbLoginPage(page, user.adbBaseUrl);
            const oktaIssuer = await resolveOktaIssuer(
              page,
              user.adbBaseUrl,
              process.env.OKTA_ISSUER,
            );
            await assertRedirectedToOkta(page, oktaIssuer);
            await submitOktaCredentials(page, user.login, user.password);
            await assertLoggedInLanding(page);
            freshLogin = true;
          }
        } else {
          throw new Error(
            `Unknown app "${app}" in identity "${identity}". Use "bo:username" or "adb:username".`,
          );
        }

        if (freshLogin) {
          await persistStorageStateAtomically(context, identity);
        }

        sessions.set(identity, { context, page });
        return page;
      }

      await use(sessionFor);

      for (const [identity, { context, page }] of sessions.entries()) {
        const videoPath =
          (await page
            .video()
            ?.path()
            .catch(() => null)) ?? null;
        await context.close().catch(() => undefined);
        if (videoPath && fs.existsSync(videoPath)) {
          await testInfo
            .attach(`video-${identity}`, {
              path: videoPath,
              contentType: "video/webm",
            })
            .catch(() => undefined);
        }
      }
    },
    { scope: "test" },
  ],

  boUser: async ({}, use) => {
    const user = loadBoUserFromFixtures(
      TEST_CONFIG.boDefaultUser,
      TEST_CONFIG.fixturesDir,
    );
    await use(user);
  },

  boAccessToken: async ({ sessionFor }, use) => {
    const boPage = await sessionFor(
      `bo:${TEST_CONFIG.boDefaultUser.toLowerCase()}`,
    );
    const token = await getOktaAccessTokenWithRetry(boPage);
    if (!token) {
      throw new Error(
        "Unable to resolve BO access token from browser session.",
      );
    }
    await use(token);
  },
});

export { expect };

import fs from "node:fs";

import {
  assertMyFonciaLoggedIn,
  completeMyFonciaSelectionScreen,
  loadMyFonciaUser,
  loginToMyFoncia,
} from "@helpers/auth/myfoncia-login";
import {
  hasValidStorageState,
  persistStorageStateAtomically,
  storageStatePath,
} from "@helpers/auth/storage";
import { TEST_CONFIG } from "@helpers/common/test-config";
import type { BrowserContext, Page } from "@playwright/test";

import { baseTest as base, expect } from "../../report/base.fixture";

type MyFonciaSessionFixtures = {
  /**
   * Returns (or reuses) a Page already authenticated on MyFoncia.
   *
   * Pass the bare username as it appears in `users_dev.json` (case-
   * insensitive).  The role is resolved automatically from the user's
   * `roles` array:  CO-OWNER is preferred over LESSOR, which is preferred
   * over TENANT, otherwise the first declared role is used.
   *
   * @example
   *   const page = await sessionFor("charles");  // TENANT
   *   const page = await sessionFor("eric");      // CO-OWNER (multi-role user)
   */
  sessionFor: (name: string) => Promise<Page>;
};

/** Picks the best role for a user that may belong to several profiles. */
function resolveRole(roles: string[]): string {
  const preference = ["CO-OWNER", "LESSOR", "TENANT"];
  for (const preferred of preference) {
    if (roles.includes(preferred)) {
      return preferred;
    }
  }
  return roles[0] ?? "CO-OWNER";
}

export const test = base.extend<MyFonciaSessionFixtures>({
  sessionFor: [
    async ({ browser }, use, testInfo) => {
      const sessions = new Map<
        string,
        { context: BrowserContext; page: Page }
      >();

      async function sessionFor(name: string): Promise<Page> {
        if (sessions.has(name)) {
          return sessions.get(name)!.page;
        }

        const userName = name.charAt(0).toUpperCase() + name.slice(1);
        const mfUser = loadMyFonciaUser(userName, TEST_CONFIG.fixturesDir);
        const role = resolveRole(mfUser.roles);

        const identity = `myfoncia-${name.toLowerCase()}`;
        const savedStorage = storageStatePath(identity);
        const hasStorageState = hasValidStorageState(savedStorage);

        const context = await browser.newContext({
          ...(hasStorageState ? { storageState: savedStorage } : {}),
          recordVideo: { dir: testInfo.outputDir },
        });
        const page = await context.newPage();

        let freshLogin = false;

        if (hasStorageState) {
          await page.goto(mfUser.myFonciaBaseUrl, {
            waitUntil: "domcontentloaded",
          });
          try {
            // Short timeout: fast-fail if the session is expired so the
            // re-login has enough time within the test timeout budget.
            await expect(page).toHaveURL(/\/account\/[^/]/, {
              timeout: 8000,
            });
          } catch {
            // If we landed on /account (account-selection screen), the session
            // is still valid — just pick the right account without re-logging in.
            const isAccountSelection = /^\/account\/?$/.test(
              new URL(page.url()).pathname,
            );
            if (isAccountSelection) {
              await completeMyFonciaSelectionScreen(page, role);
            } else {
              await loginToMyFoncia(page, mfUser, role);
              freshLogin = true;
            }
          }
        } else {
          await loginToMyFoncia(page, mfUser, role);
          freshLogin = true;
        }

        if (freshLogin) {
          await persistStorageStateAtomically(context, identity);
        }

        await assertMyFonciaLoggedIn(page);

        sessions.set(name, { context, page });
        return page;
      }

      await use(sessionFor);

      for (const [name, { context, page }] of sessions.entries()) {
        const videoPath =
          (await page
            .video()
            ?.path()
            .catch(() => null)) ?? null;
        await context.close().catch(() => undefined);
        if (videoPath && fs.existsSync(videoPath)) {
          await testInfo
            .attach(`video-${name}`, {
              path: videoPath,
              contentType: "video/webm",
            })
            .catch(() => undefined);
        }
      }
    },
    { scope: "test" },
  ],
});

export { expect };

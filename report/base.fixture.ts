import fs from "node:fs";
import path from "node:path";

import { test as base } from "@playwright/test";
import { allure } from "allure-playwright";

/**
 * Base fixture that auto-sets Allure suite hierarchy from the spec file path.
 *
 * All specs must import `test` from this file (or from session.fixture.ts
 * which extends it) — never directly from "@playwright/test".
 *
 * Mapping:
 *   tests/tests-smoke/<domain>/<subDomain?>/<spec>.spec.ts
 *     → parentSuite : tag @bo → "BO", @adb → "ADB", else → "E2E"
 *     → suite       : domain folder capitalised  (e.g. "Invoices")
 *     → subSuite    : sub-domain folder if present (e.g. "accountingControls")
 */
export const baseTest = base.extend<{ _allureHierarchy: void }>({
  context: async ({ context }, use, testInfo) => {
    await use(context);
    const videoPaths = await Promise.all(
      context.pages().map((p) =>
        p
          .video()
          ?.path()
          .catch(() => null),
      ),
    );
    await context.close().catch(() => undefined);
    for (const videoPath of videoPaths) {
      if (videoPath && fs.existsSync(videoPath)) {
        await testInfo
          .attach("video", { path: videoPath, contentType: "video/webm" })
          .catch(() => undefined);
      }
    }
  },
  _allureHierarchy: [
    async ({}, use, testInfo) => {
      const parts = testInfo.file.split(path.sep);
      const smokeIdx = parts.findIndex((p) => p === "tests-e2e");
      const specFileName = path.basename(
        testInfo.file,
        path.extname(testInfo.file),
      );

      if (smokeIdx >= 0) {
        // Collect all path segments between tests-smoke/ and the spec file.
        // e.g. accounting/rentalManagement/ADRF/E2E.spec.ts
        //   → segments = ["accounting", "rentalManagement", "ADRF"]
        const segments: string[] = [];
        for (let i = smokeIdx + 1; i < parts.length - 1; i++) {
          segments.push(parts[i]);
        }

        await allure.parentSuite("Tests E2E");

        if (segments[0]) {
          const domainLabel =
            segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
          await allure.suite(domainLabel);
        }

        const subPathSegments = [...segments.slice(1), specFileName].filter(
          Boolean,
        );
        const subPath = subPathSegments.join(" > ");
        await allure.subSuite(subPath);
      }

      await allure.severity("critical");
      await use();
    },
    { auto: true, scope: "test" },
  ],
});

export { expect } from "@playwright/test";

import path from "node:path";

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.ts",
  fullyParallel: true,
  retries: 1,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    [
      "allure-playwright",
      { resultsDir: path.join(__dirname, "report/allure-results") },
    ],
  ],
  timeout: 120_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "https://www.saucedemo.com/",
    actionTimeout: 5_000,
    navigationTimeout: 10_000,
    headless: true,
    channel: process.env.CI ? "chrome" : undefined,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on",
    viewport: { width: 1920, height: 1080 },
  },
});

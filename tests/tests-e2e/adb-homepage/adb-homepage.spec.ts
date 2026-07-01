import { expect } from "@playwright/test";

import { AdbNavBar } from "@/pages/adb/adb-nav-bar.page";

import { test } from "../../../helpers/auth/session.fixture";

// Source migration: homepage.feature

const mainMenuItems = [
  { menuItem: "Missions", itemPageUrl: "/portfolio/mission" },
  { menuItem: "Tickets", itemPageUrl: "/portfolio/ticket" },
  { menuItem: "Immeubles", itemPageUrl: "/portfolio/building" },
  { menuItem: "Copropriétaires", itemPageUrl: "/portfolio/co-owner" },
  { menuItem: "Fournisseurs", itemPageUrl: "/portfolio/supplier" },
  { menuItem: "Facturation", itemPageUrl: "/portfolio/billing" },
];

const toolsMenuItems = [
  { menuItem: "Simulation de quote part", itemPageUrl: "/work-simulations" },
  { menuItem: "Push info", itemPageUrl: "/push-info" },
  { menuItem: "Courriers sortants", itemPageUrl: "/outgoing-mails" },
];

for (const { menuItem, itemPageUrl } of mainMenuItems) {
  test(
    `Main menu - ${menuItem}`,
    { tag: ["@smoke", "@adb", "@homepage"] },

    async ({ sessionFor }) => {
      const camille = await test.step('Camille is logged in "ADB"', () =>
        sessionFor("adb:Camille"));
      const adbNavBar = new AdbNavBar(camille);

      await test.step(`she clicks on "${menuItem}" button from the header`, async () => {
        await adbNavBar.clickMenu(menuItem);
      });

      await test.step(`she should land at "${itemPageUrl}"`, async () => {
        await expect(camille).toHaveURL(
          (url) => new URL(url).pathname === itemPageUrl,
        );
      });
    },
  );
}

for (const { menuItem, itemPageUrl } of toolsMenuItems) {
  test(
    `Tools menu - ${menuItem}`,
    { tag: ["@smoke", "@adb", "@homepage"] },
    async ({ sessionFor }) => {
      const camille = await test.step('Camille is logged in "ADB"', () =>
        sessionFor("adb:Camille"));
      const adbNavBar = new AdbNavBar(camille);

      await test.step(`she clicks on "${menuItem}" button in Tools menu from the navbar`, async () => {
        await adbNavBar.openToolsMenu();
        await adbNavBar.clickTool(menuItem);
      });

      await test.step(`she should land at "${itemPageUrl}"`, async () => {
        await expect(camille).toHaveURL(
          (url) => new URL(url).pathname === itemPageUrl,
        );
      });
    },
  );
}

import { test, expect } from "@playwright/test";

import { SauceDemoPage } from "@/pages/saucedemo/saucedemo.page";
import users from "$fixtures/users_saucedemo.json";

const Pascale = users.Pascale;
const Bloque = users.Bloque;

test.describe("Sauce Demo", () => {
  let saucedemo: SauceDemoPage;

  test.beforeEach(async ({ page }) => {
    saucedemo = new SauceDemoPage(page);
    await saucedemo.goto();
  });

  test(
    "un utilisateur valide se connecte et voit l'inventaire",
    { tag: ["@smoke", "@saucedemo"] },
    async ({ page }) => {
      await test.step("il se connecte avec standard_user", async () => {
        await saucedemo.login(Pascale.login, Pascale.password);
      });

      await test.step("il atterrit sur la page inventaire", async () => {
        await expect(page).toHaveURL(/.*inventory\.html/);
        await expect(saucedemo.inventoryList).toBeVisible();
      });
    },
  );

  test(
    "un utilisateur bloqué voit un message d'erreur",
    { tag: ["@smoke", "@saucedemo"] },
    async ({ page }) => {
      await test.step("il tente de se connecter avec locked_out_user", async () => {
        await saucedemo.login(Bloque.login, Bloque.password);
      });

      await test.step("un message d'erreur s'affiche et il reste sur le login", async () => {
        await expect(saucedemo.errorMessage).toBeVisible();
        await expect(saucedemo.errorMessage).toContainText(
          "Sorry, this user has been locked out",
        );
        await expect(page).not.toHaveURL(/.*inventory\.html/);
      });
    },
  );

  test(
    "ajouter un produit au panier met à jour le badge",
    { tag: ["@saucedemo"] },
    async () => {
      await test.step("il se connecte avec standard_user", async () => {
        await saucedemo.login(Pascale.login, Pascale.password);
        await expect(saucedemo.inventoryList).toBeVisible();
      });

      await test.step("il ajoute le Sauce Labs Backpack au panier", async () => {
        await saucedemo.addProductToCart("Sauce Labs Backpack");
      });

      await test.step("le badge du panier affiche 1 article", async () => {
        await expect(saucedemo.cartBadge).toHaveText("1");
      });
    },
  );
});

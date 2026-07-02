import { test, expect } from "@playwright/test";

import { SauceDemoPage } from "@/pages/saucedemo/saucedemo.page";
import users from "$fixtures/users_saucedemo.json";

const Pascale = users.Pascale;

test.describe("Sauce Demo — parcours avancés", () => {
  let saucedemo: SauceDemoPage;

  test.beforeEach(async ({ page }) => {
    saucedemo = new SauceDemoPage(page);
    await saucedemo.goto();
    await saucedemo.login(Pascale.login, Pascale.password);
    await expect(saucedemo.inventoryList).toBeVisible();
  });

  // Jeu de données (JDD) consommé par les tests ci-dessous.
  const products = {
    backpack: "Sauce Labs Backpack",
    bikeLight: "Sauce Labs Bike Light",
    boltTshirt: "Sauce Labs Bolt T-Shirt",
  };
  const checkout = {
    firstName: "Pascale",
    lastName: "Test",
    postalCode: "75001",
  };

  test(
    "parcours de commande complet jusqu'à la confirmation",
    { tag: ["@smoke", "@e2e"] },
    async ({ page }) => {
      await test.step("il ajoute deux produits au panier", async () => {
        await saucedemo.addProductToCart(products.backpack);
        await saucedemo.addProductToCart(products.bikeLight);
        await expect(saucedemo.cartBadge).toHaveText("2");
      });

      await test.step("il ouvre le panier qui contient les deux articles", async () => {
        await saucedemo.openCart();
        await expect(saucedemo.cartItems).toHaveCount(2);
      });

      await test.step("il finalise la commande", async () => {
        await saucedemo.checkout(
          checkout.firstName,
          checkout.lastName,
          checkout.postalCode,
        );
      });

      await test.step("la commande est confirmée", async () => {
        await expect(page).toHaveURL(/.*checkout-complete\.html/);
        await expect(saucedemo.completeHeader).toHaveText(
          "Thank you for your order!",
        );
      });
    },
  );

  test(
    "le tri par prix croissant ordonne bien les produits",
    { tag: ["@smoke"] },
    async () => {
      await test.step("il trie par prix croissant (low to high)", async () => {
        await saucedemo.sortBy("lohi");
      });

      await test.step("les prix sont bien triés du plus bas au plus haut", async () => {
        const prices = await saucedemo.productPrices();
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sorted);
      });
    },
  );

  test(
    "le tri par nom décroissant (Z à A) ordonne bien les produits",
    { tag: ["@smoke"] },
    async () => {
      await saucedemo.sortBy("za");
      const names = await saucedemo.productNames();
      const sorted = [...names].sort().reverse();
      expect(names).toEqual(sorted);
    },
  );

  test(
    "retirer un article depuis le panier met à jour le badge",
    { tag: ["@smoke"] },
    async () => {
      await test.step("il ajoute deux articles", async () => {
        await saucedemo.addProductToCart(products.backpack);
        await saucedemo.addProductToCart(products.boltTshirt);
        await expect(saucedemo.cartBadge).toHaveText("2");
      });

      await test.step("il retire un article dans le panier", async () => {
        await saucedemo.openCart();
        await saucedemo.removeProductFromCart(products.backpack);
      });

      await test.step("le panier ne contient plus qu'un article", async () => {
        await expect(saucedemo.cartItems).toHaveCount(1);
        await expect(saucedemo.cartBadge).toHaveText("1");
      });
    },
  );

  test(
    "le checkout refuse un formulaire incomplet",
    { tag: ["@smoke"] },
    async () => {
      await saucedemo.addProductToCart(products.backpack);
      await saucedemo.openCart();
      await saucedemo.checkoutButton.click();

      await test.step("il continue sans renseigner le nom", async () => {
        await saucedemo.continueButton.click();
      });

      await test.step("un message d'erreur signale le champ manquant", async () => {
        await expect(saucedemo.errorMessage).toContainText(
          "First Name is required",
        );
      });
    },
  );

  test(
    "la déconnexion ramène à la page de login",
    { tag: ["@smoke"] },
    async ({ page }) => {
      await saucedemo.logout();
      await expect(page).toHaveURL("/");
      await expect(saucedemo.loginButton).toBeVisible();
    },
  );
});

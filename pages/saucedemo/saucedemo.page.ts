import { type Page, type Locator } from "@playwright/test";

const BASE_URL = "https://www.saucedemo.com/";

/**
 * Page object for the Sauce Demo app (https://www.saucedemo.com/).
 * Groups the login screen and the inventory / cart interactions used by
 * the accompanying spec.
 */
export class SauceDemoPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly inventoryList: Locator;
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator("#user-name");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#login-button");
    this.errorMessage = page.locator('[data-test="error"]');
    this.inventoryList = page.locator(".inventory_list");
    this.cartBadge = page.locator(".shopping_cart_badge");
  }

  /** Opens the login page. */
  async goto(): Promise<void> {
    await this.page.goto(BASE_URL);
  }

  /** Fills credentials and submits the login form. */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Adds a product to the cart by its visible name (e.g. "Sauce Labs Backpack"). */
  async addProductToCart(productName: string): Promise<void> {
    const item = this.page
      .locator(".inventory_item")
      .filter({ hasText: productName });
    await item.getByRole("button", { name: "Add to cart" }).click();
  }
}

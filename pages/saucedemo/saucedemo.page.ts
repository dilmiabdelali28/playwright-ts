import { type Page, type Locator } from "@playwright/test";

/**
 * Page object for the Sauce Demo app (https://www.saucedemo.com/).
 * Groups the login screen, inventory, cart, checkout and menu interactions.
 * The base URL is configured in playwright.config.ts (`use.baseURL`).
 */
export class SauceDemoPage {
  // Login
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  // Inventory
  readonly inventoryList: Locator;
  readonly inventoryItemNames: Locator;
  readonly inventoryItemPrices: Locator;
  readonly sortSelect: Locator;

  // Cart
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly cartItems: Locator;

  // Checkout
  readonly checkoutButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly summaryTotal: Locator;
  readonly completeHeader: Locator;

  // Menu
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator("#user-name");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#login-button");
    this.errorMessage = page.locator('[data-test="error"]');

    this.inventoryList = page.locator(".inventory_list");
    this.inventoryItemNames = page.locator(".inventory_item_name");
    this.inventoryItemPrices = page.locator(".inventory_item_price");
    this.sortSelect = page.locator('[data-test="product-sort-container"]');

    this.cartBadge = page.locator(".shopping_cart_badge");
    this.cartLink = page.locator(".shopping_cart_link");
    this.cartItems = page.locator(".cart_item");

    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.summaryTotal = page.locator(".summary_total_label");
    this.completeHeader = page.locator(".complete-header");

    this.menuButton = page.locator("#react-burger-menu-btn");
    this.logoutLink = page.locator("#logout_sidebar_link");
  }

  /** Opens the login page (resolved against `use.baseURL`). */
  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  /** Fills credentials and submits the login form. */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Logs the current user out via the burger menu. */
  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  /** Adds a product to the cart by its visible name (e.g. "Sauce Labs Backpack"). */
  async addProductToCart(productName: string): Promise<void> {
    await this.itemByName(productName)
      .getByRole("button", { name: "Add to cart" })
      .click();
  }

  /** Removes a product from the cart/inventory by its visible name. */
  async removeProductFromCart(productName: string): Promise<void> {
    await this.itemByName(productName)
      .getByRole("button", { name: "Remove" })
      .click();
  }

  /** Opens the cart page. */
  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  /** Sorts the inventory. `value` is the option value, e.g. "lohi", "hilo", "az", "za". */
  async sortBy(value: "az" | "za" | "lohi" | "hilo"): Promise<void> {
    await this.sortSelect.selectOption(value);
  }

  /** Returns the product names currently displayed, in order. */
  async productNames(): Promise<string[]> {
    return this.inventoryItemNames.allTextContents();
  }

  /** Returns the product prices currently displayed, in order, as numbers. */
  async productPrices(): Promise<number[]> {
    const texts = await this.inventoryItemPrices.allTextContents();
    return texts.map((t) => Number(t.replace("$", "")));
  }

  /** Fills the checkout information form and continues to the overview. */
  async fillCheckoutInfo(
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  /**
   * Runs the full checkout from the cart page: information form, overview,
   * then confirmation.
   */
  async checkout(
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await this.checkoutButton.click();
    await this.fillCheckoutInfo(firstName, lastName, postalCode);
    await this.finishButton.click();
  }

  private itemByName(productName: string): Locator {
    return this.page
      .locator(".inventory_item, .cart_item")
      .filter({ hasText: productName });
  }
}

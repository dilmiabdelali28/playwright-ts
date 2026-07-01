import { completeMyFonciaSelectionScreen } from "@helpers/auth/myfoncia-login";
import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Page } from "@playwright/test";

/** Maps sidebar link labels to the GraphQL operation they trigger. */
const SIDEBAR_OPERATION_MAP: Record<string, string> = {
  "Mes demandes": "getTickets",
  "Ma comptabilité": "getAccountingBalance",
  "Mes paiements": "getPaymentModeData",
  "Offres et services": "getAccount",
  "Mes biens": "getEstateList",
  "Mes documents": "getDocumentCategories",
  "Mon assemblée générale": "getGeneralAssemblies",
  "Mon conseil syndical": "getCouncilMissionMeetings",
};

export class MyFonciaPage {
  constructor(private readonly page: Page) {}

  /**
   * Clicks the first "Accéder au compte" button on the account-selection
   * screen (/account) for the given account type.
   *
   * @param quality  "CO_OWNER" | "LANDLORD" | "TENANT" — maps to the card
   *   label text ("COPROPRIÉTAIRE", "BAILLEUR", "LOCATAIRE").  When omitted,
   *   the first available button is clicked.
   */
  /**
   * Clicks the first "Accéder au compte" button on the account-selection
   * screen (/account) for the given account type.
   *
   * No-op if the page is not on the /account selection screen.
   *
   * @param quality  "CO_OWNER" | "LANDLORD" | "TENANT" — maps to the card
   *   label text ("COPROPRIÉTAIRE", "BAILLEUR", "LOCATAIRE").  When omitted,
   *   the first available button is clicked.
   */
  async clickFirstAccount(quality?: string): Promise<void> {
    const currentPath = new URL(this.page.url()).pathname;
    if (!/^\/account\/?$/.test(currentPath)) {
      return;
    }

    const role =
      quality === "LANDLORD"
        ? "LESSOR"
        : quality === "TENANT"
          ? "TENANT"
          : "CO-OWNER";

    await completeMyFonciaSelectionScreen(this.page, role, {
      timeoutMs: TEST_CONFIG.timeouts.long,
    });
  }

  /**
   * Clicks a sidebar link and waits for the corresponding GraphQL response.
   */
  async navigateSidebar(label: string): Promise<void> {
    const operationName = SIDEBAR_OPERATION_MAP[label];

    const gqlWait = operationName
      ? this.page
          .waitForResponse(
            (r) => {
              if (
                r.request().method() !== "POST" ||
                !r.url().includes("/graphql")
              ) {
                return false;
              }
              return (r.request().postData() ?? "").includes(operationName);
            },
            { timeout: TEST_CONFIG.timeouts.long },
          )
          .catch(() => null)
      : Promise.resolve(null);

    await this.page.locator(`a:has-text("${label}")`).first().click();
    await gqlWait;
  }

  /**
   * Asserts that a div containing the given title text is visible.
   * Mirrors the Cypress `CommonMyFoncia.checkTitle` selector.
   */
  async assertPageTitle(title: string): Promise<void> {
    await expect(
      this.page.locator(`div:has-text("${title}")`).first(),
    ).toBeVisible({ timeout: TEST_CONFIG.timeouts.medium });
  }

  /**
   * Asserts that anchor elements with each of the given labels are visible.
   */
  async assertLinksVisible(labels: string[]): Promise<void> {
    for (const label of labels) {
      await expect(
        this.page.locator(`a:has-text("${label}")`).first(),
      ).toBeVisible({ timeout: TEST_CONFIG.timeouts.medium });
    }
  }

  /**
   * Clicks an anchor link and waits for DOM content to load.
   */
  async clickLink(label: string): Promise<void> {
    await this.page.locator(`a:has-text("${label}")`).first().click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Asserts table column headers.
   *
   * @param columnRows  Each inner array is one set of expected column headers.
   *   When there are multiple inner arrays the first is checked against the
   *   first table, the second against the second table, etc.  This mirrors
   *   the Gherkin multi-row DataTable for pages that show several tables
   *   (e.g. "Visites de l'immeuble" with two layouts).
   */
  async assertTableColumns(columnRows: string[][]): Promise<void> {
    const tables = this.page.locator("table");
    await tables
      .first()
      .waitFor({ state: "visible", timeout: TEST_CONFIG.timeouts.long });

    for (let i = 0; i < columnRows.length; i++) {
      const table = tables.nth(i);
      for (const col of columnRows[i]) {
        if (!col.trim()) {
          continue;
        }
        await expect(
          table.locator("th").filter({ hasText: col }).first(),
        ).toBeVisible({ timeout: TEST_CONFIG.timeouts.medium });
      }
    }
  }

  /**
   * Asserts that a button with the given label is visible.
   */
  async assertButtonVisible(label: string): Promise<void> {
    await expect(
      this.page.getByRole("button", { name: new RegExp(label, "i") }).first(),
    ).toBeVisible({ timeout: TEST_CONFIG.timeouts.medium });
  }
}

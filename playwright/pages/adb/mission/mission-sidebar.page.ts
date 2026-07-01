import { TEST_CONFIG } from "@helpers/common/test-config";
import { expect, type Page } from "@playwright/test";

const SIDEBAR = "[data-testid='LayoutSidenavLeft']";

const MISSION_STATUS_KIND: Record<string, string> = {
  "À traiter": "yellow",
  "En cours": "blue",
  Convoquée: "blue",
  Traitée: "green",
  Fermée: "red",
};

export class MissionSidebarPage {
  constructor(private readonly page: Page) {}

  async openPage(label: string): Promise<void> {
    const link = this.page
      .getByTestId("LayoutSidenavLeft")
      .getByRole("link", { name: label, exact: true });
    await expect(link).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(link).not.toHaveAttribute("disabled");
    await link.click();
  }

  async openPageByTestId(testId: string): Promise<void> {
    const link = this.page.locator(
      `${SIDEBAR} a:has([data-testid="${testId}"])`,
    );
    await expect(link).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(link).not.toHaveAttribute("disabled");
    await link.click();
  }

  async openSignaturesPage(): Promise<void> {
    const legacyLink = this.page.locator(
      `${SIDEBAR} a:has([data-testid="pageSignMinute"])`,
    );
    const docusignLink = this.page.locator(
      `${SIDEBAR} a:has([data-testid="pageSignMinuteNext"])`,
    );

    if (await docusignLink.isVisible()) {
      await expect(docusignLink).not.toHaveAttribute("disabled");
      await docusignLink.click();
      return;
    }

    await expect(legacyLink).toBeVisible({
      timeout: TEST_CONFIG.timeouts.long,
    });
    await expect(legacyLink).not.toHaveAttribute("disabled");
    await legacyLink.click();
  }

  async assertMissionStatus(
    status: string,
    statusLabel?: string,
  ): Promise<void> {
    const badge = this.page.locator(`${SIDEBAR} header [data-shadcn="badge"]`);
    await expect(badge).toHaveAttribute(
      "data-kind",
      MISSION_STATUS_KIND[status] ?? "blue",
      { timeout: 120000 },
    );

    if (statusLabel) {
      await expect(badge).toContainText(statusLabel);
    }
  }
}

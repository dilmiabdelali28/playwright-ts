import { TEST_CONFIG } from "@helpers/common/test-config";
import type { Page } from "@playwright/test";

export function waitForGraphqlOperation(
  page: Page,
  operationName?: string,
): Promise<unknown> {
  return page.waitForResponse(
    (response) => {
      if (!response.url().includes("/graphql") || response.status() !== 200) {
        return false;
      }

      if (!operationName) {
        return true;
      }

      return (response.request().postData() ?? "").includes(operationName);
    },
    { timeout: TEST_CONFIG.timeouts.long },
  );
}

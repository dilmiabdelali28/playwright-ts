import type { Page } from "@playwright/test";

export async function waitForResponseLike(
  page: Page,
  urlPart: string,
): Promise<void> {
  await page.waitForResponse((response) => response.url().includes(urlPart), {
    timeout: 15000,
  });
}

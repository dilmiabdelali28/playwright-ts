import type { Page, Response } from "@playwright/test";

export function waitForRestResponse(
  page: Page,
  urlPattern: RegExp | string,
  method: string,
  timeout: number,
): Promise<Response> {
  return page.waitForResponse(
    (response) => {
      const urlMatch =
        typeof urlPattern === "string"
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url());

      return urlMatch && response.request().method() === method;
    },
    { timeout },
  );
}

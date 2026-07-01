import type { Page } from "@playwright/test";

type GotoParams = {
  page: Page;
  baseUrl: string;
  path: string;
  waitUntil?: "commit" | "domcontentloaded" | "load" | "networkidle";
};

export async function goto({
  page,
  baseUrl,
  path,
  waitUntil = "domcontentloaded",
}: GotoParams): Promise<void> {
  await page.goto(new URL(path, baseUrl).toString(), { waitUntil });
}

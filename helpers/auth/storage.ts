import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { currentEnvSlug } from "@helpers/auth/environment-fixtures";
import type { BrowserContext } from "@playwright/test";

export { currentEnvSlug };

export const AUTH_DIR = path.resolve(__dirname, "../../auth");

export function storageStatePath(identity: string): string {
  const env = currentEnvSlug();
  return path.join(AUTH_DIR, env, `${identity.replace(":", "-")}.json`);
}

// Returns true only if the file exists AND parses as valid JSON. A corrupted
// state file (e.g. left over from a previous concurrent-write incident) would
// otherwise crash `browser.newContext({ storageState })` with "Unexpected
// non-whitespace character after JSON". Treat invalid files as missing so the
// fixture falls back to a fresh login and rewrites a clean file.
export function hasValidStorageState(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  try {
    JSON.parse(fs.readFileSync(filePath, "utf8"));
    return true;
  } catch {
    fs.rmSync(filePath, { force: true });
    return false;
  }
}

// Multiple Playwright workers (`fullyParallel: true`, --workers=2/3) can hit
// the same identity at once. `context.storageState({ path })` writes via a
// non-atomic `fs.writeFile`, so concurrent writes interleave and produce a
// JSON file with trailing garbage ("Unexpected non-whitespace character after
// JSON"). Write to a worker-unique temp file then `rename` — POSIX rename on
// the same partition is atomic, so readers always see a complete JSON.
export async function persistStorageStateAtomically(
  context: BrowserContext,
  identity: string,
): Promise<void> {
  const finalPath = storageStatePath(identity);
  const tmpPath = `${finalPath}.tmp.${process.pid}.${crypto.randomBytes(6).toString("hex")}`;
  try {
    await context.storageState({ path: tmpPath });
    fs.renameSync(tmpPath, finalPath);
  } catch (error) {
    fs.rmSync(tmpPath, { force: true });
    throw error;
  }
}

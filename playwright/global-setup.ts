import fs from "node:fs";
import path from "node:path";

import { AUTH_DIR, currentEnvSlug } from "@helpers/auth/storage";

const ALLURE_DIR = path.resolve(__dirname, "report/allure-results");

export default async function globalSetup(): Promise<void> {
  fs.rmSync(ALLURE_DIR, { recursive: true, force: true });
  fs.mkdirSync(path.join(AUTH_DIR, currentEnvSlug()), { recursive: true });
}

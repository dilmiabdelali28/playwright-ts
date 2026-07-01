import fs from "node:fs";
import path from "node:path";

import { TEST_CONFIG } from "@helpers/common/test-config";

type AdfReferenceSeed = {
  supplierId?: string;
};

export function loadAdfReferenceSeedSupplierId(): string {
  const filePath = path.resolve(
    TEST_CONFIG.fixturesDir,
    "datasets/bo/adf_reference_seed.json",
  );
  if (!fs.existsSync(filePath)) {
    return "";
  }

  const seed = JSON.parse(
    fs.readFileSync(filePath, "utf8"),
  ) as AdfReferenceSeed;
  return seed.supplierId || "";
}

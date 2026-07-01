import { PROJECT_PATHS } from "@helpers/config/project-paths";

export const TEST_CONFIG = {
  boDefaultUser: process.env.BO_TEST_USER ?? "Sofian",
  targetAgency: process.env.BO_TARGET_AGENCY ?? "FONCIA AGENCE CENTRALE",
  fixturesDir: process.env.PLAYWRIGHT_FIXTURES_DIR ?? PROJECT_PATHS.fixturesDir,
  tenorExternalId: process.env.TENOR_EXTERNAL_ID ?? "104",
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
    test: 120000,
  },
} as const;

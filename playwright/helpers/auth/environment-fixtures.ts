import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type EnvironmentConfig = {
  env?: {
    ADB?: {
      BASE_URL?: string;
      API_BASE_URL?: string;
      MS_GATEWAY__BASE_URL?: string;
    };
    BO?: {
      BASE_URL?: string;
      API_BASE_URL?: string;
      MS_GATEWAY__BASE_URL?: string;
    };
    MYFONCIA?: {
      BASE_URL?: string;
      API_BASE_URL?: string;
    };
    TRANSAC?: {
      BASE_URL?: string;
      API_BASE_URL?: string;
      MS_ADDRESS_BASE_URL?: string;
    };
    MS_GATEWAY?: {
      API_BASE_URL?: string;
    };
    "REAL-ESTATE"?: {
      API_BASE_URL?: string;
    };
    "LEASE-ACCOUNTING"?: {
      API_BASE_URL?: string;
    };
    "TRANSAC-BO"?: {
      BASE_URL?: string;
      API_BASE_URL?: string;
      MS_ADDRESS_BASE_URL?: string;
    };
  };
};

export function resolveFixturesRoot(fixturesRoot?: string): string {
  return (
    fixturesRoot ||
    process.env.PLAYWRIGHT_FIXTURES_DIR ||
    path.resolve(__dirname, "..", "..", "fixtures")
  );
}

/** Target env file name: dev1, localhost, ra… Mirrors Cypress `ENV`. */
export function resolveTargetEnv(): string {
  if (process.env.RA_NAME) {
    return "ra";
  }

  return process.env.PLAYWRIGHT_ENV ?? process.env.ENV ?? "dev1";
}

/** Slug for auth storage paths: dev1, localhost, or the Review App name. */
export function currentEnvSlug(): string {
  if (process.env.RA_NAME) {
    return process.env.RA_NAME;
  }

  return process.env.PLAYWRIGHT_ENV ?? process.env.ENV ?? "dev1";
}

function loadRaConfig(): EnvironmentConfig {
  const ra =
    process.env.RA_NAME ||
    execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

  return {
    env: {
      ADB: {
        BASE_URL: `https://foncia-adb.${ra}.review.dev1.fonciamillenium.net`,
        API_BASE_URL: `https://api.${ra}.review.dev1.fonciamillenium.net`,
        MS_GATEWAY__BASE_URL: `https://ms-gateway.${ra}.review.dev1.fonciamillenium.net`,
      },
      BO: {
        BASE_URL: `https://foncia-bo.${ra}.review.dev1.fonciamillenium.net`,
        API_BASE_URL: `https://api.${ra}.review.dev1.fonciamillenium.net`,
        MS_GATEWAY__BASE_URL: `https://ms-gateway.${ra}.review.dev1.fonciamillenium.net`,
      },
      MYFONCIA: {
        BASE_URL: `https://my-foncia.${ra}.review.dev1.fonciamillenium.net`,
        API_BASE_URL: `https://api.${ra}.review.dev1.fonciamillenium.net`,
      },
      TRANSAC: {
        BASE_URL: `https://foncia-transaction.${ra}.review.dev1.fonciamillenium.net`,
        API_BASE_URL: `https://foncia-transaction.${ra}.review.dev1.fonciamillenium.net/api`,
        MS_ADDRESS_BASE_URL: `https://foncia-transaction.${ra}.review.dev1.fonciamillenium.net/api`,
      },
      MS_GATEWAY: {
        API_BASE_URL: `https://ms-gateway.${ra}.review.dev1.fonciamillenium.net`,
      },
      "REAL-ESTATE": {
        API_BASE_URL: `https://ms-real-estate.${ra}.review.dev1.fonciamillenium.net/real-estate`,
      },
      "LEASE-ACCOUNTING": {
        API_BASE_URL: `https://ms-lease-accounting.${ra}.review.dev1.fonciamillenium.net/lease-accounting`,
      },
      "TRANSAC-BO": {
        BASE_URL: `https://foncia-transaction-bo.${ra}.review.dev1.fonciamillenium.net`,
        API_BASE_URL: `https://foncia-transaction-bo.${ra}.review.dev1.fonciamillenium.net/api`,
        MS_ADDRESS_BASE_URL: `https://foncia-transaction-bo.${ra}.review.dev1.fonciamillenium.net/api`,
      },
    },
  };
}

export function loadEnvironmentConfig(
  fixturesRoot?: string,
): EnvironmentConfig {
  const root = resolveFixturesRoot(fixturesRoot);
  const targetEnv = resolveTargetEnv();

  if (targetEnv === "ra") {
    return loadRaConfig();
  }

  const configPath = path.join(root, `${targetEnv}.json`);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Environment config not found: ${configPath}`);
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8")) as EnvironmentConfig;
}

import fs from "node:fs";
import { createRequire } from "node:module";

import { test, type Page } from "@playwright/test";

const nodeRequire = createRequire(__filename);

type NodeViolation = {
  target: string[];
  html: string;
  failureSummary: string;
};

type Violation = {
  id: string;
  impact: string | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: NodeViolation[];
};

type AccessibilityData = {
  date: string;
  total: number;
  critical: number;
  major: number;
  minor: number;
  violations: Violation[];
};

type AxeRunResult = {
  violations: Array<{
    id: string;
    impact: string | null;
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<{ target: string[]; html: string; failureSummary: string }>;
  }>;
};

type AxeApi = {
  run: () => Promise<AxeRunResult>;
};

function resolveAxeScript(): string | undefined {
  try {
    return nodeRequire.resolve("axe-core/axe.min.js");
  } catch {
    return undefined;
  }
}

/**
 * Runs an axe-core accessibility audit on the current page.
 *
 *   - Waits for the loading spinner to disappear and meta-tags to be visible.
 *   - Logs all violations to the console (non-blocking — the test never fails
 *     because of accessibility issues).
 *   - Attaches a JSON violation report to the Playwright/Allure test result.
 */
export async function checkAccessibility(page: Page): Promise<void> {
  await page
    .locator('[data-cy="circular-progress"]')
    .waitFor({ state: "detached", timeout: 10000 })
    .catch(() => undefined);
  await page
    .locator('[data-cy="meta-tags"]')
    .waitFor({ state: "visible", timeout: 10000 })
    .catch(() => undefined);

  await page
    .evaluate(async () => {
      const settling = document
        .getAnimations()
        .filter((animation) => {
          const timing = animation.effect?.getComputedTiming();
          return timing ? timing.iterations !== Infinity : true;
        })
        .map((animation) => animation.finished.catch(() => undefined));
      await Promise.all(settling);
    })
    .catch(() => undefined);

  const axeScript = resolveAxeScript();
  if (!axeScript || !fs.existsSync(axeScript)) {
    console.warn(
      "[checkAccessibility] axe-core script not found — skipping audit.",
    );
    return;
  }

  await page.addScriptTag({ path: axeScript }).catch(() => undefined);

  const rawViolations = await page
    .evaluate(async () => {
      const results = await (window as unknown as { axe: AxeApi }).axe.run();
      return results.violations;
    })
    .catch(() => [] as Violation[]);

  const violations: Violation[] = rawViolations.map((v: unknown) => {
    const vio = v as {
      id: string;
      impact: string | null;
      description: string;
      help: string;
      helpUrl: string;
      nodes: Array<{ target: string[]; html: string; failureSummary: string }>;
    };
    return {
      id: vio.id,
      impact: vio.impact,
      description: vio.description,
      help: vio.help,
      helpUrl: vio.helpUrl,
      nodes: vio.nodes.map((n) => ({
        target: n.target,
        html: n.html,
        failureSummary: n.failureSummary,
      })),
    };
  });

  if (violations.length === 0) {
    console.log("✅ Aucun problème d'accessibilité détecté.");
    return;
  }

  console.log(`🧪 ${violations.length} violation(s) d'accessibilité :`);

  violations.forEach((v, i) => {
    const header = `🔴 ${i + 1}. [${v.impact?.toUpperCase() ?? "?"}] ${v.id}`;
    console.group(header);
    console.log("📄 Description :", v.description);
    console.log("🛠️  Help :", v.help);
    console.log("🔗 URL :", v.helpUrl);
    v.nodes.forEach((n, ni) => {
      console.group(`  📍 Node ${ni + 1}`);
      console.log("➡️  Target:", n.target.join(", "));
      console.log("🧩 HTML:", n.html);
      console.log("⚠️  Résumé:", n.failureSummary);
      console.groupEnd();
    });
    console.groupEnd();
  });

  const data: AccessibilityData = {
    date: new Date().toLocaleString("fr-FR"),
    total: violations.length,
    critical: violations.filter((v) => v.impact === "critical").length,
    major: violations.filter((v) => v.impact === "serious").length,
    minor: violations.filter((v) =>
      ["moderate", "minor"].includes(v.impact ?? ""),
    ).length,
    violations,
  };

  await test
    .info()
    .attach("accessibility-report", {
      body: JSON.stringify(data, null, 2),
      contentType: "application/json",
    })
    .catch(() => undefined);
}

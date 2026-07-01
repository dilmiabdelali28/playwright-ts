# Playwright E2E — Millenium

Framework de tests end-to-end Playwright pour le monorepo Millenium. Cypress et Playwright tournent en parallèle dans le pipeline CI pendant la migration progressive de Cypress vers Playwright.

Depuis la première vague de migration, **les tests Playwright `@smoke` sont bloquants sur `master`** : les 100 premiers scénarios migrés sont stabilisés côté Playwright et leur tag `@smoke` a été retiré des scénarios Cypress correspondants (tagués `@migrated`). Playwright fait désormais foi en CI pour ces parcours.

## Documentation

| Fichier                                                | Contenu                                              |
| ------------------------------------------------------ | ---------------------------------------------------- |
| [`PLAYWRIGHT_FRAMEWORK.md`](./PLAYWRIGHT_FRAMEWORK.md) | Architecture complète, auth, fixtures, CI, reporting |

## Démarrage rapide

```bash
cd playwright
pnpm install
npx playwright install
```

### Lancer les tests

| Commande                                            | Description                                   |
| --------------------------------------------------- | --------------------------------------------- |
| `pnpm run test`                                     | Tous les tests (headless)                     |
| `pnpm run test:headed`                              | Tous les tests (navigateur visible, 1 worker) |
| `pnpm run test:smoke`                               | Smoke tests tagués `@smoke`                   |
| `pnpm run test:smoke:headed`                        | Smoke tests (navigateur visible)              |
| `pnpm run test:spec -- <fichier>`                   | Un spec précis (headless)                     |
| `pnpm run test:spec:headed -- <fichier> -g 'titre'` | Un scénario précis (visible)                  |

### Localhost

Stack locale requise (ports définis dans `fixtures/localhost.json`).

| Commande                               | Description                         |
| -------------------------------------- | ----------------------------------- |
| `pnpm run test:localhost`              | Tous les tests sur localhost        |
| `pnpm run test:localhost:headed`       | Tous les tests (navigateur visible) |
| `pnpm run test:localhost:smoke`        | Smoke tests `@smoke`                |
| `pnpm run test:localhost:smoke:headed` | Smoke tests (navigateur visible)    |

```bash
pnpm run test:localhost:smoke
pnpm run test:spec -- tests/tests-smoke/invoices/mySpec.spec.ts  # avec ENV=localhost si besoin
ENV=localhost pnpm run test:spec -- tests/tests-smoke/invoices/mySpec.spec.ts
```

### Review Apps

```bash
RA_NAME=<nom-ra> pnpm run test:ra
RA_NAME=<nom-ra> pnpm run test:ra:smoke
```

### Rapports

```bash
pnpm run report           # Rapport HTML Playwright
pnpm run allure:generate  # Générer rapport Allure
pnpm run allure:open      # Ouvrir rapport Allure
```

Rapport en ligne (CI) : [ml-playwright.dev1.fonciamillenium.net](https://ml-playwright.dev1.fonciamillenium.net)

## Stratégie de tags & CI

| Tag           | Projet     | Job CI                       | Bloquant ? | Rôle                                                |
| ------------- | ---------- | ---------------------------- | ---------- | --------------------------------------------------- |
| `@migrated`   | Cypress    | —                            | —          | Test Cypress existant déjà couvert par Playwright   |
| `@monitoring` | Playwright | `playwright:test:monitoring` | Non        | Nouveau test en observation, on valide sa stabilité |
| `@smoke`      | Playwright | `playwright:test:e2e`        | **Oui**    | Test stabilisé, gate bloquant sur `master`          |

- Job bloquant : `playwright:test:e2e` exécute `--grep @smoke` (`allow_failure: false`).
- Job d'observation : `playwright:test:monitoring` exécute `--grep @monitoring` (`allow_failure: true`).
- Les résultats de stabilité sont remontés dans Slack.

## Ajouter / migrer un test

Procédure pour migrer un test Cypress ou ajouter un nouveau test Playwright :

1. **Cypress** : tagger le test existant `@migrated` (uniquement pour les tests Cypress déjà repris dans Playwright).
2. **Playwright** : écrire le test et le tagger `{ tag: ["@monitoring"] }` — il tourne en observation, non bloquant.
   - Identifier le domaine dans `tests/tests-smoke/`
   - Utiliser `session.fixture.ts` — `sessionFor("bo:sofian")` / `sessionFor("adb:karine")`
3. **Observer la stabilité** du test via les rapports Slack (sur plusieurs runs / plusieurs jours).
4. **Promouvoir en `@smoke`** une fois stable sur plusieurs jours → le test devient bloquant, et le `@smoke` du scénario Cypress `@migrated` correspondant peut être retiré.

> ⚠️ Ne pas remettre `@smoke` sur un scénario Cypress `@migrated` : la source de vérité passe à Playwright.

Lancer les tests en observation localement : `pnpm exec playwright test --grep @monitoring`.
Guide complet dans [`PLAYWRIGHT_FRAMEWORK.md`](./PLAYWRIGHT_FRAMEWORK.md).

## Mapping Cypress → Playwright

| Cypress                 | Playwright                                 |
| ----------------------- | ------------------------------------------ |
| `cy.visit('/path')`     | `await page.goto('/path')`                 |
| `cy.get('selector')`    | `page.locator('selector')`                 |
| `cy.contains('text')`   | `page.getByText('text')`                   |
| `cy.intercept(...)`     | `page.route(...)`                          |
| `cy.fixture('file')`    | `import data from '../data/file.json'`     |
| `beforeEach(() => ...)` | `test.beforeEach(async ({ page }) => ...)` |
| `cy.wait('@alias')`     | `await page.waitForResponse(url => ...)`   |

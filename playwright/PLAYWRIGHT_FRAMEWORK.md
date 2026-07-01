# Framework Playwright — Guide technique

Documentation de référence du framework Playwright dans [`playwright/`](./playwright/).

---

## Table des matières

1. [Objectif](#objectif)
2. [Arborescence](#arborescence)
3. [Architecture d'un test](#architecture-dun-test)
4. [Authentification et sessions](#authentification-et-sessions)
5. [Fixture multi-acteurs : session.fixture.ts](#fixture-multi-acteurs--sessionfixturets)
6. [Page Object Model](#page-object-model)
7. [Pattern API-first](#pattern-api-first)
8. [Configuration](#configuration)
9. [Variables d'environnement](#variables-denvironnement)
10. [Reporting et artefacts](#reporting-et-artefacts)
11. [Pipeline CI GitLab](#pipeline-ci-gitlab)
12. [Écrire un nouveau test](#écrire-un-nouveau-test)
13. [Conventions](#conventions)
14. [Debug](#debug)
15. [Limitations connues](#limitations-connues)

---

## Objectif

Ce workspace sert à :

- migrer les scénarios Cypress vers Playwright
- structurer les tests E2E autour de helpers réutilisables
- séparer les actions UI, les clients API, les fixtures et la configuration
- fournir une base exécutable en local et dans le pipeline CI (dev1 + Review Apps)

---

## Arborescence

```text
playwright/
├── auth/                         # Sessions sauvegardées (storageState)
│   └── dev1/                     # Un fichier JSON par identité
│       ├── adb-celine.json
│       ├── adb-karine.json
│       └── bo-sofian.json
├── data/                         # Jeux de données JSON simples
├── fixtures/                     # Credentials, datasets, fichiers, factory
│   ├── users_dev.json            # Credentials utilisateurs
│   ├── dev1.json / ra.json       # Endpoints d'environnement
│   ├── pdf/                      # Fichiers d'upload (factures, documents)
│   ├── images/                   # Images de test
│   ├── datasets/                 # Données techniques et métier (JSON/TS)
│   └── factory/                  # Génération dynamique de contextes backend
├── helpers/
│   ├── auth-storage.helper.ts    # Chemins storageState par env/identité
│   ├── bo-auth.helper.ts         # Login BO + récupération token Okta
│   ├── playwright-login.helper.ts# Login ADB/Okta
│   ├── adb-homepage.helper.ts    # Navigation homepage/header ADB
│   ├── adb-listing.helper.ts     # Utilitaires génériques de listing
│   ├── environment-fixtures.helper.ts # Chargement config d'environnement
│   ├── outgoing-mails.helper.ts  # Helpers métier courriers sortants
│   ├── test-config.ts            # Constantes partagées (timeouts, users…)
│   ├── constants/
│   │   ├── bo-endpoints.ts       # URL fragments BO
│   │   └── project-paths.ts      # Chemins vers fixtures/data
│   └── services/                 # Clients API et helpers techniques
│       ├── bo-fixture-api.client.ts
│       ├── bo-invoice-fixture.client.ts
│       ├── bo-tenor-invoice-fixture.client.ts
│       ├── bo-adf-api.client.ts
│       ├── bo-supplier-resolver.client.ts
│       ├── invoice-options-fixture.client.ts
│       ├── adb-workorder-fixture.client.ts
│       └── adf-reference-seed.helper.ts
├── pages/                        # Page Objects
│   ├── invoice/
│   │   ├── base-bo.page.ts
│   │   ├── bo-invoice.page.ts
│   │   ├── bo-entries.page.ts
│   │   └── bo-tenor-invoice.page.ts
│   └── adb/
│       ├── contract.page.ts
│       └── portfolio-invoice.page.ts
├── scripts/                      # Scripts utilitaires (deploy, invalidation CloudFront…)
├── tests/
│   ├── fixtures/
│   │   ├── session.fixture.ts    # Fixture principale multi-acteurs (recommandée)
│   │   ├── bo.fixture.ts         # Fixture historique single-user BO
│   │   └── bo-adf.fixture.ts     # Fixture historique BO + ADF
│   └── tests-smoke/              # Specs organisées par domaine fonctionnel
│       ├── accounting/
│       ├── customers/
│       ├── documents/
│       ├── estates/
│       ├── invoices/
│       ├── mediaPayment/
│       ├── missions/
│       ├── myFoncia/
│       ├── rent-reviews/
│       ├── suppliers/
│       ├── ticket/
│       ├── tools/
│       ├── transactionBo/
│       └── transactions/
├── playwright.config.ts          # Configuration Playwright
└── package.json
```

---

## Architecture d'un test

```
spec.ts
  │
  ├─ sessionFor("bo:sofian")          ← session.fixture.ts
  │     ├─ storageState rechargé      → auth/dev1/bo-sofian.json
  │     ├─ ou loginToBo(page, user)   → bo-auth.helper si session expirée
  │     └─ return page (sofian)
  │
  ├─ sessionFor("adb:karine")         ← même fixture, contexte isolé
  │     ├─ storageState rechargé      → auth/dev1/adb-karine.json
  │     ├─ ou loginToAdb(page, user)  → playwright-login.helper si token expiré
  │     └─ return page (karine)
  │
  ├─ new BoInvoicePage(sofian)        ← Page Object (interactions UI)
  ├─ new AdbContractPage(karine)      ← Page Object ADB
  │
  ├─ new BoInvoiceFixtureClient(      ← API Fixture Client (setup données)
  │       sofian.request, url, token)
  │     └─ POST /invoices → { invoiceId, invoiceNumber }
  │
  └─ test.step("Sofian creates invoice", async () => {
        await invoicePage.createInvoiceFromPdf(...)
        await invoicePage.accountInvoice()
    })

  [teardown automatique]
    ├─ page.video()?.path()           → récupère le .webm avant fermeture
    ├─ context.close()                → finalise l'écriture vidéo sur disque
    └─ testInfo.attach("video-bo:sofian", { ... }) → attaché dans Allure
```

Chaque acteur a son propre `BrowserContext` : sessions complètement isolées, pas de logout nécessaire.

---

## Authentification et sessions

### Stratégie : lazy auth avec storageState

À la première exécution, la fixture effectue un vrai login Okta et sauvegarde le cookie/localStorage dans `auth/<env>/<identity>.json`.

Les exécutions suivantes rechargent ce fichier directement — **le login Okta est sauté** (~40 s économisés par acteur).

```
auth/
└── dev1/                   # ou <RA_NAME>/
    ├── bo-sofian.json
    ├── adb-celine.json
    └── adb-karine.json
```

Le chemin est calculé par `auth-storage.helper.ts` :

```ts
// auth/dev1/adb-celine.json
storageStatePath("adb:celine");
```

### Détection de session expirée

**BO** — après navigation, `assertBoLoggedInLanding` vérifie la page. En cas d'échec (déploiement effacé le localStorage), un login complet est déclenché automatiquement.

**ADB** — avant toute attente UI, le token dans `localStorage["okta-token-storage"]` est lu :

- token valide et non expiré (marge 60 s) → race entre la page de landing et une redirection Okta
- token absent ou expiré → login Okta immédiat sans attendre le timeout

### Identités supportées

| Format         | Exemple                    | Application |
| -------------- | -------------------------- | ----------- |
| `bo:<prénom>`  | `bo:sofian`                | Back-office |
| `adb:<prénom>` | `adb:karine`, `adb:celine` | ADB         |

Le prénom est normalisé en PascalCase pour charger le fichier de credentials dans `fixtures/`.

---

## Fixture multi-acteurs : session.fixture.ts

Fichier : [`tests/fixtures/session.fixture.ts`](./tests/fixtures/session.fixture.ts)

### API exposée

| Fixture         | Type                                  | Description                                 |
| --------------- | ------------------------------------- | ------------------------------------------- |
| `sessionFor`    | `(identity: string) => Promise<Page>` | Crée ou recycle un contexte par identité    |
| `boUser`        | `BoUser`                              | User BO par défaut (chargé depuis fixtures) |
| `boAccessToken` | `string`                              | Token Okta du user BO par défaut            |

### Exemple multi-acteurs

```ts
import { test } from "../../fixtures/session.fixture";
import { BoInvoicePage } from "../../../pages/invoice/bo-invoice.page";
import { AdbContractPage } from "../../../pages/adb/contract.page";

test(
  "E2E - scenario multi-acteurs",
  { tag: ["@bo", "@adb", "@smoke"] },
  async ({ sessionFor, boAccessToken }) => {
    test.setTimeout(120000);

    const sofian = await sessionFor("bo:sofian"); // ACCOUNTANT
    const karine = await sessionFor("adb:karine"); // PROPERTY_MANAGEMENT_MANAGER

    const invoicePage = new BoInvoicePage(sofian);
    const contractPage = new AdbContractPage(karine);

    await test.step("Karine creates a contract", async () => {
      // interactions sur karine (contexte ADB isolé)
    });

    await test.step("Sofian accounts the invoice", async () => {
      // interactions sur sofian (contexte BO isolé)
    });
  },
);
```

### Vidéo par scénario

`video: "on"` est activé dans `playwright.config.ts` — **toutes les pages sont enregistrées**.

En teardown, la fixture attache automatiquement chaque vidéo au rapport Allure :

```
Attachments dans Allure :
  video-bo:sofian     → sofian.webm
  video-adb:karine    → karine.webm
```

Cela permet d'investiguer chaque acteur indépendamment sans fouiller S3.

### Fixtures historiques (ne pas utiliser pour de nouveaux tests)

- `bo.fixture.ts` — single-user BO (`boUser`, `boAccessToken`)
- `bo-adf.fixture.ts` — BO + contexte ADF

---

## Page Object Model

Les interactions UI sont centralisées dans `pages/`.

**BO (`pages/invoice/`) :**

- `base-bo.page.ts` — base commune (`getByTestId`, `waitForNav`…)
- `bo-invoice.page.ts` — flux facture classique
- `bo-entries.page.ts` — tableau des factures comptabilisées
- `bo-tenor-invoice.page.ts` — flux facture TENOR

**ADB (`pages/adb/`) :**

- `contract.page.ts` — création de contrat (via API avec token Okta)
- `portfolio-invoice.page.ts` — tableau portefeuille factures ADB

### Convention dans chaque Page Object

```ts
private readonly testIds   = { ... } as const; // data-testid
private readonly labels    = { ... } as const; // textes/regex pour getByRole/getByText
private readonly selectors = { ... } as const; // sélecteurs CSS dynamiques
```

Aucun sélecteur en dur dans les méthodes — toujours passer par ces objets constants.

---

## Pattern API-first

Une partie importante des scénarios BO crée le contexte métier via API avant de finir le parcours dans l'UI. Ce pattern réduit la fragilité des tests.

| Client                               | Usage                              |
| ------------------------------------ | ---------------------------------- |
| `bo-invoice-fixture.client.ts`       | Création de contexte facture       |
| `bo-tenor-invoice-fixture.client.ts` | Création de contexte facture TENOR |
| `bo-adf-api.client.ts`               | Création de référence ADF          |
| `bo-fixture-api.client.ts`           | Création de contexte générique     |
| `adb-workorder-fixture.client.ts`    | Création de bon de commande ADB    |

---

## Configuration

### playwright.config.ts

| Paramètre       | Valeur                              | Description                             |
| --------------- | ----------------------------------- | --------------------------------------- |
| `testDir`       | `./tests`                           | Dossier des specs                       |
| `fullyParallel` | `true`                              | Tous les tests en parallèle             |
| `retries`       | `1`                                 | 1 retry avant échec                     |
| `timeout`       | `120000` ms                         | Timeout par test                        |
| `headless`      | `true`                              | Mode sans navigateur                    |
| `video`         | `on`                                | Vidéo systématique sur toutes les pages |
| `trace`         | `on-first-retry`                    | Trace Playwright sur le 1er retry       |
| `screenshot`    | `only-on-failure`                   | Screenshot uniquement en cas d'échec    |
| reporters       | `html`, `list`, `allure-playwright` | Rapports générés                        |

### helpers/test-config.ts

```ts
TEST_CONFIG = {
  boDefaultUser: process.env.BO_TEST_USER ?? "Sofian",
  targetAgency: process.env.BO_TARGET_AGENCY ?? "FONCIA AGENCE CENTRALE",
  fixturesDir: process.env.PLAYWRIGHT_FIXTURES_DIR ?? PROJECT_PATHS.fixturesDir,
  tenorExternalId: process.env.TENOR_EXTERNAL_ID ?? "104",
  timeouts: {
    medium: 15000,
    long: 30000,
    test: 120000,
  },
};
```

---

## Variables d'environnement

| Variable                  | Défaut                                                  | Description                                |
| ------------------------- | ------------------------------------------------------- | ------------------------------------------ |
| `RA_NAME`                 | `dev1`                                                  | Nom de la Review App cible. Absence = dev1 |
| `OKTA_ISSUER`             | `https://login.dev1.fonciamillenium.net/oauth2/default` | Issuer Okta (injecté par la CI)            |
| `BO_TEST_USER`            | `Sofian`                                                | User BO par défaut                         |
| `BO_TARGET_AGENCY`        | `FONCIA AGENCE CENTRALE`                                | Agence cible                               |
| `PLAYWRIGHT_FIXTURES_DIR` | chemin relatif                                          | Dossier fixtures                           |
| `TENOR_EXTERNAL_ID`       | `104`                                                   | ID TENOR externe                           |

---

## Reporting et artefacts

### En local

```bash
pnpm run test:spec -- tests/tests-smoke/invoices/mySpec.spec.ts
pnpm run allure:generate   # génère allure-report/ depuis allure-results/
pnpm run allure:open       # ouvre dans le navigateur
pnpm run report            # rapport HTML Playwright
```

### Dossiers de sortie

| Dossier                  | Contenu                                             |
| ------------------------ | --------------------------------------------------- |
| `test-results/`          | Screenshots, vidéos `.webm`, traces `.zip` par test |
| `playwright-report/`     | Rapport HTML Playwright                             |
| `report/allure-results/` | Résultats bruts Allure (JSON par test)              |
| `report/allure-report/`  | Rapport Allure généré (HTML, tendances)             |

Ces dossiers sont des sorties d'exécution — ne pas committer.

### Rapport en ligne (CI)

URL : **[ml-playwright.dev1.fonciamillenium.net](https://ml-playwright.dev1.fonciamillenium.net)**

Contenu :

- **`/latest/`** — dernier rapport Allure complet
- **`/history/<pipeline_id>/`** — archive de chaque run (10 runs conservés)
- **`/history/<pipeline_id>/meta.json`** — résumé du run (passed, failed, flaky, branch, date)
- **`/history/<pipeline_id>/scenarios.json`** — résultats par scénario
- **`/scenarios-trend.json`** — tendance des 20 derniers runs par scénario

### Notification Slack

Après chaque run CI, un message Block Kit est envoyé avec :

- statut global (✅ Passed / ❌ Failed)
- compteurs : passed, failed, flaky, skipped
- liste des specs en échec ou flaky (5 max)
- lien vers le rapport Allure et le pipeline GitLab

---

## Pipeline CI GitLab

Configuration : [`.gitlab-ci/playwright.yml`](../.gitlab-ci/playwright.yml)

### Jobs

#### `cypress:test:e2e`

- **Stage** : `acc-test-e2e`
- **Trigger** : toute MR + master
- **Parallélisme** : 15 shards
- **Gate** : bloquant — un échec fait échouer le pipeline

#### `playwright:test:e2e`

- **Stage** : `acc-test-e2e` (en parallèle avec Cypress)
- **Trigger** : toute MR + master
- **Parallélisme** : 4 shards × 3 workers = ~12 tests en parallèle
- **Gate** : `allow_failure: true` pendant la période de stabilisation — retirer une fois stable
- **Commande** :
  ```
  playwright test --grep "@smoke" --workers=3 --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
  ```
- **Artefacts** : `report/allure-results/`, `report/allure-report/`, `playwright-report/`, `test-results/` — expire 7 jours

#### `playwright:publish:report`

- **Stage** : `.post` (après les 4 shards)
- **Dépendances** : `playwright:test:e2e 1/4` + `playwright:test:e2e 2/4` + `playwright:test:e2e 3/4` + `playwright:test:e2e 4/4`
- **Actions** :
  1. Télécharge l'historique Allure depuis S3 pour alimenter les graphes de tendance
  2. Génère le rapport Allure unifié (tous les shards fusionnés)
  3. Publie sur S3 (`s3://fon-mil-dev1-frt-statics-ml-playwright/latest/`)
  4. Invalide le cache CloudFront
  5. Archive le run dans `history/<pipeline_id>/`
  6. Upload les vidéos `.webm` et traces `.zip` dans `history/<pipeline_id>/artifacts/`
  7. Met à jour `scenarios-trend.json` (tendance 20 runs par scénario)
  8. Génère et publie `index.html` (liste des 10 derniers runs)
  9. Envoie la notification Slack

### Flux CI complet

```
MR ouverte / push master
    │
    ├─ cypress:test:e2e 1/15  ─┐
    ├─ cypress:test:e2e ...    ├─ stage acc-test-e2e (bloquant)
    ├─ cypress:test:e2e 15/15 ─┘
    │
    ├─ playwright:test:e2e 1/4   (shard 1 — 3 workers) ─┐
    ├─ playwright:test:e2e 2/4   (shard 2 — 3 workers)  ├─ stage acc-test-e2e (allow_failure)
    ├─ playwright:test:e2e 3/4   (shard 3 — 3 workers)  │
    ├─ playwright:test:e2e 4/4   (shard 4 — 3 workers) ─┘
    │
    └─ playwright:publish:report   (.post)
          ├─ Fusionne allure-results des 4 shards
          ├─ Publie sur S3 + invalide CloudFront
          ├─ Archive history + vidéos + trends
          └─ Envoie notification Slack
```

---

## Écrire un nouveau test

### Étapes

1. Identifier le domaine dans `tests/tests-smoke/`
2. Créer le fichier `<scenario>.spec.ts` dans le bon sous-dossier
3. Utiliser `session.fixture.ts` et déclarer les acteurs
4. Vérifier si un Page Object existe dans `pages/`, sinon en créer un
5. Si du contexte métier est nécessaire, ajouter un client dans `helpers/services/`
6. Nommer la variable de session par le prénom de l'acteur (`sofian`, `karine`, `celine`)
7. Tagger `@smoke` pour l'inclure dans la CI
8. Lancer le spec seul avant la suite complète

### Squelette

```ts
import { test } from "../../fixtures/session.fixture";
import { BoInvoicePage } from "../../../pages/invoice/bo-invoice.page";

test(
  "E2E - description du scénario",
  { tag: ["@bo", "@invoice", "@copro", "@smoke"] },
  async ({ sessionFor, boAccessToken }) => {
    test.setTimeout(120000);

    const sofian = await sessionFor("bo:sofian"); // ACCOUNTANT

    const invoicePage = new BoInvoicePage(sofian);

    await test.step("Sofian opens the dashboard", async () => {
      await invoicePage.openReceivedInvoicesDashboard();
    });
  },
);
```

### Lancer en local

```bash
# Un spec précis
pnpm run test:spec -- tests/tests-smoke/invoices/mySpec.spec.ts

# Un scénario précis (avec -g)
pnpm run test:spec:headed -- tests/tests-smoke/invoices/mySpec.spec.ts -g 'titre du test'

# Lister les tests d'un fichier
npx playwright test tests/tests-smoke/invoices/mySpec.spec.ts --list
```

---

## Conventions

- Utiliser `test.step()` pour les étapes métier importantes
- Préférer `data-testid` ou `getByRole` — jamais de sélecteurs CSS fragiles
- Préférer `waitForResponse` à `waitForTimeout`
- Isoler les appels backend dans `helpers/services/`
- Isoler les parcours UI dans `pages/`
- Mutualiser les timeouts et chemins dans `TEST_CONFIG`
- Nommer les acteurs par leur prénom (`sofian`, `karine`, `celine`)
- Un fichier spec = un scénario ou un sous-ensemble cohérent

---

## Debug

### En local

Les artefacts sont dans `test-results/<test-name>/` :

- `video.webm` — enregistrement complet du navigateur
- `trace.zip` — trace Playwright (ouvrir avec `npx playwright show-trace`)
- `screenshot.png` — capture en cas d'échec

```bash
npx playwright show-trace playwright/test-results/<test>/trace.zip
```

### Dans Allure

Chaque scénario CI dispose dans l'onglet **Attachments** de :

- `video-bo:sofian` — vidéo du navigateur BO
- `video-adb:karine` — vidéo du navigateur ADB
- screenshot en cas d'échec
- trace en cas de retry

### Variables de debug utiles

```bash
DEBUG=pw:api pnpm run test:spec -- <fichier>      # logs API Playwright
PWDEBUG=1 pnpm run test:spec:headed -- <fichier>  # mode inspector
```

---

## Limitations connues

- Certains tests sont dépendants de l'état de `dev1` (données de référence)
- Certaines suites sont flakies si l'environnement répond lentement — investiguer via le graphe de tendance `scenarios-trend.json`
- Exécuter depuis le mauvais dossier charge la mauvaise configuration Playwright

---

## Fichiers de référence

| Fichier                                                                    | Rôle                                                   |
| -------------------------------------------------------------------------- | ------------------------------------------------------ |
| [`playwright.config.ts`](./playwright.config.ts)                           | Configuration Playwright                               |
| [`helpers/test-config.ts`](./helpers/test-config.ts)                       | Constantes partagées                                   |
| [`helpers/auth-storage.helper.ts`](./helpers/auth-storage.helper.ts)       | Chemins storageState                                   |
| [`tests/fixtures/session.fixture.ts`](./tests/fixtures/session.fixture.ts) | Fixture principale                                     |
| [`global-setup.ts`](./global-setup.ts)                                     | Setup global (nettoyage Allure, création dossier auth) |
| [`.gitlab-ci/playwright.yml`](../.gitlab-ci/playwright.yml)                | Jobs CI GitLab                                         |

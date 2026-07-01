import { test } from "@helpers/auth/session.fixture";

import {
  extractFirstAccount,
  findAccount,
  ListingBalanceComptesPage,
} from "@/pages/bo/listing-balance-comptes.page";

import { expect } from "../../../../report/base.fixture";

// Source migration: cypress/functionalTests/accounting/balances/listing.feature (l.39-54)

test("renders the card title, the column headers and at least one row", async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  await test.step('she goes to the dashboard "balance-comptes"', async () => {
    await listingPage.goto();
  });

  await test.step("she should see the listing page title", async () => {
    await listingPage.assertPageTitle();
  });

  await test.step("she should see table column names", async () => {
    await listingPage.assertColumnHeadersVisible();
  });

  await test.step("the table should not be empty", async () => {
    await listingPage.assertTableNotEmpty();
  });
});

test("filtering by `sub-account` (Input) triggers a refetch and keeps the listing non-empty", async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  const initialListing = listingPage.waitForListing();

  await test.step('she goes to the dashboard "balance-comptes"', async () => {
    await listingPage.goto();
  });

  const firstAccount =
    await test.step("she picks the sub-account from the first listing row", async () => {
      const account = extractFirstAccount(await initialListing);
      expect(account).toBeTruthy();
      expect(account?.subAccount).toBeTruthy();
      return account;
    });

  const filteredListing = listingPage.waitForListing();

  await test.step("she filters by sub-account", async () => {
    await listingPage.applyFilters({
      subAccount: firstAccount!.subAccount!,
    });
  });

  await test.step("the listing refetches and stays non-empty", async () => {
    const filteredBody = await filteredListing;
    expect(filteredBody.items?.length ?? 0).toBeGreaterThan(0);
    await listingPage.assertTableNotEmpty();
  });
});

test("filtering by `owner` and `label` (free-text Inputs) triggers a refetch", async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  const initialListing = listingPage.waitForListing();

  await test.step('she goes to the dashboard "balance-comptes"', async () => {
    await listingPage.goto();
  });

  const { owner, label } =
    await test.step("she picks owner and label values from the first listing row", async () => {
      const firstAccount = extractFirstAccount(await initialListing);
      return {
        owner: firstAccount?.lessorAccount?.fullname ?? "A",
        label: firstAccount?.label?.split(" ")[0] ?? "A",
      };
    });

  const ownerRefetched = listingPage.waitForListing();

  await test.step("she filters by owner", async () => {
    await listingPage.applyFilters({ owner });
  });

  await test.step("the owner filter triggers a refetch", async () => {
    await ownerRefetched;
    expect(await listingPage.getFilterValue("owner")).toBe(owner);
  });

  const labelRefetched = listingPage.waitForListing();

  await test.step("she filters by label", async () => {
    await listingPage.applyFilters({ label });
  });

  await test.step("the label filter triggers a refetch", async () => {
    await labelRefetched;
    expect(await listingPage.getFilterValue("label")).toBe(label);
  });
});

test('selecting "S" in the Métier Combobox triggers a refetch and the trigger reflects the choice', async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  await test.step('she goes to the dashboard "balance-comptes"', async () => {
    await listingPage.goto();
    await listingPage.assertTableNotEmpty();
  });

  const refetched = listingPage.waitForListing();

  await test.step('she selects "S" in the Métier Combobox', async () => {
    await listingPage.selectKind("S");
  });

  await test.step("the listing refetches and the trigger reflects the choice", async () => {
    await refetched;
    const triggerLabel = await listingPage.getKindTriggerLabel();
    expect(triggerLabel).toContain("S");
  });
});

test('selecting "Débiteur" in the Type de Solde Combobox triggers a refetch', async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  await test.step('she goes to the dashboard "balance-comptes"', async () => {
    await listingPage.goto();
    await listingPage.assertTableNotEmpty();
  });

  const refetched = listingPage.waitForListing();

  await test.step('she selects "Débiteur" in the Type de Solde Combobox', async () => {
    await listingPage.selectBalanceKind("Débiteur");
  });

  await test.step("the listing refetches", async () => {
    await refetched;
  });
});

test(
  "Listing - BO - Balance-account - Using balance_kind filter (Créditeur)",
  { tag: ["@smoke"] },
  async ({ sessionFor }) => {
    const sofian = await test.step('Sofian is logged in "BO"', () =>
      sessionFor("bo:sofian"));
    const listingPage = new ListingBalanceComptesPage(sofian);

    await test.step('she goes to the dashboard "balance-comptes"', async () => {
      await listingPage.goto();
      await listingPage.assertTableNotEmpty();
    });

    const balanceRefetch = listingPage.waitForBalanceTotals();

    await test.step("she searches by balance kind filter (Créditeur)", async () => {
      await listingPage.selectBalanceKind("Créditeur");
    });

    await test.step("she waits the balance totals request with balanceKind=CREDIT", async () => {
      const balanceResponse = await balanceRefetch;
      expect(balanceResponse.url()).toMatch(/balanceKind=CREDIT/);
    });

    await test.step("she should see the right values in chips", async () => {
      await listingPage.assertBalanceChips({
        balanceChip: false,
        creditChip: false,
        debtChip: true,
      });
    });
  },
);

test("combining Métier + sub-account filters narrows the listing and the API returns matching rows", async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  await test.step('she goes to the dashboard "balance-comptes"', async () => {
    await listingPage.goto();
  });

  const afterKind = listingPage.waitForListing();

  await test.step('she selects "S" in the Métier Combobox', async () => {
    await listingPage.selectKind("S");
  });

  const subAccount =
    await test.step("she picks a sub-account from a syndic row", async () => {
      const kindFilteredBody = await afterKind;
      const candidate = findAccount(kindFilteredBody, (item) =>
        Boolean(item.subAccount),
      );
      expect(
        candidate?.subAccount,
        "Expected at least one syndic account with a sub-account after filtering by métier S",
      ).toBeTruthy();
      return candidate!.subAccount!;
    });

  const afterSubAccount = listingPage.waitForListing();

  await test.step("she filters by sub-account", async () => {
    await listingPage.applyFilters({ subAccount });
  });

  await test.step("the API returns rows matching métier S and the sub-account", async () => {
    const filteredBody = await afterSubAccount;
    expect(filteredBody.items?.length ?? 0).toBeGreaterThan(0);
    for (const item of filteredBody.items ?? []) {
      expect(item.subAccount).toBe(subAccount);
      expect(item.lineOfBusiness).toBe("S");
    }
  });
});

test("filtering with a non-matching sub-account shows the empty state", async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  await test.step('she goes to the dashboard "balance-comptes"', async () => {
    await listingPage.goto();
    await listingPage.assertTableNotEmpty();
  });

  const refetched = listingPage.waitForListing();

  await test.step("she searches in listing by invalid sub-account", async () => {
    // A 12-digit number is well above the typical 6-digit sub-account length
    // — guaranteed not to match a real row.
    await listingPage.applyFilters({ subAccount: "999999999999" });
  });

  await test.step("the table should be empty", async () => {
    await refetched;
    await listingPage.assertTableEmpty();
  });
});

test("URL persistence — landing on /balance-comptes with a filters[compte] param restores the sub-account input value", async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  const refetched = listingPage.waitForListing();

  await test.step("she lands on /balance-comptes with filters[compte]=001", async () => {
    // `useRestTable.hasUrlPersistence: true` persists table state as the
    // `qs`-encoded `FetchRequirementsType` shape: `filters[<id>]=<value>`.
    // The page's column filter id for the sub-account input is `compte`
    // (see buildBalanceQueryParams + Filters.tsx — the testid is
    // `sub-account` but the URL key is `compte`).
    await listingPage.goto("/balance-comptes?filters[compte]=001");
  });

  await test.step("the sub-account input value is restored from the URL", async () => {
    await refetched;
    expect(await listingPage.getFilterValue("sub-account")).toBe("001");
  });
});

test("BuildingMandateField — typing a real building number returns at least one option and selecting it refetches the listing", async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  const initialListing = listingPage.waitForListing();

  await test.step('she goes to the dashboard "balance-comptes"', async () => {
    await listingPage.goto();
  });

  const buildingNumber =
    await test.step("she picks a building number from the listing", async () => {
      const number = findAccount(await initialListing, (item) =>
        Boolean(item.building?.buildingNumber),
      )?.building?.buildingNumber;
      expect(
        number,
        "Expected at least one account with a building in the listing",
      ).toBeTruthy();
      return number!;
    });

  const refetched = listingPage.waitForListing();

  await test.step("she selects the building in the Immeuble field", async () => {
    await listingPage.selectBuildingByNumber(buildingNumber);
  });

  await test.step("the listing refetches", async () => {
    await refetched;
  });
});

test("BuildingMandateField — searching for a clearly unknown building number returns no option (proves the agency scoping)", async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  await test.step('she goes to the dashboard "balance-comptes"', async () => {
    await listingPage.goto();
    await listingPage.assertTableNotEmpty();
  });

  await test.step("searching for an unknown building number returns no option", async () => {
    const hasResults =
      await listingPage.buildingFieldHasResultsFor("999999999999");
    expect(hasResults).toBe(false);
  });
});

test('clicking "Voir le détail des écritures" on a row navigates to /entries with the account preselected', async ({
  sessionFor,
}) => {
  const sofian = await test.step('Sofian is logged in "BO"', () =>
    sessionFor("bo:sofian"));
  const listingPage = new ListingBalanceComptesPage(sofian);

  const initialListing = listingPage.waitForListing();

  await test.step('she goes to the dashboard "balance-comptes"', async () => {
    await listingPage.goto();
  });

  const accountId =
    await test.step("she picks the first account from the listing", async () => {
      const firstAccount = extractFirstAccount(await initialListing);
      expect(firstAccount).toBeTruthy();
      return firstAccount!._id;
    });

  await test.step('she clicks "Voir le détail des écritures" on the first row', async () => {
    await listingPage.clickFirstRowEntriesAction();
    await listingPage.page.waitForURL(/\/entries\?/);
  });

  await test.step("the /entries URL preselects the accounting account", async () => {
    // The page builds the query with `qs.stringify({ filters: {...} })`, so
    // the URL contains `filters[accountingAccount]=<id>` — URL-encoded to
    // `filters%5BaccountingAccount%5D=<id>`. Decode before asserting so the
    // expectation reads as the logical key.
    const url = decodeURIComponent(listingPage.page.url());
    expect(url).toContain("filters[");
    expect(url).toContain(`filters[accountingAccount]=${accountId}`);
  });
});

import { checkAccessibility } from "@helpers/ui";

import { test } from "../../../helpers/auth/myfoncia-session.fixture";
import { MyFonciaPage } from "../../../pages/my-foncia/my-foncia.page";

// Source migration: myFoncia/viewMyFonciaPages.feature
// Filter: @smoke AND not @quarantine

test.describe("myFoncia pages — title and navigation smoke", () => {
  test(
    "Display - myFoncia - Pages - Verify all titles pages of the CO-OWNER (Eric)",
    { tag: ["@smoke"] },
    async ({ sessionFor }) => {
      const page = await sessionFor("eric");
      const mf = new MyFonciaPage(page);

      await test.step("Ma comptabilité → Mon compte", async () => {
        await mf.clickFirstAccount("CO_OWNER");
        await mf.navigateSidebar("Ma comptabilité");
        await mf.assertPageTitle("Mon compte");
        await checkAccessibility(page);
      });

      await test.step("Mes paiements → Historique des paiements", async () => {
        await mf.navigateSidebar("Mes paiements");
        await mf.assertPageTitle("Historique des paiements");
        await checkAccessibility(page);
      });

      await test.step("Offres et services → Offres et services", async () => {
        await mf.navigateSidebar("Offres et services");
        await mf.assertPageTitle("Offres et services");
        await checkAccessibility(page);
      });

      await test.step("Mes biens → Mes biens", async () => {
        await mf.navigateSidebar("Mes biens");
        await mf.assertPageTitle("Mes biens");
        await checkAccessibility(page);
      });

      await test.step("Mon assemblée générale → Mon assemblée générale", async () => {
        await mf.navigateSidebar("Mon assemblée générale");
        await mf.assertPageTitle("Mon assemblée générale");
        // accessibility check intentionally absent (commented out in source feature)
      });
    },
  );

  test(
    "Display - myFoncia - Pages - Verify all titles pages of the CO-OWNER/Committee member (Anne)",
    { tag: ["@smoke"] },
    async ({ sessionFor }) => {
      const page = await sessionFor("Sophie");
      const mf = new MyFonciaPage(page);

      await checkAccessibility(page);

      await test.step("Ma comptabilité → Mon compte", async () => {
        await mf.navigateSidebar("Ma comptabilité");
        await mf.assertPageTitle("Mon compte");
        await checkAccessibility(page);
      });

      await test.step("Mes paiements → Historique des paiements", async () => {
        await mf.navigateSidebar("Mes paiements");
        await mf.assertPageTitle("Historique des paiements");
        await checkAccessibility(page);
      });

      await test.step("Offres et services → Offres et services", async () => {
        await mf.navigateSidebar("Offres et services");
        await mf.assertPageTitle("Offres et services");
        await checkAccessibility(page);
      });

      await test.step("Mes biens → Mes biens", async () => {
        await mf.navigateSidebar("Mes biens");
        await mf.assertPageTitle("Mes biens");
        await checkAccessibility(page);
      });

      await test.step("Mon assemblée générale → Mon assemblée générale", async () => {
        await mf.navigateSidebar("Mon assemblée générale");
        await mf.assertPageTitle("Mon assemblée générale");
        await checkAccessibility(page);
      });

      await test.step("Mon conseil syndical → Mon conseil syndical + links", async () => {
        await mf.navigateSidebar("Mon conseil syndical");
        await mf.assertPageTitle("Mon conseil syndical");
        await mf.assertLinksVisible([
          "Mes réunions CS",
          "Travaux",
          "Copropriétaires",
          "Contrats et fournisseurs",
          "Visites de l'immeuble",
          "Comptes de l'immeuble",
          "Documents AG à venir",
        ]);
        await checkAccessibility(page);
      });

      await test.step("Mes réunions CS → table columns", async () => {
        await mf.clickLink("Mes réunions CS");
        await mf.assertTableColumns([
          ["Date", "Objet", "Référence", "Nb. de décision(s)"],
        ]);
        await checkAccessibility(page);
      });

      await test.step("Travaux → table columns", async () => {
        await mf.clickLink("Travaux");
        await mf.clickLink("Travaux");
        await mf.assertTableColumns([["Date", "Libellé", "Ref", "Statut"]]);
        await checkAccessibility(page);
      });

      await test.step("Copropriétaires → table columns", async () => {
        await mf.clickLink("Copropriétaires");
        await mf.assertTableColumns([
          [
            "Nom / Dénomination sociale",
            "Domicile réel ou élu / Siège social",
            "Qualité",
            "Lots concernées",
            "Solde",
          ],
        ]);
        await checkAccessibility(page);
      });

      await test.step("Contrats et fournisseurs → table columns", async () => {
        await mf.clickLink("Contrats et fournisseurs");
        await mf.assertTableColumns([["Fournisseur", "Date d'échéance"]]);
        await checkAccessibility(page);
      });

      await test.step("Visites de l'immeuble → table columns", async () => {
        await mf.clickLink("Visites de l'immeuble");
        await mf.assertTableColumns([["Date de la visite", "Objet"]]);
        await checkAccessibility(page);
      });

      await test.step("Comptes de l'immeuble — sub-pages", async () => {
        await mf.clickLink("Comptes de l'immeuble");
        await checkAccessibility(page);

        await mf.clickLink("Comptabilité de l'exercice en cours");
        await mf.assertButtonVisible("Exporter");
        await checkAccessibility(page);

        await mf.clickLink("Comptabilité des exercices passés");
        await mf.assertButtonVisible("Exporter");
        await checkAccessibility(page);

        await mf.clickLink("Comptes Travaux");
        await mf.assertButtonVisible("Exporter");
        await checkAccessibility(page);
      });

      await test.step("Documents AG à venir → title", async () => {
        await mf.clickLink("Documents AG à venir");
        await mf.assertPageTitle("Documents AG à venir");
        await checkAccessibility(page);
      });
    },
  );

  test(
    "Display - myFoncia - Pages - Verify all titles pages of the LESSOR (Julien)",
    { tag: ["@smoke"] },
    async ({ sessionFor }) => {
      const page = await sessionFor("julien");
      const mf = new MyFonciaPage(page);

      await checkAccessibility(page);

      await test.step("Mes demandes → Mes demandes", async () => {
        await mf.navigateSidebar("Mes demandes");
        await mf.assertPageTitle("Mes demandes");
        await checkAccessibility(page);
      });

      await test.step("Mes biens → Mes biens", async () => {
        await mf.navigateSidebar("Mes biens");
        await mf.assertPageTitle("Mes biens");
        await checkAccessibility(page);
      });

      await test.step("Ma comptabilité → Mon compte", async () => {
        await mf.navigateSidebar("Ma comptabilité");
        await mf.assertPageTitle("Mon compte");
        await checkAccessibility(page);
      });
    },
  );

  test(
    "Display - myFoncia - Pages - Verify all titles pages of the TENANT (Charles)",
    { tag: ["@smoke"] },
    async ({ sessionFor }) => {
      const page = await sessionFor("charles");
      const mf = new MyFonciaPage(page);

      await checkAccessibility(page);

      await test.step("Mes demandes → Mes demandes", async () => {
        await mf.navigateSidebar("Mes demandes");
        await mf.assertPageTitle("Mes demandes");
        await checkAccessibility(page);
      });

      await test.step("Ma comptabilité → Mon compte", async () => {
        await mf.navigateSidebar("Ma comptabilité");
        await mf.assertPageTitle("Mon compte");
        await checkAccessibility(page);
      });

      await test.step("Mes paiements → Historique des paiements", async () => {
        await mf.navigateSidebar("Mes paiements");
        await mf.assertPageTitle("Historique des paiements");
        await checkAccessibility(page);
      });

      await test.step("Mes biens → Mes biens", async () => {
        await mf.navigateSidebar("Mes biens");
        await mf.assertPageTitle("Mes biens");
        await checkAccessibility(page);
      });
    },
  );
});

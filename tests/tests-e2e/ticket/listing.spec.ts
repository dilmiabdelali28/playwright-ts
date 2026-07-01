import {
  dismissOpenOverlays,
  fillField,
  multipleSelectFilter,
  selectDropdownList,
  ticketBuildingAutocompleteSelect,
} from "@helpers/ui";

import {
  extractFilters,
  extractTicketItem,
  TicketsPage,
} from "@/pages/ticket/adb-ticket.page";

import { test } from "../../../helpers/auth/session.fixture";
import { expect } from "../../../report/base.fixture";

test(
  "Listing - tickets - Using multi filters",
  {
    tag: ["@smoke"],
  },
  async ({ sessionFor }) => {
    const celine = await sessionFor("adb:Celine");
    const ticketsPage = new TicketsPage(celine);

    // --- Préparer l'attente de la réponse tickets ---
    const ticketPromise = ticketsPage.waitForTickets();
    await ticketsPage.goto("/portfolio/ticket");
    // --- Récupérer le premier ticket depuis l'API ---
    const responseBody = await ticketPromise;
    const item = extractTicketItem(responseBody);
    expect(item).toBeTruthy();
    await ticketsPage.assertTableNotEmpty();

    // --- Extraire les filtres depuis le ticket et appliquer ---
    const associateFilter = extractFilters(item, "associateFullName");
    const buildingFilter = extractFilters(item, "buildingAddress");
    const statusFilter = extractFilters(item, "ticketStatus");
    const ticketRefFilter = extractFilters(item, "ticketRef");

    // --- Appliquer les filtres un par un ---
    await selectDropdownList({
      page: ticketsPage.page,
      dataTestId: "associate",
      by: { searchText: associateFilter.associateFullName! },
    });
    await dismissOpenOverlays(ticketsPage.page);

    await ticketBuildingAutocompleteSelect(
      ticketsPage.page,
      "building",
      buildingFilter.buildingAddress!,
    );

    if (ticketRefFilter.ticketRef) {
      await fillField({
        page: ticketsPage.page,
        testId: "ticketNumber",
        value: ticketRefFilter.ticketRef,
        assertVisible: true,
      });
    }

    await multipleSelectFilter(
      ticketsPage.page,
      "status",
      statusFilter.ticketStatus!,
    );
    await ticketsPage.assertTableNotEmpty();
  },
);

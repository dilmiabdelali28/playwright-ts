/** Entity refs returned by POST /fixture — shape varies per payload factory. */

type FixtureUnitRef = {
  _id?: string;
  building?: string;
  unitNumber?: string;
};

type FixtureBuildingRef = {
  _id?: string;
  buildingNumber?: string;
  buildingName?: string;
  address?: {
    address1?: string;
    city?: string;
    zipCode?: string;
    buildingName?: string;
  };
};

type FixtureCoOwnerAccountRef = {
  _id?: string;
  fullname?: string;
};

type FixtureCustomerRef = {
  _id?: string;
  authentification?: { login?: string };
};

type FixtureLessorAccountRef = {
  _id?: string;
  lessorNumber?: string;
};

type FixtureExpenseRegularizationRef = {
  _id?: string;
};

type FixtureAccountingPeriodRef = {
  _id?: string;
  openingDate?: string;
};

/** Rental management (Payload.rentalManagementContext) — primary unit at units[0]. */
export type RentalManagementFixtureResponse = {
  units: FixtureUnitRef[];
  buildings?: FixtureBuildingRef[];
  customers?: FixtureCustomerRef[];
  lessorAccounts?: FixtureLessorAccountRef[];
};

/** Co-ownership building (Payload.coOwnerShipBuildingContext). */
export type CoOwnershipBuildingFixtureResponse = {
  buildings: FixtureBuildingRef[];
  units?: FixtureUnitRef[];
  coOwnerAccounts?: FixtureCoOwnerAccountRef[];
};

/** Maintenance log building (Payload.maintenanceLogBuildingContext). */
export type MaintenanceLogBuildingFixtureResponse = {
  buildings: FixtureBuildingRef[];
  units?: FixtureUnitRef[];
};

/** AGO mission building (Payload.missionAGOrdinaryContext). */
export type AgoMissionBuildingFixtureResponse = {
  buildings: FixtureBuildingRef[];
  coOwnerAccounts: FixtureCoOwnerAccountRef[];
};

/** Expense regularization entry (Payload.contextToEntryExpenses). */
export type ExpenseRegularizationFixtureResponse = {
  expenseRegularizations?: FixtureExpenseRegularizationRef[];
  accountingPeriods?: FixtureAccountingPeriodRef[];
  units?: FixtureUnitRef[];
  buildings?: FixtureBuildingRef[];
};

/** Rental management ready for expense regularization creation. */
export type RentalManagementForRegularizationFixtureResponse = {
  units?: FixtureUnitRef[];
  buildings?: FixtureBuildingRef[];
  accountingPeriods?: FixtureAccountingPeriodRef[];
};

/** Contexts where building id lives on units[0].building or buildings[0]._id. */
export type BuildingIdentifiableFixtureResponse =
  | RentalManagementFixtureResponse
  | CoOwnershipBuildingFixtureResponse
  | MaintenanceLogBuildingFixtureResponse;

import {
  contextToCreateExpenseRegularizationExternTrustee,
  contextToEntryExpenses,
  coOwnerShipBuildingContext,
  coOwnershipContext,
  createBuildingForInvoiceOptionsContext,
  fullPropertyManagementBuildingContext,
  getMissionLeaseBackUnitGroups,
  getMissionTenantLeaveUnitGroups,
  getUnitsGroup,
  invoiceContext,
  lessorContext,
  maintenanceLogBuildingContext,
  missionAGConstitutiveContext,
  missionAGExtraordinaryContext,
  missionAGExtraordinaryWithCoOwnerEntryExitContext,
  missionAGOrdinaryContext,
  missionCommercialisationContext,
  missionCurrentExpensesRecoveryContext,
  missionLeaseBackContext,
  missionMandateLossContext,
  missionTenantLeaveContext,
  rentalManagementContext,
} from "./contexts";

// biome-ignore lint/complexity/noStaticOnlyClass: TODO
export class Payload {
  static coOwnershipContext = coOwnershipContext;

  static lessorContext = lessorContext;

  static contextToCreateExpenseRegularizationExternTrustee =
    contextToCreateExpenseRegularizationExternTrustee;

  static contextToEntryExpenses = contextToEntryExpenses;

  static rentalManagementContext = rentalManagementContext;

  static missionLeaseBackContext = missionLeaseBackContext;

  static missionTenantLeaveContext = missionTenantLeaveContext;

  static missionAGConstitutiveContext = missionAGConstitutiveContext;

  static missionCommercialisationContext = missionCommercialisationContext;

  static getMissionLeaseBackUnitGroups = getMissionLeaseBackUnitGroups;

  static getMissionTenantLeaveUnitGroups = getMissionTenantLeaveUnitGroups;

  static getUnitsGroup = getUnitsGroup;

  static missionCurrentExpensesRecoveryContext =
    missionCurrentExpensesRecoveryContext;

  static fullPropertyManagementBuildingContext =
    fullPropertyManagementBuildingContext;

  static coOwnerShipBuildingContext = coOwnerShipBuildingContext;

  static maintenanceLogBuildingContext = maintenanceLogBuildingContext;

  static missionMandateLossContext = missionMandateLossContext;

  static invoiceContext = invoiceContext;

  static missionAGOrdinaryContext = missionAGOrdinaryContext;

  static createBuildingForInvoiceOptionsContext =
    createBuildingForInvoiceOptionsContext;

  static missionAGExtraordinaryContext = missionAGExtraordinaryContext;

  static missionAGExtraordinaryWithCoOwnerEntryExitContext =
    missionAGExtraordinaryWithCoOwnerEntryExitContext;
}

import { ExpenseRegularization } from "$fixtures/factory/models/accounting/expenseRegularization";
import { UnitExpenseRegularization } from "$fixtures/factory/models/accounting/unitExpenseRegularization";

import { AccountingAccount } from "../models/accounting/accountingAccount";
import { AccountingPeriod } from "../models/accounting/accountingPeriod";
import { Agency } from "../models/agency";
import { BankInformation } from "../models/bankInformation";
import { Building } from "../models/building";
import { Customer } from "../models/customer";
import { Lease } from "../models/lease";
import { LessorAccount } from "../models/lessorAccount";
import { RentalManagementMandate } from "../models/mandates/rentalManagementMandate";
import {
  RentDetailsCall,
  RentDetailsCallVariable,
} from "../models/rentDetailsCall";
import { Unit } from "../models/unit";
import { UnitsGroup } from "../models/unitsGroup";
import { toPayload } from "./toPayload";

export const contextToCreateExpenseRegularizationExternTrustee = ({
  withAccountingPeriod = false,
}: {
  withAccountingPeriod?: boolean;
} = {}) => {
  const {
    agency,
    lessorCustomer,
    tenantCustomer,
    building,
    appartement,
    bdpBankInformation,
    lessorAccount,
    unitsGroup,
    lease,
    rentalManagementMandate,
    leaseAccountingAccount,
    lessorAccountingAccount,
    rentDetailsCall,
  } = createRentalManagementContext();

  const accountingPeriods = withAccountingPeriod
    ? [
        AccountingPeriod.anAccountingPeriod()
          .withName("Exercice 2023")
          .withAgency(agency)
          .withBuilding(building)
          .withOpeningDate(new Date("2022-12-01T00:00:00.000Z"))
          .withClosingDate(new Date("2023-11-30T00:00:00.000Z"))
          .withLineOfBusiness("G"),
      ]
    : [];

  return toPayload({
    buildings: [building],
    customers: [lessorCustomer, tenantCustomer],
    units: [appartement],
    lessorAccounts: [lessorAccount],
    unitsGroups: [unitsGroup],
    leases: [lease],
    bankInformations: [bdpBankInformation],
    rentalManagementMandates: [rentalManagementMandate],
    accountingAccounts: [leaseAccountingAccount, lessorAccountingAccount],
    rentDetailsCalls: [rentDetailsCall],
    accountingPeriods,
  });
};

export const contextToEntryExpenses = ({
  accountInstitutional = false,
}: {
  accountInstitutional?: boolean;
} = {}) => {
  const {
    agency,
    lessorCustomer,
    tenantCustomer,
    building,
    appartement,
    bdpBankInformation,
    lessorAccount,
    unitsGroup,
    lease,
    rentalManagementMandate,
    leaseAccountingAccount,
    lessorAccountingAccount,
    rentDetailsCall,
  } = createRentalManagementContext({
    accountInstitutional,
  });

  const accountingPeriod = AccountingPeriod.anAccountingPeriod()
    .withName("Exercice 2023")
    .withAgency(agency)
    .withBuilding(building)
    .withOpeningDate(new Date("2022-12-01T00:00:00.000Z"))
    .withClosingDate(new Date("2023-11-30T00:00:00.000Z"))
    .withLineOfBusiness("G");
  const expenseRegularization = ExpenseRegularization.anExpenseRegularization()
    .withBuilding(building)
    .withAgency(agency)
    .withAccountingPeriod(accountingPeriod)
    .withLessorAccount(lessorAccount);
  const unitExpenseRegularization =
    UnitExpenseRegularization.anUnitExpenseRegularization()
      .withBuilding(building)
      .withUnit(appartement)
      .withExpenseRegularization(expenseRegularization);

  return toPayload({
    buildings: [building],
    customers: [lessorCustomer, tenantCustomer],
    units: [appartement],
    lessorAccounts: [lessorAccount],
    unitsGroups: [unitsGroup],
    leases: [lease],
    bankInformations: [bdpBankInformation],
    rentalManagementMandates: [rentalManagementMandate],
    accountingAccounts: [leaseAccountingAccount, lessorAccountingAccount],
    rentDetailsCalls: [rentDetailsCall],
    accountingPeriods: [accountingPeriod],
    expenseRegularizations: [expenseRegularization],
    unitExpenseRegularizations: [unitExpenseRegularization],
  });
};

const createRentalManagementContext = ({
  accountInstitutional = false,
}: {
  accountInstitutional?: boolean;
} = {}) => {
  const agency = Agency.ileDeFrance();
  const lessorCustomer = Customer.bob();
  const tenantCustomer = Customer.mary();
  const building = Building.les3Anes().withNewId();
  const appartement = Unit.anAppartment().ofBuilding(building);
  const bdpBankInformation = BankInformation.atBanqueDeFrance();
  const lessorAccount = LessorAccount.anAccount({
    isInstitutional: accountInstitutional,
  }).addLessor({
    customer: lessorCustomer,
    bankInformation: bdpBankInformation,
  });
  const unitsGroup = UnitsGroup.anUnitsGroup()
    .withBuilding(building)
    .withLessorAccount(lessorAccount)
    .addUnit(appartement, { isMain: true });
  const lease = Lease.aLease()
    .withUnitsGroup(unitsGroup)
    .withLessorAccount(lessorAccount)
    .withTenant(tenantCustomer)
    .withBuilding(building);
  const rentalManagementMandate =
    RentalManagementMandate.aRentalManagementMandate()
      .withLessorAccount(lessorAccount)
      .addUnit({ unit: appartement, lessorAccount });
  const leaseAccountingAccount = AccountingAccount.anAccount()
    .ofLease(lease)
    .withAgency(agency);
  const lessorAccountingAccount = AccountingAccount.anAccount()
    .ofLessorAccount(lessorAccount)
    .withAgency(agency);
  const rentDetailsCall = RentDetailsCall.aRentDetailsCall()
    .withUnitsGroup(unitsGroup)
    .withAgency(agency)
    .withBuilding(building)
    .withLease(lease)
    .withLessorAccount(lessorAccount)
    .withPeriodStartDate(new Date("2023-04-30T00:00:00.000Z"))
    .withEndPeriodDate(new Date("2023-05-30T23:59:59.000Z"))
    .withStatementDate(new Date("2023-05-30T23:59:59.000Z"))
    .withVariables([
      RentDetailsCallVariable.aVariable()
        .from(new Date("2023-04-30T00:00:00.000Z"))
        .to(new Date("2023-05-30T23:59:59.000Z")),
    ]);

  return {
    agency,
    lessorCustomer,
    tenantCustomer,
    building,
    appartement,
    bdpBankInformation,
    lessorAccount,
    unitsGroup,
    lease,
    rentalManagementMandate,
    leaseAccountingAccount,
    lessorAccountingAccount,
    rentDetailsCall,
  };
};

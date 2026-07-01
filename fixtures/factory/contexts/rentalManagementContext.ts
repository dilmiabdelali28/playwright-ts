import { AccountingAccount } from "../models/accounting/accountingAccount";
import type { AccountingLine } from "../models/accounting/accountingLine";
import { Agency } from "../models/agency";
import { BankInformation } from "../models/bankInformation";
import { Building } from "../models/building";
import { Customer } from "../models/customer";
import type { Feature } from "../models/feature";
import { Lease } from "../models/lease";
import { LessorAccount } from "../models/lessorAccount";
import { RentalManagementMandate } from "../models/mandates/rentalManagementMandate";
import type { MediaPayment } from "../models/mediaPayment";
import { Unit } from "../models/unit";
import { UnitsGroup } from "../models/unitsGroup";
import { toPayload } from "./toPayload";

export const rentalManagementContext = ({
  features = [],
  accountingLines = [],
  mediaPayments = [],
}: {
  features?: Feature[];
  accountingLines?: AccountingLine[];
  mediaPayments?: MediaPayment[];
}) => {
  const agency = Agency.ileDeFrance();
  const lessorCustomer = Customer.bob();
  const tenantCustomer = Customer.mary();
  const building = Building.leParnassien();
  const appartement = Unit.anAppartment().ofBuilding(building);
  const bdpBankInformation = BankInformation.atBanqueDeFrance();
  const bnpBankInformation = BankInformation.atBnp();
  const lessorAccount = LessorAccount.anAccount().addLessor({
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
    .withTenant(tenantCustomer);
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

  return toPayload({
    features,
    customers: [lessorCustomer, tenantCustomer],
    units: [appartement],
    lessorAccounts: [lessorAccount],
    unitsGroups: [unitsGroup],
    leases: [lease],
    bankInformations: [bdpBankInformation],
    rentalManagementMandates: [rentalManagementMandate],
    accountingAccounts: [leaseAccountingAccount, lessorAccountingAccount],
    accountingLines: accountingLines.map((accountingLine) =>
      accountingLine.inAccount(leaseAccountingAccount),
    ),
    mediaPayments: mediaPayments.map((mediaPayment) =>
      mediaPayment
        .withAgency(agency)
        .withBeneficiaryLease(lease)
        .withCreditorBankInformation(bnpBankInformation),
    ),
  });
};

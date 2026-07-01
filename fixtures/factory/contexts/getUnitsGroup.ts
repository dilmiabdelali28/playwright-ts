import { Agency } from "../models/agency";
import { BankInformation } from "../models/bankInformation";
import { Branch } from "../models/branch";
import { Building } from "../models/building";
import { Customer } from "../models/customer";
import type { Feature } from "../models/feature";
import { Lease } from "../models/lease";
import { LessorAccount } from "../models/lessorAccount";
import { Unit } from "../models/unit";
import { UnitsGroup } from "../models/unitsGroup";
import { toPayload } from "./toPayload";

export const getUnitsGroup = ({
  features = [],
  status = "",
  isExcludedManagement = false,
}: {
  features?: Feature[];
  type?: string;
  status?: string;
  isExcludedManagement?: boolean;
}) => {
  const agency = Agency.vendee();
  const branch = Branch.barbatre().withAgency(agency);
  const lessorCustomer = Customer.bob();
  const lessorCustomer2 = Customer.harmony();
  const tenantCustomer = Customer.mary();
  const building = Building.leParnassien();
  const appartment = Unit.anAppartment()
    .withCurrentCreatedAtAndUpdatedAtDates()
    .ofBuilding(building);

  const bdpBankInformation = BankInformation.atBanqueDeFrance();

  const lessorAccount = LessorAccount.anAccount()
    .withBranch(branch)
    .withAgency(agency)
    .addLessor({
      customer: lessorCustomer,
      bankInformation: bdpBankInformation,
      paymentType: "SELF_PRINTED_CHECK",
    });
  const lessorAccount2 = LessorAccount.anAccount()
    .withBranch(branch)
    .withAgency(agency)
    .addLessor({
      customer: lessorCustomer2,
      bankInformation: bdpBankInformation,
      paymentType: "SELF_PRINTED_CHECK",
    });
  const unitsGroup = UnitsGroup.aUnitsGroupWithoutUnitGroupNumber()
    .withBuilding(building)
    .withLessorAccount(lessorAccount)
    .addUnit(appartment, { isMain: true })
    .withAvailabilityStatus(status)
    .withTitle(
      isExcludedManagement
        ? `Fixture - IsRentalOnly Units group of type apartment with status ${status}`
        : "Fixture - Units group of type apartment with status TO_PUT_ON_THE_MARKET",
    )
    .withAgency(agency);

  const oldLease = Lease.aLease()
    .withUnitsGroup(unitsGroup)
    .withLessorAccount(lessorAccount2)
    .withTenant(tenantCustomer)
    .withStatus("DRAFT");

  unitsGroup.withOldLease(oldLease.getId());

  return toPayload({
    features,
    customers: [lessorCustomer, lessorCustomer2, tenantCustomer],
    units: [appartment],
    lessorAccounts: [lessorAccount, lessorAccount2],
    unitsGroups: [
      isExcludedManagement ? unitsGroup.setIsExcludedManagement() : unitsGroup,
    ],
    leases: [oldLease],
  });
};

import { Agency } from "../models/agency";
import { BankInformation } from "../models/bankInformation";
import { Branch } from "../models/branch";
import { Building } from "../models/building";
import { Customer } from "../models/customer";
import type { Feature } from "../models/feature";
import { LessorAccount } from "../models/lessorAccount";
import { Unit } from "../models/unit";
import { UnitsGroup } from "../models/unitsGroup";
import { toPayload } from "./toPayload";

export const getMissionTenantLeaveUnitGroups = ({
  features = [],
}: {
  features?: Feature[];
}) => {
  const agency = Agency.vendee();
  const branch = Branch.barbatre().withAgency(agency);
  const lessorCustomer = Customer.bob().with({ qualities: ["LANDLORD"] });
  const tenantCustomer = Customer.mary().with({ qualities: ["TENANT"] });
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

  const unitsGroups = Array.from({ length: 2 }).map(() =>
    UnitsGroup.aUnitsGroupWithoutUnitGroupNumber()
      .withBuilding(building)
      .withLessorAccount(lessorAccount)
      .addUnit(appartment, { isMain: true })
      .withAgency(agency),
  );

  unitsGroups[0] = unitsGroups[0]
    .withAvailabilityStatus("BEING_MARKETED")
    .withTitle(
      "Fixture - Test MissionTenantLeave - associé à MissionNewMandate",
    );
  unitsGroups[1] = unitsGroups[1]
    .withAvailabilityStatus("LEASE_ENTRY_ONGOING")
    .withTitle(
      "Fixture - Test MissionTenantLeave - associé à MissionTenantLeave",
    );

  return toPayload({
    features,
    customers: [lessorCustomer, tenantCustomer],
    units: [appartment],
    lessorAccounts: [lessorAccount],
    unitsGroups,
  });
};

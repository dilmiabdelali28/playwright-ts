import { ApplicationForm } from "$fixtures/factory/models/rentalManagement/applicationForm";

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

export const getMissionLeaseBackUnitGroups = ({
  features = [],
  hasAcceptedApplicationForm = false,
}: {
  features?: Feature[];
  hasAcceptedApplicationForm?: boolean;
}) => {
  const agency = Agency.vendee();
  const branch = Branch.barbatre().withAgency(agency);
  const lessorCustomer = Customer.bob();
  const tenantCustomer = Customer.mary();
  const building = Building.leParnassien();
  const rentalManagementApplicationForms = [];

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

  const unitsGroup = UnitsGroup.aUnitsGroupWithoutUnitGroupNumber()
    .withBuilding(building)
    .withLessorAccount(lessorAccount)
    .addUnit(appartment, { isMain: true })
    .withAvailabilityStatus("BEING_MARKETED")
    .withTitle("Fixture - Test MissionLeaseBack - associé à MissionNewMandate")
    .withAgency(agency);

  let secondUnitsGroup = UnitsGroup.aUnitsGroupWithoutUnitGroupNumber()
    .withBuilding(building)
    .withLessorAccount(lessorAccount)
    .addUnit(appartment, { isMain: true })
    .withAvailabilityStatus("LEASE_ENTRY_ONGOING")
    .withTitle("Fixture - Test MissionLeaseBack - associé à MissionLeaseBack")
    .withAgency(agency);

  if (hasAcceptedApplicationForm) {
    const applicationForm = ApplicationForm.anApplicationForm()
      .withCandidate(lessorCustomer, {
        isMain: true,
      })
      .withLeaseBroker(tenantCustomer);

    secondUnitsGroup = secondUnitsGroup.with({
      unitGroupsApplicationForm: [
        {
          applicationForm: applicationForm.getId(),
          status: "ACCEPTED",
          changeStatusDate: new Date(),
          isArchived: false,
        },
      ],
    });
    rentalManagementApplicationForms.push(applicationForm);
  }

  return toPayload({
    rentalManagementApplicationForms,
    features,
    customers: [lessorCustomer, tenantCustomer],
    units: [appartment],
    lessorAccounts: [lessorAccount],
    unitsGroups: [unitsGroup, secondUnitsGroup],
  });
};

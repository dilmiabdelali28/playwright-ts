import { MissionMarketing } from "$fixtures/factory/models/missions/missionMarketing";

import { Agency } from "../models/agency";
import { Associate } from "../models/associate";
import { Building } from "../models/building";
import type { Customer } from "../models/customer";
import type { Feature } from "../models/feature";
import type { LessorAccount } from "../models/lessorAccount";
import { RentalManagementMandate } from "../models/mandates/rentalManagementMandate";
import { MissionNewMandate } from "../models/missions/missionNewMandate";
import type { Unit } from "../models/unit";
import type { UnitsGroup } from "../models/unitsGroup";
import { toPayload } from "./toPayload";

export const missionCommercialisationContext = ({
  features = [],
  unitsGroups = [],
  appartment,
  lessorAccount,
  isExcludedManagement = false,
  createMissionMarketing = false,
  customers,
}: {
  features?: Feature[];
  unitsGroups: UnitsGroup[];
  appartment: Unit;
  customers: Customer[];
  lessorAccount: LessorAccount;
  isExcludedManagement?: boolean;
  createMissionMarketing?: boolean;
}) => {
  const agency = Agency.vendee();
  const associate = Associate.karine().withAgency(agency);
  const building = Building.leParnassien();
  const [unitsGroup] = unitsGroups;
  const [lessorCustomer] = customers;

  const rentalManagementMandate =
    RentalManagementMandate.aRentalManagementMandate()
      .withLessorAccount(lessorAccount)
      .addUnit({ unit: appartment, lessorAccount });

  const missionNewMandate = MissionNewMandate.aMissionNewMandate()
    .withAgency(agency)
    .withBuilding(building)
    .withAssociate(associate)
    .withLessorAccount(lessorAccount, associate)
    .addUnit(appartment)
    .withUnitsGroup(unitsGroup, false)
    .withRentalManagementMandate(
      isExcludedManagement
        ? rentalManagementMandate.setIsExcludedManagement()
        : rentalManagementMandate,
    )
    .withStatus("FINISHED")
    .withExcludedManagement();

  let missionMarketing: MissionMarketing | undefined;

  if (createMissionMarketing) {
    missionMarketing = MissionMarketing.aMissionMarketing()
      .withAgency(agency)
      .withAssociate(associate)
      .withUnitsGroup(unitsGroup)
      .withStatus("OPEN")
      .withCustomer(lessorCustomer)
      .withHousing(appartment)
      .withStepsHistory();
  }

  return toPayload({
    features,
    rentalManagementMandates: [rentalManagementMandate],
    missionNewMandates: [missionNewMandate],
    ...(missionMarketing && { missionMarketings: [missionMarketing] }),
  });
};

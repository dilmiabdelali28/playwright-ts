import moment from "moment";

import { Agency } from "../models/agency";
import { Associate } from "../models/associate";
import { Building } from "../models/building";
import type { Customer } from "../models/customer";
import type { Feature } from "../models/feature";
import { Lease } from "../models/lease";
import type { LessorAccount } from "../models/lessorAccount";
import { RentalManagementMandate } from "../models/mandates/rentalManagementMandate";
import { MissionLeaseBack } from "../models/missions/missionLeaseBack";
import { MissionNewMandate } from "../models/missions/missionNewMandate";
import type { Unit } from "../models/unit";
import type { UnitsGroup } from "../models/unitsGroup";
import { toPayload } from "./toPayload";

export const missionLeaseBackContext = (
  {
    features = [],
    unitsGroups = [],
    appartment,
    customers,
    lessorAccount,
  }: {
    features?: Feature[];
    unitsGroups: UnitsGroup[];
    appartment: Unit;
    customers: Customer[];
    lessorAccount: LessorAccount;
  },
  { hasExistingLease = false }: { hasExistingLease?: boolean } = {},
) => {
  const agency = Agency.vendee();
  const associate = Associate.karine().withAgency(agency);
  const building = Building.leParnassien();
  const [unitsGroup, secondUnitsGroup] = unitsGroups;
  const [lessorCustomer, tenantCustomer] = customers;

  const leaseOfNewMandate = Lease.aLease()
    .withUnitsGroup(unitsGroup)
    .withLessorAccount(lessorAccount)
    .withTenant(tenantCustomer);
  const leases = [leaseOfNewMandate];

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
    .withUnitsGroup(unitsGroup)
    .withRentalManagementMandate(rentalManagementMandate)
    .withStatus("FINISHED");

  let missionLeaseBack = MissionLeaseBack.aMissionLeaseBack()
    .withAgency(agency)
    .addUnit(appartment)
    .withUnitsGroup(secondUnitsGroup)
    .withAssociate(associate)
    .withCustomer(lessorCustomer)
    .withStatus("OPEN");

  if (hasExistingLease) {
    const leaseOfLeaseBack = Lease.aLease()
      .withUnitsGroup(secondUnitsGroup)
      .withLessorAccount(lessorAccount)
      .withTenant(tenantCustomer)
      .with({
        status: "LEASE_ENTRY_ONGOING",
        rentIssuance: {
          parameters: {
            subjectToVAT: false,
            term: "DUE",
            frequency: "ANNUAL",
          },
        },
        insurances: {
          multiriskUnit: {
            insuranceType: "EXTERNAL",
            policyNumber: "M001",
            startDate: new Date(),
            dueDate: moment().add(1, "year").toDate(),
          },
        },
        startDate: new Date(),
        entryDate: new Date(),
        endDate: moment().add(1, "year").toDate(),
      });

    missionLeaseBack = missionLeaseBack.withLease(leaseOfLeaseBack);
    leases.push(leaseOfLeaseBack);
  }

  return toPayload({
    features,
    leases,
    rentalManagementMandates: [rentalManagementMandate],
    missionNewMandates: [missionNewMandate],
    missionLeaseBacks: [missionLeaseBack],
  });
};

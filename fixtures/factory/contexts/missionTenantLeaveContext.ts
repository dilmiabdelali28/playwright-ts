import moment from "moment";

import { AccountingAccount } from "$fixtures/factory/models/accounting/accountingAccount";

import { Agency } from "../models/agency";
import { Associate } from "../models/associate";
import { Building } from "../models/building";
import type { Customer } from "../models/customer";
import type { Feature } from "../models/feature";
import { Lease } from "../models/lease";
import type { LessorAccount } from "../models/lessorAccount";
import { RentalManagementMandate } from "../models/mandates/rentalManagementMandate";
import { MissionNewMandate } from "../models/missions/missionNewMandate";
import { MissionTenantLeave } from "../models/missions/missionTenantLeave";
import type { Unit } from "../models/unit";
import type { UnitsGroup } from "../models/unitsGroup";
import { toPayload } from "./toPayload";

export const missionTenantLeaveContext = ({
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
}) => {
  const agency = Agency.vendee();
  const associate = Associate.karine().withAgency(agency);
  const building = Building.leParnassien();
  const [unitsGroup] = unitsGroups;
  const [lessorCustomer, tenantCustomer] = customers;

  const now = new Date();
  const futureDate = moment(now).add(30, "days").toDate();

  const lease = Lease.aLease()
    .withUnitsGroup(unitsGroup)
    .withLessorAccount(lessorAccount)
    .withTenant(tenantCustomer)
    .with({
      status: "TENANT_VACATED",
      tenantLeaveManagement: {
        leaveReceptionDate: now.toISOString(),
        desiredDate: futureDate.toISOString(),
        noticeDuration: 1,
        validatedDate: futureDate.toISOString(),
        comment: "Test",
        leaveReason: "LAW_89_THREE_MONTH",
        trueDate: futureDate.toISOString(),
      },
      tenantSettlement: {
        paymentType: "SELF_PRINTED_CHECK",
      },
    });

  const accountingAccount = AccountingAccount.anAccount()
    .withAgency(agency)
    .ofLease(lease);

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

  const missionTenantLeave = MissionTenantLeave.aMissionTenantLeave()
    .withAgency(agency)
    .addUnit(appartment)
    .withLease(lease)
    .withAssociate(associate)
    .withCustomer(lessorCustomer)
    .withStatus("OPEN");

  return toPayload({
    features,
    accountingAccounts: [accountingAccount],
    leases: [lease],
    rentalManagementMandates: [rentalManagementMandate],
    missionNewMandates: [missionNewMandate],
    missionTenantLeaves: [missionTenantLeave],
  });
};

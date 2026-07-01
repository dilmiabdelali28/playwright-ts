import { EUR } from "$fixtures/factory/amount";
import { Agency } from "$fixtures/factory/models/agency";
import { Customer } from "$fixtures/factory/models/customer";
import { Lease } from "$fixtures/factory/models/lease";
import {
  RentDetailsCall,
  RentDetailsCallVariable,
} from "$fixtures/factory/models/rentDetailsCall";
import { UnitsGroup } from "$fixtures/factory/models/unitsGroup";
import { AxiosFixtureService } from "$fixtures/services/axios/fixture.service";

import { AccountingAccount } from "../models/accounting/accountingAccount";
import { AccountingLine } from "../models/accounting/accountingLine";
import { AllocationKey } from "../models/allocationKey";
import { Building } from "../models/building";
import { RegularizationPeriod } from "../models/lease-accounting/regularizationPeriod";
import { LessorAccount } from "../models/lessorAccount";
import { RentalManagementMandate } from "../models/mandates/rentalManagementMandate";
import { Unit } from "../models/unit";
import { addToFixtureContext } from "./singleton";
import { toPayload } from "./toPayload";

const fixtureService = new AxiosFixtureService();

type FullPropertyManagementBuildingContextParams = {
  accessToken: string;
  fixtureEnv: Record<string, { API_BASE_URL?: string }>;
  associate: string;
  agency: string;
  branch: string;
};

export const fullPropertyManagementBuildingContext = async ({
  accessToken,
  fixtureEnv,
  associate,
  agency: agencyId,
  branch,
}: FullPropertyManagementBuildingContextParams) => {
  const contextLeaseAccounting = [];

  const lessorAccount = LessorAccount.anAccount();
  const building = Building.les3Anes().withNewId();
  const agency = Agency.newAgency(agencyId);
  const unit1 = Unit.anAppartment()
    .ofBuilding(building)
    .withCoOwnershipBylawsId("1");
  const unit2 = Unit.anAppartment2()
    .ofBuilding(building)
    .withCoOwnershipBylawsId("2");
  const mandate = RentalManagementMandate.aRentalManagementMandate()
    .withLessorAccount(lessorAccount)
    .addUnit({ unit: unit1, lessorAccount })
    .addAssociate({ associate, isMain: false })
    .withAgency(agencyId)
    .withBranch(branch);

  try {
    const allocationKey001 = AllocationKey.anAllocationKey()
      .withBuilding(building)
      .withKind("ALLOCATION_RATE")
      .withNumber("001")
      .withGenericTitle("CHARGES GENERALES")
      .withSpecificTitle("CHARGES GENERALES");

    const accountingAccount = AccountingAccount.anAccount()
      .withBuilding(building)
      .withAccountingClass("4500")
      .withLineOfBusiness("G")
      .withAgency(agency);

    const accountingLines = AccountingLine.debit(EUR(3500))
      .withBuilding(building)
      .withAllocationKey(allocationKey001)
      .inAccount(accountingAccount)
      .withAccountingRegularizationDate(
        new Date("2022-11-30T18:08:36.461+01:00"),
      );

    const regulPeriod = await RegularizationPeriod.newPeriod2022()
      .withBuilding(building)
      .withAgency(agencyId)
      .create(accessToken, fixtureEnv);

    const unitGroup = UnitsGroup.anUnitsGroup()
      .withBuilding(building)
      .withAgency(agency)
      .withLessorAccount(lessorAccount)
      .addUnit(unit1, { isMain: true })
      .addUnit(unit2, { isMain: false });

    const tenantCustomer = Customer.bob();

    const lease = Lease.aLease()
      .withLessorAccount(lessorAccount)
      .withBuilding(building)
      .withUnitsGroup(unitGroup)
      .withTenant(tenantCustomer);

    const rentDetailsCall = RentDetailsCall.aRentDetailsCall()
      .withUnitsGroup(unitGroup)
      .withAgency(agency)
      .withLease(lease)
      .withPeriodStartDate(new Date("2022-04-30T00:00:00.000Z"))
      .withEndPeriodDate(new Date("2022-04-30T23:59:59.000Z"))
      .withStatementDate(new Date("2022-04-30T22:00:00.000Z"))
      .withVariables([
        RentDetailsCallVariable.aVariable()
          .to(new Date("2022-04-01T00:00:00.000Z"))
          .from(new Date("2022-04-30T23:59:59.999Z")),
      ]);

    contextLeaseAccounting.push(regulPeriod);
    addToFixtureContext({ contextLeaseAccounting });

    return toPayload({
      unitsGroups: [unitGroup],
      customers: [tenantCustomer],
      leases: [lease],
      accountingLines: [accountingLines],
      lessorAccounts: [lessorAccount],
      accountingAccounts: [accountingAccount],
      buildings: [building],
      units: [unit1, unit2],
      rentalManagementMandates: [mandate],
      allocationKeys: [allocationKey001],
      rentDetailsCalls: [rentDetailsCall],
    });
  } catch (error) {
    fixtureService.deleteRealEstateFixture(accessToken, fixtureEnv);

    throw error;
  }
};

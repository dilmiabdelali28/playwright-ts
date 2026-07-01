import ObjectID from "bson-objectid";
import moment from "moment";

import associates from "../../datasets/associates.json";
import { AccountingPeriod } from "../models/accounting/accountingPeriod";
import { Agency } from "../models/agency";
import { AllocationKey } from "../models/allocationKey";
import { BankInformation } from "../models/bankInformation";
import { Branch } from "../models/branch";
import { Building } from "../models/building";
import { CoOwnerAccount } from "../models/coOwnerAccount";
import { Customer } from "../models/customer";
import { CoOwnershipMandate } from "../models/mandates/coOwnershipMandate";
import { Unit } from "../models/unit";
import { toPayload } from "./toPayload";

export const missionAGExtraordinaryWithCoOwnerEntryExitContext = (
  buildingName: string,
) => {
  const coOwnershipMandateId = new ObjectID().toHexString();
  const associateId = new ObjectID().toHexString();
  const entranceId = new ObjectID().toHexString();

  const agency = Agency.ileDeFrance();
  const bdfBankInformation = BankInformation.atBanqueDeFrance();
  const bnpBankInformation = BankInformation.atBnp();
  const branch = Branch.ac2();

  const uniqueBuildingName = `${Date.now()} - ${buildingName}`;

  const building = Building.forAG(uniqueBuildingName)
    .with({
      "coOwnershipDetails.coOwnershipMandate": coOwnershipMandateId,
      "coOwnershipDetails.accountantMainBankAccount":
        bdfBankInformation.payload._id,
    })
    .withCurrentCreatedAtAndUpdatedAtDates()
    .with({
      "physicalBuildings[0].access.entrances[0]._id": entranceId,
    });

  const coOwnershipMandate = CoOwnershipMandate.anAGCoOwnershipMandate()
    .withBuilding(building)
    .withId(coOwnershipMandateId)
    .withAgency(agency)
    .withBranch(branch)
    .withStatus("ACTIVE")
    .withCurrentCreatedAtAndUpdatedAtDates()
    .withMainAssociate(associateId, associates.guilhem._id)
    .withAccountantAssociate(associateId, associates.yazid._id);

  const coOwnerAPresent = Customer.bob().with({
    firstName: "A-Present",
    fullname: "A-Present Playwright",
  });
  const coOwnerPresent = Customer.bob().with({
    firstName: "Present",
    fullname: "Present Playwright",
  });

  const coOwnerRemote = Customer.bob().with({
    firstName: "Remote",
    fullname: "Remote Playwright",
  });
  const coOwnerAbsent = Customer.bob().with({
    firstName: "Absent",
    fullname: "Absent Playwright",
  });

  const coOwnerProxy = Customer.bob().with({
    firstName: "Proxy",
    fullname: "Proxy Playwright",
  });

  const coOwnerLateEntry = Customer.bob().with({
    firstName: "Late-Entry",
    fullname: "Late-Entry Playwright",
  });

  const appartements = Array.from({ length: 6 }, (_, index) =>
    Unit.anAppartment()
      .with({
        coOwnershipBylawsId: `${150 + index}`,
        unitLegacyNumber: `${150 + index}`,
      })
      .withCurrentCreatedAtAndUpdatedAtDates()
      .ofBuilding(building),
  );

  const coOwnerAccounts = [
    CoOwnerAccount.anAccount()
      .withBuilding(building)
      .withFullOwnershipHolder(coOwnerAPresent)
      .withBankInformation(bdfBankInformation)
      .withOnDemandBankInformation(bnpBankInformation)
      .addUnit(appartements[0]),
    CoOwnerAccount.anAccount()
      .withBuilding(building)
      .withFullOwnershipHolder(coOwnerPresent)
      .withBankInformation(bdfBankInformation)
      .withOnDemandBankInformation(bnpBankInformation)
      .addUnit(appartements[1]),
    CoOwnerAccount.anAccount()
      .withBuilding(building)
      .withFullOwnershipHolder(coOwnerRemote)
      .withBankInformation(bdfBankInformation)
      .withOnDemandBankInformation(bnpBankInformation)
      .addUnit(appartements[2]),
    CoOwnerAccount.anAccount()
      .withBuilding(building)
      .withFullOwnershipHolder(coOwnerAbsent)
      .withBankInformation(bdfBankInformation)
      .withOnDemandBankInformation(bnpBankInformation)
      .addUnit(appartements[3]),
    CoOwnerAccount.anAccount()
      .withBuilding(building)
      .withFullOwnershipHolder(coOwnerProxy)
      .withBankInformation(bnpBankInformation)
      .withOnDemandBankInformation(bnpBankInformation)
      .addUnit(appartements[4]),
    CoOwnerAccount.anAccount()
      .withBuilding(building)
      .withFullOwnershipHolder(coOwnerLateEntry)
      .withBankInformation(bnpBankInformation)
      .withOnDemandBankInformation(bnpBankInformation)
      .addUnit(appartements[5]),
  ];

  for (let i = 0; i < appartements.length; i++) {
    for (const unit of [appartements[i]]) {
      unit.withCoOwnerAccount(coOwnerAccounts[i]);
    }
  }

  let openingDate = moment().subtract(1, "years").startOf("year");
  let closingDate = moment().subtract(1, "years").endOf("year");

  const allocationKeys = [
    AllocationKey.anAllocationKey()
      .withBuilding(building)
      .withNumber("001")
      .withShareBase(1500)
      .withGenericTitle("CHARGES GENERALES")
      .addUnit(appartements[0], { fractionalShares: 500 })
      .addUnit(appartements[1], { fractionalShares: 200 })
      .addUnit(appartements[2], { fractionalShares: 300 })
      .addUnit(appartements[3], { fractionalShares: 400 })
      .addUnit(appartements[4], { fractionalShares: 100 })
      .addUnit(appartements[5], { fractionalShares: 100 })
      .withIsMain(true),
    AllocationKey.anAllocationKey()
      .withBuilding(building)
      .withShareBase(1000)
      .withNumber("002")
      .withGenericTitle("Eau")
      .addUnit(appartements[0], { fractionalShares: 500 })
      .addUnit(appartements[1], { fractionalShares: 200 })
      .addUnit(appartements[2], { fractionalShares: 300 })
      .addUnit(appartements[3], { fractionalShares: 400 })
      .addUnit(appartements[4], { fractionalShares: 100 })
      .addUnit(appartements[5], { fractionalShares: 100 }),
  ];

  const accountingPeriods = Array.from(
    {
      length: 3,
    },
    (_, index) => {
      const accountingPeriod = AccountingPeriod.anAccountingPeriod()
        .withName(`Exercice ${openingDate.format("YYYY")}`)
        .withAgency(agency)
        .withBuilding(building)
        .withOpeningDate(openingDate.toDate())
        .withClosingDate(closingDate.toDate())
        .withStatus(index === 0 ? "DIVIDED" : "OPEN")
        .withAppendixes();

      openingDate = openingDate.add(1, "year");
      closingDate = closingDate.add(1, "year");

      return accountingPeriod;
    },
  );

  return toPayload({
    customers: [
      coOwnerAPresent,
      coOwnerPresent,
      coOwnerRemote,
      coOwnerAbsent,
      coOwnerProxy,
      coOwnerLateEntry,
    ],
    units: appartements,
    coOwnershipMandates: [coOwnershipMandate],
    bankInformations: [bdfBankInformation, bnpBankInformation],
    buildings: [building],
    accountingPeriods,
    allocationKeys,
    coOwnerAccounts,
  });
};

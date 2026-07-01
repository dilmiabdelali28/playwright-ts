import ObjectID from "bson-objectid";
import moment from "moment";

import associates from "../../datasets/associates.json";
import { AccountingAccount } from "../models/accounting/accountingAccount";
import { Agency } from "../models/agency";
import { BankInformation } from "../models/bankInformation";
import { Branch } from "../models/branch";
import { Building } from "../models/building";
import { CoOwnerAccount } from "../models/coOwnerAccount";
import { Customer } from "../models/customer";
import {
  CoOwnershipMandate,
  type Status,
} from "../models/mandates/coOwnershipMandate";
import { Pricing } from "../models/pricing";
import { Unit } from "../models/unit";
import { toPayload } from "./toPayload";

type DataTable = {
  hashes(): Array<Record<string, string>>;
};

export const coOwnerShipBuildingContext = (
  mandateNumber: number,
  dataProps: DataTable,
) => {
  const coOwnershipMandateId = new ObjectID().toHexString();
  const associateId = new ObjectID().toHexString();
  const entranceId = new ObjectID().toHexString();
  const physicalBuildingId = new ObjectID().toHexString();
  const agency = Agency.ileDeFrance();
  const bdfBankInformation = BankInformation.atBanqueDeFrance();
  const bnpBankInformation = BankInformation.atBnp();
  const branch = Branch.ac2();
  const building = Building.forAG("Les brasseurs")
    .with({
      "coOwnershipDetails.coOwnershipMandate": coOwnershipMandateId,
      "coOwnershipDetails.accountantMainBankAccount":
        bdfBankInformation.payload._id,
    })
    .withCurrentCreatedAtAndUpdatedAtDates()
    .with({
      "physicalBuildings[0].access.entrances[0]._id": entranceId,
      "physicalBuildings[0]._id": physicalBuildingId,
    });

  const coOwnershipMandates = Array.from(
    {
      length: mandateNumber,
    },
    (_, index) => {
      const status = dataProps.hashes()[index].mandateStatus as Status;
      const coOwnershipMandate = CoOwnershipMandate.aCoOwnershipMandate()
        .withBranch(branch)
        .withBuilding(building)
        .withAgency(agency)
        .withStatus(status)
        .withCurrentCreatedAtAndUpdatedAtDates()
        .withMainAssociate(associateId, associates.guilhem._id)
        .withEndDate(moment().subtract(1, "days").toDate());

      return coOwnershipMandate;
    },
  );

  const pricings = coOwnershipMandates.flatMap((coOwnershipMandate) =>
    Pricing.coOwnershipPricings(agency, building, coOwnershipMandate),
  );

  const bob = Customer.bob();
  const bobAppartement = Unit.anAppartment().ofBuilding(building);

  const coOwnerAccount = CoOwnerAccount.anAccount()
    .withBuilding(building)
    .withFullOwnershipHolder(bob)
    .withBankInformation(bdfBankInformation)
    .withOnDemandBankInformation(bnpBankInformation)
    .addUnit(bobAppartement);

  for (const unit of [bobAppartement]) {
    unit.withCoOwnerAccount(coOwnerAccount);
  }

  const accountingAccount = AccountingAccount.anAccount()
    .ofCoOwnerAccount(coOwnerAccount)
    .withAgency(agency);

  return toPayload({
    customers: [bob],
    units: [bobAppartement],
    coOwnershipMandates,
    buildings: [building],
    accountingAccounts: [accountingAccount],
    coOwnerAccounts: [coOwnerAccount],
    pricings,
  });
};

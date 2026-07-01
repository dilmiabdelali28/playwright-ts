import ObjectID from "bson-objectid";
import moment from "moment";

import associates from "../../datasets/associates.json";
import { EUR } from "../amount";
import { AccountingAccount } from "../models/accounting/accountingAccount";
import { AccountingLine } from "../models/accounting/accountingLine";
import { AccountingPeriod } from "../models/accounting/accountingPeriod";
import {
  AmoutPerAllocationKey,
  AmoutPerExpenseType,
  Budget,
  BudgetDetails,
  Timetable,
} from "../models/accounting/budget";
import { ExpenseType } from "../models/accounting/expensType";
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

export const createBuildingForInvoiceOptionsContext = (
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
  // .withCreateWithBankName(bdfBankInformation);

  const coOwnershipMandate = CoOwnershipMandate.anAGCoOwnershipMandate()
    .withBuilding(building)
    .withId(coOwnershipMandateId)
    .withAgency(agency)
    .withBranch(branch)
    .withStatus("ACTIVE")
    .withCurrentCreatedAtAndUpdatedAtDates()
    .withMainAssociate(associateId, associates.guilhem._id)
    .withAccountantAssociate(associateId, associates.yazid._id);

  const bob = Customer.bob().with({
    email: `bob${Date.now().toString()}@kgxds4df.mailosaur.net`,
  });

  const bobAppartement = Unit.anAppartment()
    .withCurrentCreatedAtAndUpdatedAtDates()
    .ofBuilding(building);

  const mary = Customer.mary().with({
    email: `mary${Date.now().toString()}@kgxds4df.mailosaur.net`,
  });

  const maryAppartement = Unit.anAppartment2()
    .withCurrentCreatedAtAndUpdatedAtDates()
    .ofBuilding(building);

  const coOwnerAccounts = [
    CoOwnerAccount.anAccount()
      .withBuilding(building)
      .withFullOwnershipHolder(bob)
      .withBankInformation(bdfBankInformation)
      .withOnDemandBankInformation(bnpBankInformation)
      .addUnit(bobAppartement),
    CoOwnerAccount.anAccount()
      .withBuilding(building)
      .withFullOwnershipHolder(mary)
      .withBankInformation(bnpBankInformation)
      .withOnDemandBankInformation(bnpBankInformation)
      .addUnit(maryAppartement),
  ];

  for (const unit of [bobAppartement]) {
    unit.withCoOwnerAccount(coOwnerAccounts[0]);
  }

  for (const unit of [maryAppartement]) {
    unit.withCoOwnerAccount(coOwnerAccounts[1]);
  }

  let openingDate = moment().subtract(1, "years").startOf("year");
  let closingDate = moment().subtract(1, "years").endOf("year");

  const allocationKeys = [
    AllocationKey.anAllocationKey()
      .withBuilding(building)
      .withNumber("001")
      .withShareBase(1500)
      .withGenericTitle("CHARGES GENERALES")
      .addUnit(bobAppartement, { fractionalShares: 1000 })
      .addUnit(maryAppartement, { fractionalShares: 500 })
      .withIsMain(true),
    AllocationKey.anAllocationKey()
      .withBuilding(building)
      .withShareBase(1000)
      .withNumber("002")
      .withGenericTitle("Eau")
      .addUnit(bobAppartement, { fractionalShares: 500 })
      .addUnit(maryAppartement, { fractionalShares: 500 }),
  ];

  const accountingAccount = AccountingAccount.anAccount()
    .withBuilding(building)
    .withAccountingClass("7010")
    .withLineOfBusiness("S")
    .withAgency(agency)
    .with({ "third.target": coOwnerAccounts[0].payload._id });

  const accountingLines = AccountingLine.debit(EUR(3500))
    .withBuilding(building)
    .withAllocationKey(allocationKeys[0])
    .inAccount(accountingAccount);

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

  const timeTable = Timetable.aTimetable()
    .withAmount(EUR(1500))
    .withScheduledAt(accountingPeriods[1].payload.openingDate)
    .withCalledAt(accountingPeriods[1].payload.openingDate);

  //current budget
  const amountPerAllocationKey = new AmoutPerAllocationKey({})
    .withAllocationKey(allocationKeys[0])
    .withAmount(EUR(1500));

  const budgetDetails = BudgetDetails.aBudgetDetails()
    .withAmount(EUR(1500))
    .withVotedAmount(EUR(1500))
    .withFinancing({
      FUNDS_CALL: {
        amount: EUR(1500),
        amountPerAllocationKey: [amountPerAllocationKey],
      },
    })
    .withTimetable([timeTable])
    .withAmountPerExpenseType([
      AmoutPerExpenseType.anAmoutPerExpenseType()
        .withAmount(EUR(1500))
        .withAllocationKey(allocationKeys[0])
        .withExpenseType(ExpenseType.buildingAccessContract()),
    ]);

  const previousBudget = Budget.aBudget()
    .withKind("CURRENT_EXPENSES")
    .withBuilding(building)
    .withAccountingPeriod(accountingPeriods[0])
    .withValidated(budgetDetails)
    //.withDividedAt()
    .withStatus("VALIDATED")
    .withCalRecurrence(3);

  const currentBudget = Budget.aBudget()
    .withKind("CURRENT_EXPENSES")
    .withBuilding(building)
    .withAccountingPeriod(accountingPeriods[1])
    .withValidated(budgetDetails)
    .withStatus("VALIDATED")

    .withCalRecurrence(3);

  return toPayload({
    customers: [bob, mary],
    units: [bobAppartement, maryAppartement],
    coOwnershipMandates: [coOwnershipMandate],
    bankInformations: [bnpBankInformation],
    accountingLines: [accountingLines],
    budgets: [previousBudget, currentBudget],
    accountingAccounts: [accountingAccount],
    buildings: [building],
    accountingPeriods,
    allocationKeys,
    coOwnerAccounts,
  });
};

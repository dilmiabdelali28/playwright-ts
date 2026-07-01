import ObjectID from "bson-objectid";
import moment from "moment";

import { EUR } from "../amount";
import { AccountingPeriod } from "../models/accounting/accountingPeriod";
import {
  AmoutPerExpenseType,
  Budget,
  BudgetDetails,
} from "../models/accounting/budget";
import { ExpenseType } from "../models/accounting/expensType";
import { Agency } from "../models/agency";
import { AllocationKey } from "../models/allocationKey";
import { Associate } from "../models/associate";
import { BankInformation } from "../models/bankInformation";
import { Branch } from "../models/branch";
import { Building } from "../models/building";
import { CoOwnerAccount } from "../models/coOwnerAccount";
import { Customer } from "../models/customer";
import { CoOwnershipMandate } from "../models/mandates/coOwnershipMandate";
import { MissionCurrentExpensesRecovery } from "../models/missions/missionCurrentExpensesRecovery";
import { Unit } from "../models/unit";
import { UnitsGroup } from "../models/unitsGroup";
import { toPayload } from "./toPayload";

export const missionCurrentExpensesRecoveryContext = () => {
  const missionId = new ObjectID().toHexString();
  const coOwnershipMandateId = new ObjectID().toHexString();
  const missionOrigin = {
    kind: "MissionCurrentExpensesRecovery",
    target: missionId,
  };
  const bdfBankInformation = BankInformation.atBanqueDeFrance();
  const bnpBankInformation = BankInformation.atBnp();
  const agency = Agency.vendee();
  const branch = Branch.barbatre().withAgency(agency);
  const associate = Associate.karine().withAgency(agency);
  const building = Building.aBuilding().withOrigin(missionOrigin).with({
    "coOwnershipDetails.coOwnershipMandate": coOwnershipMandateId,
    "coOwnershipDetails.accountantMainBankAccount":
      bdfBankInformation.payload._id,
  });
  const coOwnershipMandate = CoOwnershipMandate.aCoOwnershipMandate()
    .withBuilding(building)
    .withId(coOwnershipMandateId)
    .withAgency(agency)
    .withBranch(branch)
    .withMainAssociate("641b33b503850797575c0d7c", "60e1551d8778c60019117271");

  const bob = Customer.bob();
  const bobAppartement = Unit.anAppartment()
    .ofBuilding(building)
    .setIsMain(true);
  const bobParking = Unit.aParking().ofBuilding(building).setIsMain(false);
  const bobUnitsGroup = UnitsGroup.anUnitsGroup()
    .withBuilding(building)
    .addUnit(bobAppartement)
    .addUnit(bobParking);
  const mary = Customer.mary();
  const maryAppartement = Unit.anAppartment()
    .ofBuilding(building)
    .setIsMain(true);
  const maryParking = Unit.aParking().ofBuilding(building).setIsMain(false);
  const maryUnitsGroup = UnitsGroup.anUnitsGroup()
    .withBuilding(building)
    .addUnit(maryAppartement)
    .addUnit(maryParking);

  const coOwnerAccounts = [
    CoOwnerAccount.anAccount()
      .withBuilding(building)
      .withFullOwnershipHolder(bob)
      .withBankInformation(bdfBankInformation)
      .withOnDemandBankInformation(bnpBankInformation)
      .addUnit(bobAppartement)
      .addUnit(bobParking),
    CoOwnerAccount.anAccount()
      .withBuilding(building)
      .withFullOwnershipHolder(mary)
      .withBankInformation(bnpBankInformation)
      .withOnDemandBankInformation(bnpBankInformation)
      .addUnit(maryAppartement)
      .addUnit(maryParking),
  ];
  // const accountingAccounts = coOwnerAccounts.map((coOwnerAccount) =>
  //   AccountingAccount.anAccount()
  //     .ofCoOwnerAccount(coOwnerAccount)
  //     .withAgency(agency),
  // );

  let openingDate = moment()
    .subtract(2, "years")
    .startOf("day")
    .startOf("year");
  let closingDate = moment().subtract(2, "year").endOf("day").endOf("year");

  const allocationKeys = [
    AllocationKey.anAllocationKey()
      .withOrigin(missionOrigin)
      .withIsBeingDevelopedBy(missionOrigin)
      .withBuilding(building)
      .withNumber("001")
      .withShareBase(1500)
      .withGenericTitle("Charges générales")
      .addUnit(bobAppartement, { fractionalShares: 500 })
      .addUnit(bobParking, { fractionalShares: 250 })
      .addUnit(maryAppartement, { fractionalShares: 500 })
      .addUnit(maryParking, { fractionalShares: 250 }),
    AllocationKey.anAllocationKey()
      .withOrigin(missionOrigin)
      .withIsBeingDevelopedBy(missionOrigin)
      .withBuilding(building)
      .withShareBase(1000)
      .withNumber("002")
      .withGenericTitle("Eau")
      .addUnit(bobAppartement, { fractionalShares: 500 })
      .addUnit(maryAppartement, { fractionalShares: 500 }),
    AllocationKey.anAllocationKey()
      .withOrigin(missionOrigin)
      .withIsBeingDevelopedBy(missionOrigin)
      .withBuilding(building)
      .withNumber("003")
      .withShareBase(1000)
      .withGenericTitle("Place de parking")
      .addUnit(bobParking, { fractionalShares: 500 })
      .addUnit(maryParking, { fractionalShares: 500 }),
  ];

  const accountingPeriods = Array.from(
    {
      length: 4,
    },
    (_, index) => {
      const accountingPeriod = AccountingPeriod.anAccountingPeriod()
        .withName(`Exercice ${openingDate.format("YYYY")}`)
        .withOrigin(missionOrigin)
        .withAgency(agency)
        .withBuilding(building)
        .withIsBeingDevelopedBy(missionOrigin)
        .withOpeningDate(openingDate.toDate())
        .withClosingDate(closingDate.toDate())
        .withStatus(index === 0 ? "DIVIDED" : "OPEN");

      openingDate = openingDate.add(1, "year");
      closingDate = closingDate.add(1, "year");

      return accountingPeriod;
    },
  );

  const currentExpensesBudgets = Array.from(
    {
      length: 4,
    },
    (_, index) => {
      const allocationKey = allocationKeys[index % 3];
      const budgetDetails = BudgetDetails.aBudgetDetails()
        .withAmount(EUR(1500))
        .withVotedAmount(EUR(1500))
        .withFinancing({})
        .withTimetable([])
        .withAmountPerExpenseType([
          AmoutPerExpenseType.anAmoutPerExpenseType()
            .withAmount(EUR(1500))
            .withAllocationKey(allocationKey)
            .withExpenseType(ExpenseType.buildingAccessContract()),
        ]);

      return Budget.aBudget()
        .withKind("CURRENT_EXPENSES")
        .withBuilding(building)
        .withAccountingPeriod(accountingPeriods[index])
        .withOrigin(missionOrigin)
        .withIsBeingDevelopedBy(missionOrigin)
        .withProposed(budgetDetails)
        .withStatus("VALIDATED");
    },
  );

  const workFundReserveBudget = Array.from(
    {
      length: 4,
    },
    (_, index) => {
      const allocationKey = allocationKeys[index % 3];
      const budgetDetails = BudgetDetails.aBudgetDetails()
        .withAmount(EUR(1500))
        .withVotedAmount(EUR(1500))
        .withFinancing({})
        .withTimetable([])
        .withAmountPerExpenseType([
          AmoutPerExpenseType.anAmoutPerExpenseType()
            .withAmount(EUR(1500))
            .withAllocationKey(allocationKey)
            .withExpenseType(ExpenseType.buildingAccessContract()),
        ]);

      return Budget.aBudget()
        .withLabel("Fonds travaux")
        .withKind("WORK_FUND_RESERVE")
        .withBuilding(building)
        .withAccountingPeriod(accountingPeriods[index])
        .withOrigin(missionOrigin)
        .withIsBeingDevelopedBy(missionOrigin)
        .withProposed(budgetDetails)
        .withAllocationKey(allocationKey)
        .withStatus("VALIDATED");
    },
  );

  const missionCurrentExpensesRecovery =
    MissionCurrentExpensesRecovery.aMissionCurrentExpensesRecovery()
      .withId(missionId)
      .withAgency(agency)
      .withBuilding(building)
      .withLabel(`${building.payload.buildingName} - Mission reprise CC`)
      .withAssociate(associate)
      .withProvisionMeters(
        workFundReserveBudget.map((budget) => ({
          budget: budget.payload._id,
          accountingPeriod: budget.payload.accountingPeriod,
          budgetKind: budget.payload.kind,
          credit: EUR(2500),
        })),
      )
      .withStatus("OPEN");

  return toPayload({
    customers: [bob, mary],
    units: [bobAppartement, bobParking, maryAppartement, maryParking],
    unitsGroups: [bobUnitsGroup, maryUnitsGroup],
    coOwnershipMandates: [coOwnershipMandate],
    budgets: [...currentExpensesBudgets, ...workFundReserveBudget],
    buildings: [building],
    accountingPeriods,
    allocationKeys,
    coOwnerAccounts,
    // accountingAccounts,
    missionCurrentExpensesRecoveries: [missionCurrentExpensesRecovery],
  });
};

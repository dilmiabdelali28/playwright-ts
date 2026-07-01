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
import { Associate } from "../models/associate";
import { BankInformation } from "../models/bankInformation";
import { Branch } from "../models/branch";
import { Building } from "../models/building";
import { CoOwnerAccount } from "../models/coOwnerAccount";
import { Customer } from "../models/customer";
import { File } from "../models/file";
import { CoOwnershipMandate } from "../models/mandates/coOwnershipMandate";
import { MissionTrusteeContract } from "../models/missions/missionTrusteeContract";
import { Unit } from "../models/unit";
import { toPayload } from "./toPayload";

export const missionAGOrdinaryContext = (buildingName: string) => {
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

  let openingDate = moment().startOf("month").subtract(6, "months");
  let closingDate = moment().add(5, "months").endOf("month");
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

  /*  const currentExpensesBudgets = Array.from(
    {
      length: 2,
    },
    (_, index) => {
      const allocationKey = allocationKeys[index % 2];
      const amountPerAllocationKey = new AmoutPerAllocationKey({})
        .withAllocationKey(allocationKey)
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
            .withAllocationKey(allocationKey)
            .withExpenseType(ExpenseType.buildingAccessContract()),
        ]);

      return Budget.aBudget()
        .withKind("CURRENT_EXPENSES")
        .withBuilding(building)
        .withAccountingPeriod(accountingPeriods[index])
        .withProposed(budgetDetails)
        .withStatus("PROPOSED")
        .withCalRecurrence(3);
    },
  );
*/

  const propositionId = new ObjectID().toHexString();
  const missionTrusteeContract =
    MissionTrusteeContract.aMissionTrusteeContract()
      .withAgency(agency)
      .withBuilding(building)
      .withLabel(`${building.payload.buildingName} - Mission contrat de syndic`)
      .withAssociate(Associate.guilhem().withAgency(agency)) // TODO: check the right associate
      .withCurrentAccountingPeriod({
        _id: accountingPeriods[0].getId(),
        closingDate: new Date(),
      })
      .withPropositions([
        {
          _id: propositionId,
          generalAssemblyDate: moment().add(1, "months").toDate(),
          contractualConditions: {
            contract: {
              beginning: moment().startOf("year").toDate(),
              end: moment().add(24, "months").toDate(),
            },
            buildingVisit: {
              contractNumberOfVisits: 2,
              maxTimeMinutes: 60,
            },
            generalAssemblies: {
              contractNumberOfGeneralAssemblies: 1,
              maxTimeMinutes: 120,
            },
            trusteeCouncilMeetings: {
              contractNumberOfMeetings: 1,
              maxTimeMinutes: 120,
            },
            managementType: "SDC",
            vatTracking: false,
            vote: {
              accountTypeActuel: "SEPARATE",
            },
            trusteeCouncilMembers: [],
          },
          pricings: [
            {
              codification: "HONB",
              data: {
                amount: {
                  amountHT: {
                    value: 420800,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 84160,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 504960,
                    currency: "EUR",
                  },
                },
                nextReviewDate: new Date(),
                index: "COMPOSITE_INDEX",
              },
            },
            {
              codification: "ADPC",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "DCCE",
              data: {
                amount: {
                  amountHT: {
                    value: 4167,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 833,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 5000,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "DCDT",
              data: {
                amount: {
                  amountHT: {
                    value: 5000,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 1000,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 6000,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "DDPE",
              data: {
                amount: {
                  amountHT: {
                    value: 3250,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 650,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 3900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "DEPV",
              data: {
                amount: {
                  amountHT: {
                    value: 4167,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 833,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 5000,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "DOSF",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "DPV",
              data: {
                amount: {
                  amountHT: {
                    value: 26583,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 5317,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 31900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "DRIP",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "HTVX",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "IMMT",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "LICO",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "MLHY",
              data: {
                amount: {
                  amountHT: {
                    value: 29167,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 5833,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 35000,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "MSHHO",
              data: {
                amount: {
                  amountHT: {
                    value: 21125,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 4224,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 25349,
                    currency: "EUR",
                  },
                },
                markupRate: 50,
              },
            },
            {
              codification: "MUTV",
              data: {
                amount: {
                  amountHT: {
                    value: 31667,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 6333,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 38000,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "PAGD",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "PAGS",
              data: {
                amount: {
                  amountHT: {
                    value: 2000,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 400,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 2400,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "PCSD",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "PCSS",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "PROT",
              data: {
                amount: {
                  amountHT: {
                    value: 18750,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 3750,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 22500,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "PVIS",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "RCNI",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "RDCM",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "RDCO",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "RL1",
              data: {
                amount: {
                  amountHT: {
                    value: 4833,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 967,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 5800,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "RL2",
              data: {
                amount: {
                  amountHT: {
                    value: 3667,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 733,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 4400,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "RL4",
              data: {
                amount: {
                  amountHT: {
                    value: 37500,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 7500,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 45000,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "RL5C",
              data: {
                amount: {
                  amountHT: {
                    value: 37500,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 7500,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 45000,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "RL5S",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "RL6",
              data: {
                amount: {
                  amountHT: {
                    value: 29167,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 5833,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 35000,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "SEXT",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "SINC",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "SUBV",
              data: {
                amount: {
                  amountHT: {
                    value: 14083,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 2817,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 16900,
                    currency: "EUR",
                  },
                },
              },
            },
            {
              codification: "VOPP",
              data: {
                amount: {
                  amountHT: {
                    value: 29167,
                    currency: "EUR",
                  },
                  rateVAT: 20,
                  amountVAT: {
                    value: 5833,
                    currency: "EUR",
                  },
                  amountTTC: {
                    value: 35000,
                    currency: "EUR",
                  },
                },
              },
            },
          ],
          trusteeCouncilTimeSlots: [
            {
              day: "MONDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: true,
            },
            {
              day: "TUESDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: true,
            },
            {
              day: "WEDNESDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: true,
            },
            {
              day: "THURSDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: true,
            },
            {
              day: "FRIDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: true,
            },
            {
              day: "SATURDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: false,
            },
            {
              day: "SUNDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: false,
            },
          ],
          GATimeSlots: [
            {
              day: "MONDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: true,
            },
            {
              day: "TUESDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: true,
            },
            {
              day: "WEDNESDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: true,
            },
            {
              day: "THURSDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: true,
            },
            {
              day: "FRIDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: true,
            },
            {
              day: "SATURDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: false,
            },
            {
              day: "SUNDAY",
              morning: {
                start: "9:00",
                end: "12:00",
              },
              afternoon: {
                start: "14:00",
                end: "18:00",
              },
              isOpen: false,
            },
          ],
          durationBillingModeAmount: {
            amountHT: {
              value: 14083,
              currency: "EUR",
            },
            rateVAT: 20,
            amountVAT: {
              value: 2817,
              currency: "EUR",
            },
            amountTTC: {
              value: 16900,
              currency: "EUR",
            },
          },
          isCompleted: true,
        },
      ])
      .withStatus("OPEN");

  const file = File.trusteeContract(
    propositionId,
    missionTrusteeContract.getId(),
  );

  return toPayload({
    customers: [bob, mary],
    units: [bobAppartement, maryAppartement],
    coOwnershipMandates: [coOwnershipMandate],
    bankInformations: [bdfBankInformation, bnpBankInformation],
    accountingLines: [accountingLines],
    budgets: [previousBudget, currentBudget],
    accountingAccounts: [accountingAccount],
    buildings: [building],
    files: [file],
    accountingPeriods,
    allocationKeys,
    coOwnerAccounts,
    missionTrusteeContracts: [missionTrusteeContract],
  });
};

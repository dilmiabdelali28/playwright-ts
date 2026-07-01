import { BaseObject } from "../baseObject";
import type { Agency } from "./agency";
import type { Building } from "./building";
import type { CoOwnershipMandate } from "./mandates/coOwnershipMandate";

const coOwnershipCodifications = [
  "247I",
  "ACHE",
  "AFFR",
  "AFPR",
  "DCA",
  "HONB",
  "HTVX",
  "LICO",
  "MUTV",
  "PAGD",
  "PAGS",
  "PCSD",
  "PCSS",
  "PVIS",
  "RL1",
  "RL2",
  "RL4",
  "RL5C",
  "RL6",
  "SINC",
  "IMMT",
  "ADPC",
  "DCCE",
  "DEPV",
  "DCDT",
  "DOSF",
  "DDPE",
  "MLHY",
  "VOPP",
  "SEXT",
  "PROT",
  "RDCO",
  "RCNI",
  "MSHHO",
  "RDCM",
  "SUBV",
  "DPV",
];

const markupRateByCodification: Record<string, number> = {
  MSHHO: 50,
};

export class Pricing extends BaseObject {
  static coOwnershipPricings(
    agency: Agency,
    building: Building,
    coOwnershipMandate: CoOwnershipMandate,
  ) {
    return coOwnershipCodifications.map((codification) =>
      Pricing.aPricing("S", codification)
        .withAgency(agency)
        .withCoOwnershipMandate(coOwnershipMandate)
        .withBuilding(building)
        .withAutoApplyMarkupRate(),
    );
  }

  static aPricing = (lineOfBusiness: "S" | "G", codification: string) => {
    return new Pricing(defaultPayload())
      .withCodification(codification)
      .withLineOfBusiness(lineOfBusiness);
  };

  withCodification = (codification: string) => {
    this.payload.codification = codification;

    return this;
  };

  withAutoApplyMarkupRate = () => {
    const markupRate = markupRateByCodification[this.payload?.codification];

    if (markupRate) {
      const rateToApply = markupRate ? markupRate / 100 + 1 : 1;

      this.payload.amount.amountHT.value =
        this.payload.amount.amountHT.value * rateToApply;
      this.payload.amount.amountTTC.value =
        this.payload.amount.amountTTC.value * rateToApply;
      this.payload.amount.amountVAT.value =
        this.payload.amount.amountVAT.value * rateToApply;
    }

    return this;
  };

  withLineOfBusiness = (lineOfBusiness: string) => {
    this.payload.lineOfBusiness = lineOfBusiness;

    return this;
  };

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });

  withBuilding = (building: Building) =>
    this.with({ building: building.payload._id });

  withCoOwnershipMandate = (coOwnershipMandate: CoOwnershipMandate) =>
    this.with({
      coOwnershipMandate: coOwnershipMandate.payload._id,
    });
}

function defaultPayload() {
  return {
    amount: {
      amountHT: {
        value: 1000,
        currency: "EUR",
      },
      rateVAT: 200,
      amountVAT: {
        value: 200,
        currency: "EUR",
      },
      amountTTC: {
        value: 1200,
        currency: "EUR",
      },
    },
    dates: {
      start: new Date("2024-01-01"),
    },
    lineOfBusiness: "S",
    nbUnit: 1,
  };
}

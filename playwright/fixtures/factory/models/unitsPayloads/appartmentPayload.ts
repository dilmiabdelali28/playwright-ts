import { diagnosticsPayload } from "./commonUnitPayload";

export const appartmentPayload = {
  type: "APARTMENT",
  subtype: "T2",
  levels: [],
  category: "APARTMENT",
  equipments: [],
  entrance: {
    equipments: [],
    address: {
      completeAddress: "1 Rue Fernand Léger 58640 Varennes-Vauzelles",
      address1: "1 Rue Fernand Léger",
      zipCode: "58640",
      zipCodeLink: "58640",
      city: "Varennes-Vauzelles",
      cityLink: "VARESNNES-VAUZELLES",
      country: "France",
      countryCode: "FRA",
      location: {
        type: "Point",
        coordinates: [3.1608071, 47.0240235],
      },
    },
    access: {
      emitters: [],
      pinpads: [],
    },
    stairs: [],
  },
  version: 4,
  stairs: [],
  diagnostics: diagnosticsPayload,
  createdAt: "2023-09-16T13:21:13.808Z",
  updatedAt: "2023-09-16T13:30:49.999Z",
  alur: {
    unitTotal: 0,
    yearlyChargesShare: 1018.62,
    hasTroubles: false,
    isCoOwnership: true,
  },
  area: {
    surface: 41.63,
    carrez: 41.63,
  },
  fees: {
    yearlyAmount: 1018.62,
  },
  fluid: {
    hotWater: {
      type: "ELECTRIC",
      mode: "INDIVIDUAL",
    },
  },
  heating: {
    type: ["ELECTRICITY"],
    mode: "INDIVIDUAL",
    hasAC: false,
    hasFireplace: false,
  },
  coOwnershipBylawsId: "154",
  layout: {
    inside: [
      {
        kind: "BEDROOM",
        equipments: [],
      },
    ],
    outside: [],
  },
  location: {
    level: "0",
  },
  occupationSituation: {
    situation: "FREE",
  },
  unitLegacyNumber: "154",
};

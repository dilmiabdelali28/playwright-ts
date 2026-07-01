import { diagnosticsPayload } from "./commonUnitPayload";

export const housePayload = {
  type: "HOUSE",
  subtype: "T5",
  category: "HOUSING",
  equipments: [],
  entrance: {
    address: {
      completeAddress: "5 Place de la Mairie 72330 La Fontaine-Saint-Martin",
      address1: "5 Place de la Mairie",
      zipCode: "72330",
      city: "La Fontaine-Saint-Martin",
      country: "France",
      countryCode: "FRA",
      location: {
        type: "Point",
        coordinates: [0.0503427, 47.7912359],
      },
    },
    access: {
      emitters: [],
      pinpads: [],
    },
    equipments: [],
    stairs: [],
  },
  version: 11,
  stairs: [],
  diagnostics: diagnosticsPayload,
  createdAt: "2023-09-16T13:45:28.239Z",
  updatedAt: "2023-09-16T13:54:49.395Z",
  alur: {
    unitTotal: 0,
    yearlyChargesShare: 0,
    hasTroubles: false,
    isCoOwnership: false,
  },
  area: {
    surface: 113,
    carrez: 113,
  },
  construction: {
    constructionYear: 1940,
    roofNature: "SLATE",
    roofCondition: "TO_REVIEW",
  },
  fluid: {
    hotWater: {
      type: "ELECTRIC",
    },
  },
  heating: {
    type: ["WOOD_BURNER", "ELECTRICITY"],
  },
  land: {
    type: "TREE_FILLED",
    totalSurfaceArea: 640,
    hasFence: true,
    canBeLeveled: true,
    canHavePool: true,
    _id: "6505b3a97b030c99555eba65",
  },
  landRegistryReference: " /  /  /  / 640",
  layout: {
    inside: [
      {
        kind: "OTHER",
        area: {
          carrez: 11,
        },
        level: 0,
        generalCondition: "TO_RENOVATE",
        equipments: [],
      },
      {
        kind: "BEDROOM",
        area: {
          carrez: 21.8,
        },
        level: 0,
        generalCondition: "TO_RENOVATE",
        equipments: [],
      },
      {
        kind: "BEDROOM",
        area: {
          carrez: 11.35,
        },
        level: 0,
        generalCondition: "TO_RENOVATE",
        equipments: [],
      },
      {
        kind: "BEDROOM",
        area: {
          carrez: 10.41,
        },
        level: 0,
        generalCondition: "TO_RENOVATE",
        equipments: [],
      },
      {
        kind: "SITTING_ROOM",
        area: {
          carrez: 15.66,
        },
        level: 0,
        generalCondition: "RESTORE",
        equipments: [],
      },
      {
        kind: "CORRIDOR",
        area: {
          carrez: 5,
        },
        level: 0,
        generalCondition: "RESTORE",
        equipments: [],
      },
      {
        kind: "BOX_ROOM",
        area: {
          carrez: 2.57,
        },
        level: 0,
        generalCondition: "TO_RENOVATE",
        equipments: [],
      },
      {
        kind: "KITCHEN",
        kitchenCondition: "EMPTY",
        area: {
          carrez: 14,
        },
        level: 0,
        generalCondition: "RESTORE",
        equipments: [],
      },
      {
        kind: "WC",
        area: {
          carrez: 1.41,
        },
        generalCondition: "RESTORE",
        equipments: [],
      },
      {
        kind: "SHOWER_ROOM",
        area: {
          carrez: 3.86,
        },
        generalCondition: "RESTORE",
        equipments: [],
      },
      {
        kind: "VERANDA",
        area: {
          carrez: 16,
        },
        level: 0,
        generalCondition: "GOOD_CONDITION",
        equipments: [],
      },
    ],
    outside: [],
  },
  occupationSituation: {
    situation: "FREE",
  },
  utilityNetwork: {
    sewerageType: "ALL_IN_SEWER",
    hasWater: true,
    hasElec: true,
  },
};

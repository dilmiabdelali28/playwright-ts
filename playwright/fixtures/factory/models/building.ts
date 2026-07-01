import buildings from "$fixtures/datasets/myFoncia/buildings.json";

import { BaseObject } from "../baseObject";
import { buildingPayloadForAG } from "./buildingsPayloads/buildingPayloadForAG";
import type { Customer } from "./customer";

type BuildingAddress = {
  address1: string;
  zipCode: string;
  city: string;
  countryCode: string;
  completeAddress: string;
};

export class Building extends BaseObject {
  static leParnassien = () => new Building(buildings.leParnassien);

  static lePasteur = () => new Building(buildings.lePasteur);

  static les3Anes = () => {
    const buildingName = `Les 3 mules ${Date.now().toString()}`;

    return new Building(buildings.les3Anes).withBuildingName(buildingName);
  };

  static forAG = (buildingName: string) => {
    const num = Math.round(Math.random() * 10000000);
    const address1 = `${num} Rue ${buildingName}`;
    const address = {
      address1,
      zipCode: "75008",
      city: "PARIS",
      countryCode: "FRA",
      completeAddress: `${address1} PARIS 75008`,
    };

    return new Building(
      buildingPayloadForAG(buildingName, address),
    ).withNewId();
  };

  static aBuilding = () => {
    const num = Math.round(Math.random() * 100000);
    const address1 = `${num} Boulevard de la nation`;
    const buildingName = "Les brasseurs 7";
    const address = {
      address1,
      zipCode: "75008",
      city: "PARIS",
      countryCode: "FRA",
      completeAddress: `${address1} PARIS 75008`,
    };

    return new Building(defaultPayload(buildingName, address)).withNewId();
  };

  withPromoter = (promoter: Customer) => {
    this.with({ "promoter.customer._id": promoter.payload._id });

    return this;
  };

  withBuildingName = (buildingName: string) => {
    this.payload.buildingName = buildingName;

    return this;
  };
}

const defaultPayload = (buildingName: string, address: BuildingAddress) => ({
  _id: "<TO FILL>",
  heat: {
    energy: "UNDEFINED",
    boilerYear: 0,
    insulationWorkYear: 0,
  },
  buildingName,
  kind: "BuildingComplet",
  fluids: {
    heat: {
      hasFuelTank: false,
      hasHeatNetwork: false,
      gasHvacSecurity: false,
      heatDistributor: false,
      hasPrivateCalorimeters: false,
    },
    hotWater: {
      collective: false,
      hasIndividualMeter: false,
    },
    metering: false,
    coldWater: {
      collective: false,
      hasIndividualMeter: false,
    },
    waterTreatment: false,
    sewageConnection: false,
    hasBoosterStation: false,
  },
  status: "ACTIVE",
  address,
  services: [],
  documents: [],
  employees: [],
  caretakerLodge: {
    timetables: [],
  },
  completionDate: "2023-04-08T22:00:00Z",
  managementType: "FONCIA_TRUSTEE",
  conciergeOffice: {
    exist: false,
  },
  accountingPeriod: {
    duration: 12,
  },
  numberOfElevators: 0,
  physicalBuildings: [
    {
      access: {
        stairs: [],
        entrances: [
          {
            info: {
              alur: {
                zone: "A",
              },
              access: {
                pinpads: [],
                emitters: [],
              },
              address,
            },
            stairs: [],
          },
        ],
      },
      surface: {
        garden: false,
      },
      identity: {
        physicalBuildingName: "batiment 32",
        physicalBuildingPermitDate: "2023-04-08T22:00:00Z",
      },
      equipements: {
        stairs: [],
        entrances: [
          {
            index: 0,
            equipements: [],
          },
        ],
      },
    },
  ],
  coOwnershipDetails: {
    insurances: [
      {
        type: "MULTI_RISK_BUILDING",
      },
      {
        type: "LOT_CONSTRUCTION_DAMAGE",
      },
      {
        type: "OTHER",
      },
    ],
    description: {
      numberOfFloors: 0,
      identificationNumber: {
        address: {
          types: [],
          completeAddress: "",
        },
        landRegistryReference: "",
        numberIdentificationNumber: "<TO FILL>",
      },
    },
    cashflowThreshold: {
      value: 0,
      currency: "EUR",
    },
    coOwnershipMandate: "<TO FILL>",
    trusteeCouncilThreshold: {
      value: 0,
      currency: "EUR",
    },
    accountantMainBankAccount: "<TO FILL>",
  },
  rentalManagementStatus: false,
  coOwnershipTrusteeStatus: true,
});

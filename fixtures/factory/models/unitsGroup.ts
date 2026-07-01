import { BaseObject } from "../baseObject";
import type { Agency } from "./agency";
import type { Building } from "./building";
import type { LessorAccount } from "./lessorAccount";
import type { Unit } from "./unit";

export class UnitsGroup extends BaseObject {
  static anUnitsGroup = () => new UnitsGroup(defaultPayload).withNewId();

  static aUnitsGroupWithoutUnitGroupNumber = () =>
    new UnitsGroup(defaultPayload).withNewId();

  withBuilding = (building: Building) =>
    this.with({
      building: building.payload._id,
      address:
        building.payload?.physicalBuildings?.[0]?.access?.entrances?.[0]?.info
          ?.address ?? building?.payload?.address,
    });

  withLessorAccount = (lessorAccount: LessorAccount) =>
    this.with({ lessor: lessorAccount.payload._id });

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });

  withTitle = (title: string) => this.with({ title });

  addUnit(unit: Unit, { isMain = false } = {}) {
    this.payload.units.push({
      unit: unit.payload._id,
      isMain,
    });

    return this;
  }

  withAvailabilityStatus = (availabilityStatus: string) =>
    this.with({
      availability: {
        status: availabilityStatus,
      },
    });

  withOldLease = (oldLeaseId: string) => {
    return this.with({
      oldLease: oldLeaseId,
    });
  };

  setIsExcludedManagement() {
    this.payload.availability.isRentalOnly = true;

    return this;
  }
}

const defaultPayload = {
  unitsGroupLegacyNumber: "227",
  lessor: "5e5db02ce3356b7cd3798824",
  manager: "60e1551d8778c60019117271",
  managementBranch: "5e5dafde101332be2afe132d",
  rentalBranches: ["5e5dafdedf5c148a5dfe1480"],
  building: "5e5db02d75998d35ed7b0955",
  units: [],
  address: {
    address1: "RUE DES LONGS PRES, RUE DU DOME,",
    address2: "RUE DU POINT DU JOUR, RUE DANJOU",
    city: "BOULOGNE BILLANCOURT",
    countryCode: "FRA",
    zipCode: "92100",
    completeAddress:
      "RUE DES LONGS PRES, RUE DU DOME, RUE DU POINT DU JOUR, RUE DANJOU BOULOGNE BILLANCOURT 92100",
  },
  openingDate: "2009-08-03T22:00:00.000Z",
  title: "Fixture BOX N°227",
  descriptions: {
    leaseDescription: "",
    commercialDescription:
      "DANS QUARTIER POINT DU JOUR BOX EN SOUS SOL DANS IMMEUBLE SÉCURISÉ",
    leaseDescriptionAppendix: "box en sous-sol sécurisé",
    comments: "",
  },
  availability: {
    status: "CANCELLED",
  },
  displayAmounts: {
    rentIncludingExpenses: {
      value: 4325,
      currency: "EUR",
    },
  },
  webPublishing: {
    isActive: false,
    isExclusive: true,
    portals: [
      {
        isActive: false,
        code: "0",
        name: "foncia.com",
      },
      {
        isActive: false,
        code: "1",
        name: "Se loger",
      },
      {
        isActive: false,
        code: "18",
        name: "Le bon coin",
      },
      {
        isActive: false,
        code: "24",
        name: "Ouest france",
      },
    ],
  },
  geographicalArea: "reloue",
  unitGroupsApplicationForm: [],
  visits: [],
  documents: [],
  agency: "5e5dafe018bb1b1dce020cb6",
};

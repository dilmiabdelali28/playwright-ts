import branches from "$fixtures/datasets/branches.json";

import { BaseObject } from "../baseObject";
import type { Agency } from "./agency";

export class Branch extends BaseObject {
  static barbatre = () => new Branch(branches.barbatre);

  static vaillant = () => new Branch(branches.vaillant);

  static ac2 = () => new Branch(branches.ac2);

  static aBranch = () => new Branch(defaultPayload).withNewId();

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });
}

const defaultPayload = {
  _id: "5e5dafde0de8b924a9fe1338",
  totalImmoId: "2771",
  __v: 0,
  activity: {
    startDate: { $date: { $numberLong: "1493589600000" } },
    status: "OPEN",
  },
  address: {
    completeAddress: "54 Rue du Centre 85630 Barbâtre France",
    address1: "54 Rue du Centre",
    zipCode: "85630",
    city: "Barbâtre",
    country: "France",
    countryCode: "FRA",
  },
  agency: "5e5dafe0b84f4c4645020c81",
  anaelCode: "00167014",
  commercialName: "Foncia Vendée - Barbâtre",
  companyName: "Foncia Vendée - Barbâtre",
  companyNameAnalytic: "BARBÂTRE 54 Rue du Centre - FONCIA VENDEE",
  contact: { telephone: "+33251395021" },
  createdAt: "2021-12-16T09:10:34.538Z",
  hours: [],
  lineOfBusinesses: ["GL", "LOCATION", "SEASONAL_RENTAL", "COOWNERSHIP"],
  listTotalImmoId: ["2771"],
  mainBranch: false,
  siren: "452396575",
  siret: "45239657500212",
  updatedAt: "2023-07-08T07:02:44.339Z",
  legacyGrouCodes: ["33S"],
};

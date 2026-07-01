import associates from "../../datasets/associates.json";
import { BaseObject } from "../baseObject";
import type { Agency } from "./agency";

export class Associate extends BaseObject {
  static anAssociate = () => new Associate(defaultPayload).withNewId();

  static karine = () => new Associate(associates.karine);

  static guilhem = () => new Associate(associates.guilhem);

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });
}

const defaultPayload = {
  _id: "60e1551a87612a001a1fdc30",
  active: true,
  maintainer: false,
  version: 17,
  externalId: "00u2zm5f2b9OCwj2Z0i7",
  FR: "fr105584",
  firstname: "Karine",
  lastname: "HIPPOCRATE",
  email: "karine.hippocrate@foncia.com",
  jobTitle: "PROPERTY_MANAGEMENT_MANAGER",
  cabinet: "0790",
  agency: "AGE_10102",
  matriculeRh: "00210710",
  idSociete: "00167",
  idEtablissement: "00167009",
  groups: [
    {
      value: "60e14fac8778c60019117264",
      display: "OKTA_FR_ML_plato-adb-dev1",
    },
  ],
  createdAt: "2021-07-04T06:28:42.295Z",
  updatedAt: "2023-04-28T07:41:30.235Z",
  __v: 0,
  secondaryAssignments: [{ jobCode: "5", anaelCode: "00167009" }],
};

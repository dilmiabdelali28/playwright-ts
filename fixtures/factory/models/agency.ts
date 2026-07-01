import agencies from "../../datasets/myFoncia/agencies.json";
import { BaseObject } from "../baseObject";

export class Agency extends BaseObject {
  static ileDeFrance = () => new Agency(agencies.ileDeFrance);

  static vendee = () => new Agency(agencies.vendee);

  static newAgency = (_id: string) => {
    const agencyFound = Object.values(agencies).find(
      (agency) => agency._id === _id,
    );

    return new Agency(agencyFound);
  };
}

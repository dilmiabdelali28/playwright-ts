import { BaseObject } from "../../baseObject";
import type { Agency } from "../agency";
import type { Associate } from "../associate";
import type { Building } from "../building";

type StatusType = "OPEN" | "CLOSED" | "FINISHED";

export class MissionBase extends BaseObject {
  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });

  withBuilding = (building: Building) =>
    this.with({ "housing.target": building.payload._id });

  withStatus = (status: StatusType) => this.with({ status });

  withLabel = (label: string) => this.with({ label });

  withAssociate = (associate: Associate) =>
    this.with({
      associate: associate.payload._id,
      createdBy: associate.payload._id,
    });
}

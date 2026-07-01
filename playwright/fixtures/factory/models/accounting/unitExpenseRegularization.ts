import { BaseObject } from "$fixtures/factory/baseObject";

import type { Building } from "../building";
import type { Unit } from "../unit";
import type { ExpenseRegularization } from "./expenseRegularization";

export class UnitExpenseRegularization extends BaseObject {
  static anUnitExpenseRegularization = () =>
    new UnitExpenseRegularization(defaultPayload).withNewId();

  withExpenseRegularization = (expenseRegularization: ExpenseRegularization) =>
    this.with({ expenseRegularizationId: expenseRegularization.payload._id });

  withBuilding = (building: Building) =>
    this.with({ buildingId: building.payload._id });

  withUnit = (unit: Unit) => this.with({ unitId: unit.payload._id });
}

const defaultPayload = {
  _id: "65843b3c261466c9ada542e7",
  unitId: "65843b353142c0fd3e8dcd5d",
  buildingId: "65843b353142c0fd3e8dcd5c",
  expenseRegularizationId: "65843b3c261466c9ada542e5",
  expenses: [],
};

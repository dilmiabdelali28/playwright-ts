import type { Agency } from "$fixtures/factory/models/agency";
import type { Associate } from "$fixtures/factory/models/associate";
import type { Customer } from "$fixtures/factory/models/customer";
import type { Unit } from "$fixtures/factory/models/unit";
import type { UnitsGroup } from "$fixtures/factory/models/unitsGroup";

import { MissionBase } from "./missionBase";

export class MissionMarketing extends MissionBase {
  static aMissionMarketing = () =>
    new MissionMarketing(defaultPayload)
      .withNewId()
      .withCurrentCreatedAtAndUpdatedAtDates()
      .with({
        startedAt: new Date(),
      });

  withAgency = (agency: Agency) => this.with({ agency: agency.payload._id });

  withStatus = (status: string) => this.with({ status });

  withLabel = (label: string) => this.with({ label });

  withStepsHistory = () =>
    this.with({
      stepsHistory: [
        {
          createdAt: new Date(),
          step: "TO_PUBLISH",
        },
      ],
    });

  withAssociate = (associate: Associate) =>
    this.with({
      associate: associate.payload._id,
      createdBy: associate.payload._id,
      tasks: defaultPayload.tasks.map((task) => ({
        ...task,
        persona: associate.payload._id,
      })),
    });

  withUnitsGroup = (unitGroup: UnitsGroup) =>
    this.with({
      unitsGroup: unitGroup.payload._id,
    });

  withCustomer = (customer: Customer) =>
    this.with({ customer: customer.payload._id });

  withHousing = (unit: Unit) =>
    this.with({
      housing: {
        kind: "Unit",
        target: unit.payload._id,
      },
    });
}

const defaultPayload =
  // collection: missions
  {
    step: "TO_PUBLISH",
    previsit: {
      participants: {
        tenants: [],
        buildingManagers: [],
      },
      isConfirmed: false,
      documents: [],
    },
    stepsHistory: [
      {
        createdAt: null,
        step: "TO_PUBLISH",
      },
    ],
    rentalBranches: [],
    status: "OPEN",
    label: "E2E Mission Comm",
    customer: null,

    housing: {
      kind: "Unit",
      target: null,
    },
    associatedTo: [],
    notes: [],
    tasks: [
      {
        kind: "MISSION_MARKETING_CHECK_INSPECTION_REPORT",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Vérifier les diagnostics",
      },
      {
        kind: "MISSION_MARKETING_VALIDATE_AD_CONTENT",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Valider le contenu de l’annonce",
      },
      {
        kind: "MISSION_MARKETING_PUBLISHED_AD_ONLINE",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Mettre en ligne l’annonce",
      },
      {
        kind: "MISSION_MARKETING_SCHEDULE_PRE_VISIT",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Programmer la pré-visite",
      },
      {
        kind: "MISSION_MARKETING_PERFORM_PRE_VISIT",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Effectuer la pré-visite",
      },
      {
        kind: "MISSION_MARKETING_START_SALES_ACTIVITIES",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Engager les actions commerciales",
      },
      {
        kind: "MISSION_MARKETING_PERFORM_PROSPECTIVE_BUYER_VISIT",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Effectuer une visite candidat",
      },
      {
        kind: "MISSION_MARKETING_PERFORM_SOLVENCY_SURVEY",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Conduire l’enquête de solvabilité",
      },
      {
        kind: "MISSION_MARKETING_VALIDATE_PROSPECTIVE_CANDIDATE",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Valider une candidature",
      },
      {
        kind: "MISSION_MARKETING_ENTER_LEASE_AND_APPENDIX",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Saisir le bail et les annexes",
      },
      {
        kind: "MISSION_MARKETING_SIGN_LEASE_AND_APPENDIX",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Signer le bail et les annexes",
      },
      {
        kind: "MISSION_MARKETING_PREPARE_MOVEIN_INSPECTION",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Programmer l'état des lieux d'entrée",
      },
      {
        kind: "MISSION_MARKETING_RECEIVE_MOVEIN_INSPECTION_REPORT",
        persona: null,
        personaType: "Associate",
        status: "TODO",
        title: "Réceptionner l'état des lieux d'entrée",
      },
    ],
    reports: [],
    kind: "MissionMarketing",
    documents: [],
    __v: 0,
  };

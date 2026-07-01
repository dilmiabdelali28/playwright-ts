export const buildingPayloadForAG = (buildingName: string, address: any) => ({
  kind: "BuildingComplet",
  buildingName,
  numberOfElevators: 0,
  physicalBuildings: [
    {
      identity: {
        physicalBuildingName: "Bâtiment A",
      },
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
            _id: "<TO FILL>",
          },
        ],
      },
    },
  ],
  caretakerLodge: {
    timetables: [],
  },
  address,
  coOwnershipDetails: {
    coOwnershipTrusteeStatus: true,
    compta: {
      cashflowThreshold: {
        value: 0,
        currency: "EUR",
      },
      trusteeCouncilThreshold: {
        value: 0,
        currency: "EUR",
      },
      accountingPeriod: {
        duration: 12,
      },
    },
    coOwnershipMandate: "<TO FILL>",
    accountantMainBankAccount: "<TO FILL>",
  },
  status: "ACTIVE",
  isDraft: true,
  employees: [],
  managementType: "FONCIA_TRUSTEE",
  tags: [],
  coOwnershipRegulation: {
    coOwnershipRegulationHistories: [],
  },
  version: 3,
  documents: [],
  equipments: [],
  otherManagementGroups: [],
  createdAt: "2023-12-14T13:23:33.960+0000",
  updatedAt: "2023-12-14T13:29:26.545+0000",
  __v: 0,
});

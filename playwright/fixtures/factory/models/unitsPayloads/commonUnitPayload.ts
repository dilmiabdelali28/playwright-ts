import ObjectID from "bson-objectid";
import moment from "moment";

export const diagnosticsPayload = [
  {
    _id: new ObjectID().toHexString(),
    metadata: [
      {
        type: "NOT_SUBJECT_TO_DPE",
        value: false,
      },
      {
        type: "POWER_CONSUMPTION_KW",
        value: "1",
      },
      {
        type: "GREENHOUSE_GAS_KW",
        value: "1",
      },
      {
        type: "MIN_ESTIMATED_ANNUAL_ENERGY_AMOUNT",
        value: "1",
      },
      {
        type: "MAX_ESTIMATED_ANNUAL_ENERGY_AMOUNT",
        value: "1",
      },
      {
        type: "ENERGY_PRICE_BASE_YEAR",
        value: "1971",
      },
      {
        type: "EXPIRATION_DATE",
        value: moment().add(5, "years").toDate(),
      },
      {
        type: "SPECIAL_ALTITUDE_ZONE",
        value: true,
      },
      {
        type: "REFERENCE_SURFACE",
        value: "50",
      },
      {
        type: "GREENHOUSE_GAS_TAG",
        value: "A",
      },
      {
        type: "POWER_CONSUMPTION_TAG",
        value: "B",
      },
    ],
    realizationDate: moment().subtract(5, "years").toDate(),
    type: "HOME_ENERGY_SCORE",
  },
];

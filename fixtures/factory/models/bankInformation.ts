import { BaseObject } from "../baseObject";

export class BankInformation extends BaseObject {
  static atBanqueDeFrance = () => this.createWithBankName("BANQUE DE FRANCE");

  static atBnp = () => this.createWithBankName("BNP PARIBAS");

  private static createWithBankName = (bankName: string) =>
    new BankInformation(defaultPayload).withNewId().with({
      bankName,
      domiciliation: bankName,
      name: bankName,
    });
}

const defaultPayload = {
  isActive: true,
  accountType: "SEPARATE",
  accountNature: "COMPTE_COURANT",
  bankName: "<TO FILL bankName>",
  kind: "FONCIA",
  kyribaCompliant: true,
  sendIncomingChecksToAgency: false,
  ics: "FR24ZZZ477885",
  iban: "FR7600000000000000000000000",
  bic: "FONCFRXX",
  name: "<TO FILL bankName>",
  address: {
    completeAddress:
      "Rue du capitaine Hazebrouck, Res Le Bocquiau APPT 335 Bat D1 59320 HAUBOURDIN",
    address1: "Rue du capitaine Hazebrouck, Res Le Bocquiau",
    address2: "APPT 335 Bat D1",
    zipCode: "59320",
    city: "HAUBOURDIN",
    country: "France",
    countryCode: "FRA",
  },
  accountNumber: "00081589201",
  domiciliation: "<TO FILL bankName>",
  bankCode: "30027",
  mandate: {
    mandateReferenceNumber: "FR1234567890",
    isActive: true,
  },
};

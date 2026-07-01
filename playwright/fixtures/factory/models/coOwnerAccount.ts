import _ from "lodash";

import { BaseObject } from "../baseObject";
import type { BankInformation } from "./bankInformation";
import type { Customer } from "./customer";
import type { Unit } from "./unit";

export class CoOwnerAccount extends BaseObject {
  static anAccount = () => {
    const accountNumberCoownership = _.padStart(
      _.random(9999999).toString(),
      9,
      "1",
    );

    return new CoOwnerAccount(defaultPayload).withNewId().with({
      coOwnerAccountNumber: accountNumberCoownership,
      coOwnerAccountLegacyNumber: `${accountNumberCoownership}-leg`,
    });
  };

  withFullOwnershipHolder(customer: Customer) {
    return this.with({
      holder: [
        {
          customer: customer.payload._id,
          propertyType: "FULL_OWNERSHIP",
          isMain: true,
        },
      ],
      "addresses.0.customer": customer.payload._id,
      "generalAssembly.votingFullname": customer.payload.fullname,
      fullname: customer.payload.fullname,
    });
  }

  addUnit(
    unit: Unit,
    {
      purchaseDate = new Date(2005, 3, 3),
      benefitStartDate = new Date(2005, 3, 3),
    }: { purchaseDate?: Date; benefitStartDate?: Date } = {},
  ) {
    this.payload.units.push({
      _id: unit.payload._id,
      unit: unit.payload._id,
      purchaseDate,
      benefitStartDate,
    });

    return this;
  }

  withBankInformation(bankInformation: BankInformation) {
    return this.with({ bankInformation: bankInformation.payload._id });
  }

  withOnDemandBankInformation(bankInformation: BankInformation) {
    return this.with({
      onDemandBankInformation: bankInformation.payload._id,
    });
  }

  withCustomer(customer: Customer) {
    return this.with({
      "generalAssembly.votingFullname": customer.payload.fullname,
      fullname: customer.payload.fullname,
    });
  }
}

const defaultPayload = {
  publishingDesktop: {
    advertisement: true,
    excludeMailRouting: false,
  },
  generalAssembly: {
    voter: true,
    votingFullname: "nomComplet",
  },
  sale: {
    sellerUpfrontFeeRefund: "TRUSTEE",
    inProcess: false,
  },
  directDebitDay: 5,
  daysPaymentDelay: 0,
  directDebitInvoicing: false,
  isAccountOffset: false,
  monthlyWithdrawal: false,
  usualPaymentChoice: "SEPA_AUTOMATIC_DEBIT_REQUEST",
  trusteeCouncil: {
    quality: "MEMBER",
  },
  building: "<TO FILL building id>",
  recovery: {
    customerTypeCode: "NORMAL",
  },
  fullname: "nomComplet",
  title: "MR_AND_MRS",
  accountType: "COOWNERSHIP_STANDARD",
  documents: [],
  units: [],
  holder: [
    {
      customer: "<TO FILL customer id>",
      propertyType: "FULL_OWNERSHIP",
      isMain: true,
    },
  ],
  addresses: [
    {
      eReco: {
        subscribe: true,
        hasHistory: false,
      },
      documentTypes: ["ALL_MAIL"],
      customer: "<TO FILL customer id>",
      contactType: "ADDRESSE",
      contactPreferences: {
        accounting: {
          email: false,
          postalMail: true,
        },
        mail: {
          email: false,
          postalMail: true,
        },
        general_assembly: {
          email: false,
          postalMail: true,
        },
      },
    },
  ],
  history: [],
  virtualIban: {
    iban: "FR7616658000010000165917113",
    status: "AFFECTED",
    updatedAt: "2023-04-15T06:05:44.687Z",
  },
  bankInformation: "<TO FILL bankInformation id>",
  onDemandBankInformation: "<TO FILL bankInformation id>",
};

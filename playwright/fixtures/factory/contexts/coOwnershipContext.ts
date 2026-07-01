import { AccountingAccount } from "../models/accounting/accountingAccount";
import type { AccountingLine } from "../models/accounting/accountingLine";
import { Agency } from "../models/agency";
import { BankInformation } from "../models/bankInformation";
import { Building } from "../models/building";
import { CoOwnerAccount as CoownerAccount } from "../models/coOwnerAccount";
import { Customer } from "../models/customer";
import type { Feature } from "../models/feature";
import type { MediaPayment } from "../models/mediaPayment";
import { Unit } from "../models/unit";
import { toPayload } from "./toPayload";

export const coOwnershipContext = ({
  features = [],
  accountingLines = [],
  mediaPayments = [],
}: {
  features?: Feature[];
  accountingLines?: AccountingLine[];
  mediaPayments?: MediaPayment[];
}) => {
  const agency = Agency.ileDeFrance();
  const customer = Customer.bob();
  const building = Building.leParnassien();
  const appartement = Unit.anAppartment().ofBuilding(building);
  const bdpBankInformation = BankInformation.atBanqueDeFrance();
  const bnpBankInformation = BankInformation.atBnp();
  const coOwnerAccount = CoownerAccount.anAccount()
    .withBuilding(building)
    .withFullOwnershipHolder(customer)
    .withBankInformation(bdpBankInformation)
    .withOnDemandBankInformation(bnpBankInformation)
    .addUnit(appartement);
  const accountingAccount = AccountingAccount.anAccount()
    .ofCoOwnerAccount(coOwnerAccount)
    .withAgency(agency);

  return toPayload({
    features,
    customers: [customer],
    units: [appartement],
    coOwnerAccounts: [coOwnerAccount],
    bankInformations: [bdpBankInformation, bnpBankInformation],
    accountingAccounts: [accountingAccount],
    accountingLines: accountingLines.map((accountingLine) =>
      accountingLine.inAccount(accountingAccount),
    ),
    mediaPayments: mediaPayments.map((mediaPayment) =>
      mediaPayment
        .withAgency(agency)
        .withBeneficiaryCoownerAccount(coOwnerAccount)
        .withCreditorBankInformation(bdpBankInformation),
    ),
  });
};

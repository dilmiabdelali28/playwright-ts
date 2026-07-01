import { faker } from "@faker-js/faker";
import moment from "moment";

import { EUR } from "../amount";
import { ExpenseType } from "../models/accounting/expensType";
import {
  Invoice,
  InvoiceMetadata,
  type InvoiceOrigin,
} from "../models/accounting/invoice";
import { Agency } from "../models/agency";
import { AllocationKey } from "../models/allocationKey";
import { Building } from "../models/building";
import { Contract, PaymentMean } from "../models/contract";
import { Supplier } from "../models/supplier";
import { Unit } from "../models/unit";
import { toPayload } from "./toPayload";

interface InvoiceOptions {
  building?: Building;
  unit?: Unit;
  origin?: InvoiceOrigin;
  paymentMeans?: PaymentMean;
  agency?: Agency;
  amountTTC?: string;
  amountHT?: string;
}

export const invoiceContext = ({
  unit,
  origin,
  paymentMeans,
  agency,
  building,
  amountTTC,
  amountHT,
}: InvoiceOptions) => {
  const resolvedBuilding = building ?? Building.aBuilding();
  const resolvedUnit = unit ?? Unit.anAppartment();
  const resolvedOrigin = origin ?? "MANUAL";
  const resolvedAgency = agency ?? Agency.ileDeFrance();
  const resolvedPaymentMean = paymentMeans ?? PaymentMean.TRANSFER;
  const resolvedAmountTTC = Number.parseFloat(amountTTC ?? "1200");
  const resolvedAmountHT = Number.parseFloat(amountHT ?? "1000");
  const randomInvoiceId = faker.string.alphanumeric(10).toUpperCase();
  const randomContractId = faker.string.alphanumeric(10).toUpperCase();

  const invoice = Invoice.anInvoice()
    .withInvoiceNumber(randomInvoiceId)
    .withReferenceNumber(faker.finance.routingNumber())
    .withAmountTTC(EUR(resolvedAmountTTC))
    .withAmountHT(EUR(resolvedAmountHT))
    .withOrigin(resolvedOrigin)
    .withAgency(resolvedAgency);
  const invoiceMetadata =
    InvoiceMetadata.anInvoiceMetadata().withInvoice(invoice);

  const tenorInvoiceMetadata = InvoiceMetadata.anInvoiceMetadata()
    .withInvoice(invoice)
    .withTenorMetadata(104);

  const allocationKey = AllocationKey.anAllocationKey()
    .withBuilding(resolvedBuilding)
    .withNumber("001")
    .withShareBase(1500)
    .withGenericTitle("Charges générales")
    .addUnit(resolvedUnit, { fractionalShares: 1500 });

  const expenseType = ExpenseType.buildingAccessContract();

  const today = moment().startOf("day");

  const contract = Contract.aContract()
    .withSupplier(Supplier.assurimo())
    .withPaymentMean(resolvedPaymentMean)
    .withAmount(EUR(100))
    .withAgency(Agency.ileDeFrance())
    .withStartingDate(today.toDate())
    .withEndingDate(today.add(1, "year").toDate())
    .withFonciaContractNumber(randomContractId)
    .withBuilding(resolvedBuilding)
    .addCodification({ allocationKey, expenseType, rate: 1 });

  return toPayload({
    invoices: [invoice],
    invoiceMetadatas: [invoiceMetadata, tenorInvoiceMetadata],
    allocationKeys: [allocationKey],
    contracts: [contract],
  });
};

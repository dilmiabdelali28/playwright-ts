import { createBuildingForInvoiceOptionsContext } from "$fixtures/factory/contexts/createBuildingForInvoiceOptionsContext";
import { invoiceContext } from "$fixtures/factory/contexts/invoiceContext";
import type { InvoiceOrigin } from "$fixtures/factory/models/accounting/invoice";
import { Agency } from "$fixtures/factory/models/agency";
import { Building } from "$fixtures/factory/models/building";
import type { PaymentMean } from "$fixtures/factory/models/contract";
import { Unit } from "$fixtures/factory/models/unit";

import type { BoApiContext } from "../bo-api-context";
import { BoFixtureApiClient } from "./fixture-api.client";

type FixtureContext = {
  buildings?: Array<{ _id?: string }>;
  units?: Array<{ _id?: string }>;
  invoices?: Array<{ _id?: string; invoiceNumber?: string }>;
  contracts?: Array<{ contractNumber?: string }>;
};

type InvoiceSetupParams = {
  origin: InvoiceOrigin;
  paymentMeans: PaymentMean;
  amountTTC: string;
  amountHT: string;
  agency?: "ileDeFrance";
  labelPrefix?: string;
};

type InvoiceSetupResult = {
  invoiceId: string;
  invoiceNumber: string;
  contractNumber: string;
};

export const TENOR_INVOICE_SETUP: InvoiceSetupParams = {
  origin: "TENOR",
  paymentMeans: "TRANSFER",
  agency: "ileDeFrance",
  amountTTC: "100",
  amountHT: "90",
  labelPrefix: "PW-TENOR",
};

export async function setupInvoiceWithContract(
  ctx: BoApiContext,
  params: InvoiceSetupParams,
): Promise<InvoiceSetupResult> {
  const fixture = new BoFixtureApiClient(ctx);
  const prefix = params.labelPrefix ?? "PW-INVOICE";

  const baseContext = await fixture.createFixture<FixtureContext>(
    createBuildingForInvoiceOptionsContext(`${prefix}-${Date.now()}`),
  );
  const buildingData = baseContext?.buildings?.[0];
  const unitData = baseContext?.units?.[0];
  if (!buildingData || !unitData) {
    throw new Error("setupInvoiceWithContract: building context failed");
  }

  const invoiceContextResult = await fixture.createFixture<FixtureContext>(
    invoiceContext({
      building: new Building(buildingData),
      unit: new Unit(unitData),
      origin: params.origin,
      paymentMeans: params.paymentMeans,
      ...(params.agency === "ileDeFrance"
        ? { agency: Agency.ileDeFrance() }
        : {}),
      amountTTC: params.amountTTC,
      amountHT: params.amountHT,
    }),
  );

  const invoice = invoiceContextResult?.invoices?.[0];
  const contract = invoiceContextResult?.contracts?.[0];
  if (!invoice?._id || !invoice.invoiceNumber || !contract?.contractNumber) {
    throw new Error("setupInvoiceWithContract: invoice context failed");
  }

  return {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    contractNumber: contract.contractNumber,
  };
}

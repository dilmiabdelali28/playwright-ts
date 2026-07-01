import type { MissionMarketing } from "$fixtures/factory/models/missions/missionMarketing";
import type { RentDetailsCall } from "$fixtures/factory/models/rentDetailsCall";

import type { AccountingAccount } from "../models/accounting/accountingAccount";
import type { AccountingLine } from "../models/accounting/accountingLine";
import type { AccountingPeriod } from "../models/accounting/accountingPeriod";
import type { Budget } from "../models/accounting/budget";
import type { ExpenseRegularization } from "../models/accounting/expenseRegularization";
import type { Invoice, InvoiceMetadata } from "../models/accounting/invoice";
import type { UnitExpenseRegularization } from "../models/accounting/unitExpenseRegularization";
import type { AllocationKey } from "../models/allocationKey";
import type { BankInformation } from "../models/bankInformation";
import type { Building } from "../models/building";
import type { Contract } from "../models/contract";
import type { CoOwnerAccount as CoownerAccount } from "../models/coOwnerAccount";
import type { Customer } from "../models/customer";
import type { Feature } from "../models/feature";
import type { File } from "../models/file";
import type { Lease } from "../models/lease";
import type { RegularizationPeriod } from "../models/lease-accounting/regularizationPeriod";
import type { LessorAccount } from "../models/lessorAccount";
import type { CoOwnershipMandate } from "../models/mandates/coOwnershipMandate";
import type { RentalManagementMandate } from "../models/mandates/rentalManagementMandate";
import type { MediaPayment } from "../models/mediaPayment";
import type { MissionCurrentExpensesRecovery } from "../models/missions/missionCurrentExpensesRecovery";
import type { MissionLeaseBack } from "../models/missions/missionLeaseBack";
import type { MissionNewMandate } from "../models/missions/missionNewMandate";
import type { MissionTenantLeave } from "../models/missions/missionTenantLeave";
import type { MissionTrusteeContract } from "../models/missions/missionTrusteeContract";
import type { Pricing } from "../models/pricing";
import type { Measurement } from "../models/real-estate/measurement";
import type { Meter } from "../models/real-estate/meter";
import type { Reading } from "../models/real-estate/reading";
import type { ApplicationForm as RentalManagementApplicationForm } from "../models/rentalManagement/applicationForm";
import type { Unit } from "../models/unit";
import type { UnitsGroup } from "../models/unitsGroup";

export const toPayload = (objects: {
  features?: Feature[];
  customers?: Customer[];
  units?: Unit[];
  coOwnerAccounts?: CoownerAccount[];
  bankInformations?: BankInformation[];
  accountingAccounts?: AccountingAccount[];
  accountingLines?: AccountingLine[];
  mediaPayments?: MediaPayment[];
  lessorAccounts?: LessorAccount[];
  unitsGroups?: UnitsGroup[];
  leases?: Lease[];
  files?: File[];
  rentalManagementMandates?: RentalManagementMandate[];
  rentalManagementApplicationForms?: RentalManagementApplicationForm[];
  missionMarketings?: MissionMarketing[];
  missionNewMandates?: MissionNewMandate[];
  missionLeaseBacks?: MissionLeaseBack[];
  missionTenantLeaves?: MissionTenantLeave[];
  coOwnershipMandates?: CoOwnershipMandate[];
  budgets?: Budget[];
  buildings?: Building[];
  accountingPeriods?: AccountingPeriod[];
  allocationKeys?: AllocationKey[];
  missionCurrentExpensesRecoveries?: MissionCurrentExpensesRecovery[];
  meters?: Meter[];
  readings?: Reading[];
  measurements?: Measurement[];
  regularizationPeriods?: RegularizationPeriod[];
  rentDetailsCalls?: RentDetailsCall[];
  expenseRegularizations?: ExpenseRegularization[];
  unitExpenseRegularizations?: UnitExpenseRegularization[];
  invoices?: Invoice[];
  invoiceMetadatas?: InvoiceMetadata[];
  contracts?: Contract[];
  pricings?: Pricing[];
  missionTrusteeContracts?: MissionTrusteeContract[];
}): Record<string, unknown> =>
  (Object.keys(objects) as Array<keyof typeof objects>).reduce<
    Record<string, unknown>
  >((res, key) => {
    res[key] = objects[key]?.map((obj) => obj.payload);

    return res;
  }, {});

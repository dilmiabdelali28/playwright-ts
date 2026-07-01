import moment from "moment-timezone";

const PARIS_TIME_ZONE = "Europe/Paris";
const PARIS_CALENDAR_DATE_FORMAT = "DD/MM/YYYY";

/** dd-MM-yyyy for date form fields. */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

/** DD/MM/yyyy in Europe/Paris — matches Plato resolution labels (moment.tz default). */
function formatParisCalendarDate(date: Date | string): string {
  return moment.tz(date, PARIS_TIME_ZONE).format(PARIS_CALENDAR_DATE_FORMAT);
}

/** `DU dd/MM/yyyy AU dd/MM/yyyy` for AG accounting period resolution labels. */
export function formatParisAccountingPeriodRange(exercise: {
  openingDate: string | Date;
  closingDate: string | Date;
}): string {
  return `DU ${formatParisCalendarDate(exercise.openingDate)} AU ${formatParisCalendarDate(exercise.closingDate)}`;
}

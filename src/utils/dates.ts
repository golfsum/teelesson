/**
 * Small ISO-date ("YYYY-MM-DD") helpers shared by the schedule views and the
 * recurring-lesson generator. All operate on local dates (no timezone shifts).
 */

export const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function parseISO(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function addMonths(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setMonth(d.getMonth() + n);
  return toISO(d);
}

export function addYears(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setFullYear(d.getFullYear() + n);
  return toISO(d);
}

/** Sunday-based start of the week containing `iso`. */
export function startOfWeek(iso: string): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() - d.getDay());
  return toISO(d);
}

export function startOfMonth(iso: string): string {
  const d = parseISO(iso);
  return toISO(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function endOfMonth(iso: string): string {
  const d = parseISO(iso);
  return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function yearOf(iso: string): number {
  return parseISO(iso).getFullYear();
}

export function monthYearLabel(iso: string): string {
  const d = parseISO(iso);
  return `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

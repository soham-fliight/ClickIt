import { DEMO_TODAY } from "./types";

export function parseDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const date = parseDate(iso);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function startOfWeek(iso: string): string {
  const date = parseDate(iso);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  return formatISODate(date);
}

export function weekdayLabel(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-AU", { weekday: "short" });
}

export function weekdayLong(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-AU", { weekday: "long" });
}

export function dayMonth(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

export function prettyDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function weekDays(anchor = DEMO_TODAY): string[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin <= startMin) endMin += 24 * 60;
  return endMin - startMin;
}

export function paidHours(start: string, end: string, breakMinutes: number): number {
  return Math.max(0, (minutesBetween(start, end) - breakMinutes) / 60);
}

export function timeLabel(start: string, end: string): string {
  return `${to12(start)} – ${to12(end)}`;
}

export function to12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

export function overlaps(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  return toMin(aStart) < toMin(bEnd) && toMin(bStart) < toMin(aEnd);
}

export function isToday(iso: string): boolean {
  return iso === DEMO_TODAY;
}

export function relativeDay(iso: string): string {
  if (iso === DEMO_TODAY) return "Today";
  if (iso === addDays(DEMO_TODAY, 1)) return "Tomorrow";
  if (iso === addDays(DEMO_TODAY, -1)) return "Yesterday";
  return prettyDate(iso);
}

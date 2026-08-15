import { minutesBetween, paidHours } from "./dates";
import type { Shift } from "./types";

export type AwardBand = "ordinary" | "evening" | "saturday" | "sunday" | "public";

export interface AwardSplit {
  band: AwardBand;
  hours: number;
  multiplier: number;
}

const MULTIPLIER: Record<AwardBand, number> = {
  ordinary: 1,
  evening: 1.25,
  saturday: 1.25,
  sunday: 1.5,
  public: 2.25,
};

export function weekdayIndex(iso: string): number {
  return new Date(`${iso}T00:00:00`).getDay();
}

export function classifyShift(shift: Shift): AwardSplit[] {
  const weekday = weekdayIndex(shift.date);
  const total = paidHours(shift.start, shift.end, shift.breakMinutes);
  if (weekday === 0) return [{ band: "sunday", hours: total, multiplier: MULTIPLIER.sunday }];
  if (weekday === 6) return [{ band: "saturday", hours: total, multiplier: MULTIPLIER.saturday }];

  const [sh] = shift.start.split(":").map(Number);
  const [eh] = shift.end.split(":").map(Number);
  const crossesEvening = sh >= 18 || eh > 18 || (eh < sh && sh < 24);
  if (crossesEvening && eh > 18) {
    const eveningHours = Math.min(total, Math.max(0, minutesBetween("18:00", shift.end) / 60));
    const ordinary = Math.max(0, total - eveningHours);
    const splits: AwardSplit[] = [];
    if (ordinary > 0) splits.push({ band: "ordinary", hours: ordinary, multiplier: 1 });
    if (eveningHours > 0) {
      splits.push({ band: "evening", hours: eveningHours, multiplier: MULTIPLIER.evening });
    }
    return splits;
  }
  return [{ band: "ordinary", hours: total, multiplier: 1 }];
}

export function awardLabel(band: AwardBand): string {
  switch (band) {
    case "ordinary":
      return "Ordinary";
    case "evening":
      return "Evening +25%";
    case "saturday":
      return "Saturday +25%";
    case "sunday":
      return "Sunday +50%";
    case "public":
      return "Public holiday";
  }
}

export function costUnits(shift: Shift): number {
  return classifyShift(shift).reduce((sum, split) => sum + split.hours * split.multiplier, 0);
}

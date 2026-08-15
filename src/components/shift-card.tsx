import { Clock3, MapPin } from "lucide-react";
import { awardLabel, classifyShift } from "@/lib/award";
import { paidHours, prettyDate, timeLabel } from "@/lib/dates";
import { DEPARTMENT_META, personName } from "@/lib/store";
import type { Person, Shift, Store } from "@/lib/types";
import { Avatar, Button, Card, DeptPill, StatusPill } from "./ui";

export function ShiftCard({
  shift,
  person,
  store,
  actions,
  showAward = true,
}: {
  shift: Shift;
  person?: Person | null;
  store?: Store;
  actions?: React.ReactNode;
  showAward?: boolean;
}) {
  const hours = paidHours(shift.start, shift.end, shift.breakMinutes);
  const award = classifyShift(shift);
  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: DEPARTMENT_META[shift.departmentId].tint }}
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{shift.roleLabel}</p>
            <DeptPill id={shift.departmentId} />
            {!shift.published ? <StatusPill tone="draft">Draft</StatusPill> : null}
            {shift.status === "in_progress" ? <StatusPill tone="good">On floor</StatusPill> : null}
            {shift.personId === null ? <StatusPill tone="warn">Open</StatusPill> : null}
          </div>
          <p className="mt-1 text-sm text-ink-soft">{prettyDate(shift.date)}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-leaf" />
              {timeLabel(shift.start, shift.end)}
              <span className="text-ink-soft">· {hours.toFixed(hours % 1 ? 1 : 0)}h</span>
            </span>
            {store ? (
              <span className="inline-flex items-center gap-1.5 text-ink-soft">
                <MapPin className="h-4 w-4" />
                {store.suburb}
              </span>
            ) : null}
          </div>
          {shift.notes ? <p className="mt-2 text-sm text-ink-soft">{shift.notes}</p> : null}
          {showAward ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {award.map((split) => (
                <StatusPill key={split.band} tone={split.band === "ordinary" ? "neutral" : "good"}>
                  {awardLabel(split.band)} · {split.hours.toFixed(1)}h
                </StatusPill>
              ))}
            </div>
          ) : null}
        </div>
        {person ? (
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{personName(person)}</p>
              <p className="text-xs text-ink-soft">{person.awardLevel}</p>
            </div>
            <Avatar person={person} />
          </div>
        ) : null}
      </div>
      {actions ? <div className="mt-4 flex flex-wrap gap-2 pl-2">{actions}</div> : null}
    </Card>
  );
}

export function OfferActions({
  onClaim,
  disabled,
  label = "Claim this shift",
}: {
  onClaim: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Button onClick={onClaim} disabled={disabled}>
      {label}
    </Button>
  );
}

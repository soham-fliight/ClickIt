"use client";

import { DEMO_TODAY } from "@/lib/types";
import { addDays, paidHours, startOfWeek, timeLabel, weekDays, weekdayLabel } from "@/lib/dates";
import { useAppStore } from "@/lib/store";
import { ShiftCard } from "@/components/shift-card";
import { Card, Empty, PageHeader } from "@/components/ui";

export default function SchedulePage() {
  const { me, state } = useAppStore();
  const days = weekDays(DEMO_TODAY);
  const next = weekDays(addDays(startOfWeek(DEMO_TODAY), 7));
  const mine = state.shifts.filter((shift) => shift.personId === me.id && shift.status !== "cancelled");

  return (
    <div>
      <PageHeader
        eyebrow="My roster"
        title="What you’re actually working"
        description="Published shifts only. Drafts stay with the manager — unlike UKG, you won’t see a ghost week."
      />

      <div className="grid gap-2 sm:grid-cols-7">
        {days.map((day) => {
          const shifts = mine.filter((shift) => shift.date === day && shift.published);
          const hours = shifts.reduce(
            (sum, shift) => sum + paidHours(shift.start, shift.end, shift.breakMinutes),
            0,
          );
          const isToday = day === DEMO_TODAY;
          return (
            <Card
              key={day}
              className={isToday ? "border-leaf bg-leaf-mist/40" : undefined}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                {weekdayLabel(day)}
              </p>
              <p className="display text-2xl">{day.slice(8)}</p>
              <p className="mt-2 text-xs text-ink-soft">{hours ? `${hours}h` : "Off"}</p>
              <div className="mt-3 space-y-2">
                {shifts.map((shift) => (
                  <div key={shift.id} className="rounded-xl bg-white px-2 py-1.5 text-xs font-semibold">
                    {timeLabel(shift.start, shift.end)}
                    <div className="font-normal text-ink-soft">{shift.roleLabel}</div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <h2 className="display mt-10 text-2xl">Next week</h2>
      <div className="mt-3 space-y-3">
        {mine
          .filter((shift) => next.includes(shift.date))
          .map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              store={state.stores.find((item) => item.id === shift.storeId)}
            />
          ))}
        {mine.filter((shift) => next.includes(shift.date)).length === 0 ? (
          <Empty title="Next week is quiet" body="If a manager publishes, it’ll land here and on your calendar integration." />
        ) : null}
      </div>
    </div>
  );
}

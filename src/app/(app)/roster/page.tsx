"use client";

import { DEMO_TODAY } from "@/lib/types";
import { paidHours, timeLabel, weekDays, weekdayLabel } from "@/lib/dates";
import { hasPermission } from "@/lib/permissions";
import { DEPARTMENT_META, personName, useAppStore, visibleShiftsFor } from "@/lib/store";
import { Button, Card, Empty, PageHeader, StatusPill } from "@/components/ui";

export default function RosterPage() {
  const { me, state, store, can, dispatch } = useAppStore();
  if (!can("schedule.view.department") && !can("schedule.view.store") && !can("schedule.view.area")) {
    return (
      <Empty
        title="This view is for leads and up"
        body="Team members get My roster. Switch to Jordan, Casey or Priya in the header."
      />
    );
  }

  const days = weekDays(DEMO_TODAY);
  const shifts = visibleShiftsFor(state, me, store.id).filter((shift) => days.includes(shift.date));
  const people = state.people.filter((person) => {
    if (hasPermission(me.roleId, "schedule.view.area")) {
      return person.storeId === store.id || ["area_manager", "admin", "people_culture"].includes(person.roleId);
    }
    if (hasPermission(me.roleId, "schedule.view.store")) return person.storeId === store.id;
    return person.storeId === me.storeId && person.departmentId === me.departmentId;
  });
  const unpublished = shifts.filter((shift) => !shift.published).length;
  const coverage = days.map((day) => {
    const dayShifts = shifts.filter((shift) => shift.date === day && shift.personId);
    const hours = dayShifts.reduce((sum, shift) => sum + paidHours(shift.start, shift.end, shift.breakMinutes), 0);
    return { day, hours, count: dayShifts.length };
  });

  return (
    <div>
      <PageHeader
        eyebrow={store.name}
        title="Team roster"
        description="One week, every aisle. Colour is department — not a Kronos hieroglyph."
        actions={
          can("schedule.publish") ? (
            <Button onClick={() => dispatch({ type: "publish-week", dates: days })}>
              Publish week {unpublished ? `· ${unpublished} drafts` : ""}
            </Button>
          ) : null
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {coverage.map((item) => (
          <StatusPill key={item.day} tone={item.count < 3 ? "warn" : "good"}>
            {weekdayLabel(item.day)} · {item.count} on · {item.hours.toFixed(0)}h
          </StatusPill>
        ))}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-[860px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-[0.12em] text-ink-soft">
              <th className="px-4 py-3">Teammate</th>
              {days.map((day) => (
                <th key={day} className="px-2 py-3">
                  {weekdayLabel(day)} {day.slice(8)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-b border-line/70 align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold">{personName(person)}</p>
                  <p className="text-xs text-ink-soft">
                    {DEPARTMENT_META[person.departmentId].label} · {person.contractedHours}h
                  </p>
                </td>
                {days.map((day) => {
                  const cell = shifts.filter((shift) => shift.personId === person.id && shift.date === day);
                  return (
                    <td key={day} className="px-2 py-2">
                      <div className="space-y-1">
                        {cell.map((shift) => (
                          <div
                            key={shift.id}
                            className="rounded-xl px-2 py-1.5 text-xs text-white"
                            style={{ background: DEPARTMENT_META[shift.departmentId].tint }}
                          >
                            <div className="font-semibold">{timeLabel(shift.start, shift.end)}</div>
                            <div className="opacity-90">{shift.roleLabel}</div>
                            {!shift.published ? <div className="opacity-80">Draft</div> : null}
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {can("shifts.post_open") ? (
        <Card className="mt-6">
          <p className="font-semibold">Need coverage?</p>
          <p className="mt-1 text-sm text-ink-soft">
            Post an open Sunday eStore-style shift into the market. Qualified people see it instantly.
          </p>
          <Button
            className="mt-3"
            onClick={() =>
              dispatch({
                type: "post-open",
                shift: {
                  storeId: store.id,
                  departmentId: me.departmentId,
                  date: days[6],
                  start: "12:00",
                  end: "18:00",
                  breakMinutes: 30,
                  roleLabel: `${DEPARTMENT_META[me.departmentId].label} cover`,
                  notes: "Posted from the roster",
                },
              })
            }
          >
            Post Sunday cover
          </Button>
        </Card>
      ) : null}
    </div>
  );
}

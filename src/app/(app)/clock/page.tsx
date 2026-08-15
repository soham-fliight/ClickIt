"use client";

import { DEMO_TODAY } from "@/lib/types";
import { paidHours, timeLabel } from "@/lib/dates";
import { classifyShift, awardLabel } from "@/lib/award";
import { useAppStore } from "@/lib/store";
import { Button, Card, Empty, PageHeader, Stat, StatusPill } from "@/components/ui";

export default function ClockPage() {
  const { me, state, store, can, dispatch } = useAppStore();
  if (!can("clock.own") && !can("timesheet.export")) {
    return <Empty title="No clock access" body="This role doesn’t punch or export timesheets." />;
  }

  const todayShift = state.shifts.find(
    (shift) => shift.personId === me.id && shift.date === DEMO_TODAY && shift.published,
  );
  const myPunches = state.punches.filter((punch) => punch.personId === me.id);
  const myShifts = state.shifts.filter((shift) => shift.personId === me.id && shift.status !== "cancelled");
  const fortnightHours = myShifts.reduce(
    (sum, shift) => sum + paidHours(shift.start, shift.end, shift.breakMinutes),
    0,
  );

  return (
    <div>
      <PageHeader
        eyebrow={store.name}
        title="Clock"
        description={`Geofence is ${store.geofenceMeters}m around the store. Kiosk punches sync from the service desk.`}
      />

      {can("clock.own") ? (
        <Card className="mb-6 bg-leaf-deep text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf-mist">
            {todayShift ? `${todayShift.roleLabel} · ${timeLabel(todayShift.start, todayShift.end)}` : "No shift today"}
          </p>
          <p className="display mt-2 text-4xl">
            {todayShift?.status === "in_progress" ? "You’re on the clock" : "Ready when you are"}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "punch", punchType: "in", shiftId: todayShift?.id })}
            >
              Clock in
            </Button>
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "punch", punchType: "break_start", shiftId: todayShift?.id })}
            >
              Start break
            </Button>
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "punch", punchType: "break_end", shiftId: todayShift?.id })}
            >
              End break
            </Button>
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "punch", punchType: "out", shiftId: todayShift?.id })}
            >
              Clock out
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Hours in view" value={`${fortnightHours.toFixed(1)}h`} hint="Award-split, not a blob" />
        <Stat label="Punches" value={String(myPunches.length)} hint="App + kiosk + UKG import" />
        <Stat label="Geofence" value="Inside" hint={store.address} />
      </div>

      <h2 className="display mt-10 text-2xl">Timesheet</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="card w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-[0.12em] text-ink-soft">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Shift</th>
              <th className="px-4 py-3">Hours</th>
              <th className="px-4 py-3">Award</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {myShifts
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((shift) => (
                <tr key={shift.id} className="border-b border-line/70">
                  <td className="px-4 py-3">{shift.date}</td>
                  <td className="px-4 py-3">
                    {timeLabel(shift.start, shift.end)} · {shift.roleLabel}
                  </td>
                  <td className="px-4 py-3">
                    {paidHours(shift.start, shift.end, shift.breakMinutes).toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    {classifyShift(shift)
                      .map((split) => `${awardLabel(split.band)} ${split.hours.toFixed(1)}h`)
                      .join(" · ")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={shift.status === "completed" ? "good" : "neutral"}>
                      {shift.status.replace("_", " ")}
                    </StatusPill>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {can("timesheet.export") ? (
        <Button className="mt-4" onClick={() => dispatch({ type: "connect-integration", integrationId: "int-xero" })}>
          Push fortnight to Xero
        </Button>
      ) : null}
    </div>
  );
}

"use client";

import { prettyDate } from "@/lib/dates";
import { personName, useAppStore } from "@/lib/store";
import { Button, Card, Empty, PageHeader, StatusPill } from "@/components/ui";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityPage() {
  const { me, state, can, dispatch } = useAppStore();
  const mine = state.availability.filter((item) => item.personId === me.id);
  const leave = state.timeOff.filter((item) =>
    can("timeoff.approve") ? true : item.personId === me.id,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Availability"
        title="When you can work"
        description="Preferred windows and leave in one place. Managers see the team; you see yours."
      />

      {can("availability.edit.own") ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DAYS.map((label, weekday) => {
            const window = mine.find((item) => item.weekday === weekday);
            return (
              <Card key={label}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{label}</p>
                <p className="display mt-2 text-2xl">{window ? `${window.start}–${window.end}` : "Off"}</p>
                {window?.preferred ? <StatusPill tone="good">Preferred</StatusPill> : null}
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty title="No availability editor" body="This role doesn’t set floor availability." />
      )}

      <h2 className="display mt-10 text-2xl">Leave</h2>
      <div className="mt-3 space-y-3">
        {leave.map((item) => {
          const who = state.people.find((person) => person.id === item.personId);
          return (
            <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  {who ? personName(who) : "Teammate"} · {item.kind}
                </p>
                <p className="text-sm text-ink-soft">
                  {prettyDate(item.startDate)} – {prettyDate(item.endDate)} · {item.hours}h
                  {item.note ? ` · ${item.note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill
                  tone={item.status === "approved" ? "good" : item.status === "declined" ? "bad" : "warn"}
                >
                  {item.status}
                </StatusPill>
                {can("timeoff.approve") && item.status === "pending" ? (
                  <>
                    <Button
                      onClick={() =>
                        dispatch({ type: "decide-leave", requestId: item.id, decision: "approved" })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        dispatch({ type: "decide-leave", requestId: item.id, decision: "declined" })
                      }
                    >
                      Decline
                    </Button>
                  </>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { DEMO_TODAY } from "@/lib/types";
import { paidHours, relativeDay, timeLabel } from "@/lib/dates";
import { personName, useAppStore } from "@/lib/store";
import { ShiftCard } from "@/components/shift-card";
import { Button, Card, PageHeader, Stat } from "@/components/ui";

export default function TodayPage() {
  const { me, state, store, can, dispatch } = useAppStore();
  const myShifts = state.shifts
    .filter((shift) => shift.personId === me.id && shift.date >= DEMO_TODAY && shift.published)
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  const next = myShifts[0];
  const openOffers = state.offers.filter((offer) => offer.status === "open").length;
  const pendingMine = state.offers.filter(
    (offer) => offer.status === "pending_approval" && (offer.offeredById === me.id || offer.claimedById === me.id),
  ).length;
  const myTasks = state.tasks.filter(
    (task) => task.status === "open" && (task.assignedToId === me.id || !task.assignedToId),
  );
  const news = state.news.filter((item) => item.storeId === store.id || item.storeId === "all");
  const weekHours = state.shifts
    .filter((shift) => shift.personId === me.id && shift.status !== "cancelled")
    .reduce((sum, shift) => sum + paidHours(shift.start, shift.end, shift.breakMinutes), 0);

  return (
    <div>
      <PageHeader
        eyebrow={store.suburb}
        title={`Hey ${me.preferredName}.`}
        description={
          next
            ? `Next up ${relativeDay(next.date)} · ${timeLabel(next.start, next.end)} · ${next.roleLabel}.`
            : "Nothing published on you yet. Check the market."
        }
        actions={
          next && next.date === DEMO_TODAY ? (
            <Button onClick={() => dispatch({ type: "punch", punchType: "in", shiftId: next.id })}>
              Clock in
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="This week" value={`${weekHours.toFixed(1)}h`} hint={`Contracted ${me.contractedHours}h · ${me.awardLevel}`} />
        <Stat label="Open in the market" value={String(openOffers)} hint="Shifts you can actually take" />
        <Stat
          label={can("approvals.queue") ? "Waiting on you" : "Your pending moves"}
          value={String(
            can("approvals.queue")
              ? state.offers.filter((offer) => offer.status === "pending_approval").length +
                state.timeOff.filter((item) => item.status === "pending").length
              : pendingMine,
          )}
          hint="Swaps, giveaways, leave"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <h2 className="display text-2xl">Coming up</h2>
          {myShifts.slice(0, 3).map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              store={state.stores.find((item) => item.id === shift.storeId)}
              actions={
                <div className="flex gap-2">
                  <Link href="/schedule">
                    <Button variant="secondary">Full roster</Button>
                  </Link>
                  {can("shifts.giveaway") ? (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        dispatch({
                          type: "giveaway",
                          shiftId: shift.id,
                          reason: "Can't make this one",
                        })
                      }
                    >
                      Give away
                    </Button>
                  ) : null}
                </div>
              }
            />
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="display text-2xl">On the floor</h2>
          {news.slice(0, 2).map((item) => (
            <Card key={item.id}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
                {item.pinned ? "Pinned" : "News"}
              </p>
              <p className="mt-1 font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{item.body}</p>
            </Card>
          ))}
          <Card>
            <p className="font-semibold">Tasks</p>
            <ul className="mt-3 space-y-2">
              {myTasks.map((task) => (
                <li key={task.id} className="flex items-start justify-between gap-3 text-sm">
                  <span>{task.title}</span>
                  <Button variant="secondary" onClick={() => dispatch({ type: "toggle-task", taskId: task.id })}>
                    Done
                  </Button>
                </li>
              ))}
              {myTasks.length === 0 ? <li className="text-sm text-ink-soft">Nothing open.</li> : null}
            </ul>
          </Card>
          <p className="text-xs text-ink-soft">
            Signed in as {personName(me)} · switch roles in the header to see what a manager sees.
          </p>
        </div>
      </div>
    </div>
  );
}

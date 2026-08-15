"use client";

import { prettyDate, timeLabel } from "@/lib/dates";
import { personName, useAppStore } from "@/lib/store";
import { Button, Card, Empty, PageHeader, StatusPill } from "@/components/ui";

export default function ApprovalsPage() {
  const { state, can, dispatch } = useAppStore();
  if (!can("approvals.queue")) {
    return (
      <Empty
        title="No approvals queue"
        body="Team leads, department managers, store and area managers, and P&C work this list."
      />
    );
  }

  const offers = state.offers.filter((offer) => offer.status === "pending_approval");
  const leave = state.timeOff.filter((item) => item.status === "pending");

  return (
    <div>
      <PageHeader
        eyebrow="Approvals"
        title="Unstick the floor"
        description="Swaps, giveaways and leave. Two buttons. That’s the whole product critique of UKG."
      />

      <div className="space-y-3">
        {offers.map((offer) => {
          const shift = state.shifts.find((item) => item.id === offer.shiftId);
          const from = state.people.find((person) => person.id === offer.offeredById);
          const to = offer.claimedById
            ? state.people.find((person) => person.id === offer.claimedById)
            : null;
          return (
            <Card key={offer.id} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <StatusPill tone="warn">{offer.kind}</StatusPill>
                <p className="mt-2 font-semibold">
                  {from ? personName(from) : "Someone"} → {to ? personName(to) : "unclaimed"}
                </p>
                <p className="text-sm text-ink-soft">
                  {shift
                    ? `${prettyDate(shift.date)} · ${timeLabel(shift.start, shift.end)} · ${shift.roleLabel}`
                    : "Shift missing"}
                  {offer.reason ? ` · ${offer.reason}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => dispatch({ type: "decide-offer", offerId: offer.id, decision: "approved" })}
                >
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => dispatch({ type: "decide-offer", offerId: offer.id, decision: "declined" })}
                >
                  Decline
                </Button>
              </div>
            </Card>
          );
        })}
        {leave.map((item) => {
          const who = state.people.find((person) => person.id === item.personId);
          return (
            <Card key={item.id} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <StatusPill tone="warn">leave</StatusPill>
                <p className="mt-2 font-semibold">
                  {who ? personName(who) : "Teammate"} · {item.kind} · {item.hours}h
                </p>
                <p className="text-sm text-ink-soft">
                  {prettyDate(item.startDate)} – {prettyDate(item.endDate)}
                  {item.note ? ` · ${item.note}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => dispatch({ type: "decide-leave", requestId: item.id, decision: "approved" })}
                >
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => dispatch({ type: "decide-leave", requestId: item.id, decision: "declined" })}
                >
                  Decline
                </Button>
              </div>
            </Card>
          );
        })}
        {offers.length + leave.length === 0 ? (
          <Empty title="Queue is clear" body="That’s the goal. Go walk the floor." />
        ) : null}
      </div>
    </div>
  );
}

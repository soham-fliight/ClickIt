"use client";

import { canActorClaim } from "@/lib/shift-engine";
import { personName, useAppStore } from "@/lib/store";
import { ShiftCard } from "@/components/shift-card";
import { Button, Empty, PageHeader, StatusPill } from "@/components/ui";

export default function MarketPage() {
  const { me, state, can, dispatch } = useAppStore();
  const live = state.offers.filter((offer) => offer.status === "open" || offer.status === "pending_approval");

  if (!can("shifts.claim") && !can("shifts.offer")) {
    return (
      <Empty
        title="Shift market is for the floor"
        body="Payroll and some office roles don’t claim shifts. Switch to Alex or Mei."
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Shift market"
        title="Take it, swap it, give it away"
        description="Open shifts claim instantly. Giveaways and swaps wait on a lead — no 14-screen UKG workflow."
      />

      <div className="space-y-4">
        {live.map((offer) => {
          const shift = state.shifts.find((item) => item.id === offer.shiftId);
          if (!shift) return null;
          const owner = state.people.find((person) => person.id === offer.offeredById);
          const claimer = offer.claimedById
            ? state.people.find((person) => person.id === offer.claimedById)
            : null;
          const blocked = canActorClaim(me, shift, offer);
          return (
            <ShiftCard
              key={offer.id}
              shift={shift}
              person={owner}
              store={state.stores.find((item) => item.id === shift.storeId)}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={offer.status === "open" ? "warn" : "neutral"}>
                    {offer.kind.replace("_", " ")} · {offer.status.replace("_", " ")}
                  </StatusPill>
                  {offer.reason ? <span className="text-sm text-ink-soft">{offer.reason}</span> : null}
                  {claimer ? (
                    <span className="text-sm text-ink-soft">Claimed by {personName(claimer)}</span>
                  ) : null}
                  {offer.status === "open" ? (
                    <Button
                      onClick={() => dispatch({ type: "claim-offer", offerId: offer.id })}
                      disabled={Boolean(blocked)}
                    >
                      {blocked ?? "Claim"}
                    </Button>
                  ) : null}
                  {offer.status === "pending_approval" && can("shifts.approve") ? (
                    <>
                      <Button
                        onClick={() =>
                          dispatch({ type: "decide-offer", offerId: offer.id, decision: "approved" })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          dispatch({ type: "decide-offer", offerId: offer.id, decision: "declined" })
                        }
                      >
                        Decline
                      </Button>
                    </>
                  ) : null}
                </div>
              }
            />
          );
        })}
        {live.length === 0 ? (
          <Empty title="Market is empty" body="When someone gives away a shift or a lead posts coverage, it lands here." />
        ) : null}
      </div>
    </div>
  );
}

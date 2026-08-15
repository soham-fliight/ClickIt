import { describe, expect, it } from "vitest";
import { createInitialState } from "./seed";
import {
  canActorClaim,
  claimOffer,
  decideOffer,
  hasClash,
  postGiveaway,
  publishStoreWeek,
} from "./shift-engine";

describe("claim rules", () => {
  it("lets Alex claim the Saturday closer (checkout qualified)", () => {
    const state = createInitialState();
    const alex = state.people.find((person) => person.id === "p-alex")!;
    const shift = state.shifts.find((item) => item.id === "sh-open-sat-co")!;
    const offer = state.offers.find((item) => item.id === "off-open-sat")!;
    expect(canActorClaim(alex, shift, offer)).toBeNull();

    const result = claimOffer(state, "p-alex", "off-open-sat");
    expect(result.ok).toBe(true);
    if (result.ok) {
      const updated = result.state.shifts.find((item) => item.id === "sh-open-sat-co");
      expect(updated?.personId).toBe("p-alex");
      expect(result.state.offers.find((item) => item.id === "off-open-sat")?.status).toBe(
        "approved",
      );
    }
  });

  it("blocks a clash on Saturday when Alex already works 9–5", () => {
    const state = createInitialState();
    expect(hasClash(state, "p-alex", { date: "2026-08-15", start: "12:00", end: "18:00" })).toBe(
      true,
    );
    expect(hasClash(state, "p-alex", { date: "2026-08-15", start: "17:30", end: "21:30" })).toBe(
      false,
    );
  });

  it("blocks Harper from a checkout-only offer", () => {
    const state = createInitialState();
    const harper = state.people.find((person) => person.id === "p-harper")!;
    const shift = state.shifts.find((item) => item.id === "sh-open-sat-co")!;
    const offer = state.offers.find((item) => item.id === "off-open-sat")!;
    expect(canActorClaim(harper, shift, offer)).toMatch(/not qualified/i);
  });

  it("keeps giveaways pending until a lead approves", () => {
    const state = createInitialState();
    const claimed = claimOffer(state, "p-jordan", "off-luca-give");
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) return;
    expect(claimed.state.offers.find((item) => item.id === "off-luca-give")?.status).toBe(
      "pending_approval",
    );
    expect(claimed.state.shifts.find((item) => item.id === "sh-luca-give")?.personId).toBe(
      "p-luca",
    );

    const approved = decideOffer(claimed.state, "p-priya", "off-luca-give", "approved");
    expect(approved.ok).toBe(true);
    if (approved.ok) {
      expect(approved.state.shifts.find((item) => item.id === "sh-luca-give")?.personId).toBe(
        "p-jordan",
      );
    }
  });

  it("stops team members from approving", () => {
    const state = createInitialState();
    const result = decideOffer(state, "p-alex", "off-mei-swap", "approved");
    expect(result.ok).toBe(false);
  });
});

describe("giveaway + publish", () => {
  it("will not let you give away someone else's shift", () => {
    const state = createInitialState();
    const result = postGiveaway(state, "p-alex", "sh-luca-sat", "nope");
    expect(result.ok).toBe(false);
  });

  it("publishes draft shifts when a store manager hits publish", () => {
    const state = createInitialState();
    const result = publishStoreWeek(state, "p-priya", "st-bondi", [
      state.shifts.find((item) => item.id === "sh-draft-wed")!.date,
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const draft = result.state.shifts.find((item) => item.id === "sh-draft-wed");
      expect(draft?.published).toBe(true);
      expect(draft?.status).toBe("published");
    }
  });
});

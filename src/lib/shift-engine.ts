import { overlaps, paidHours } from "./dates";
import { hasPermission, isQualifiedForDepartment } from "./permissions";
import type { AppState, Person, Shift, ShiftOffer } from "./types";

export type EngineResult =
  | { ok: true; state: AppState; message: string }
  | { ok: false; error: string };

function personById(state: AppState, id: string): Person | undefined {
  return state.people.find((person) => person.id === id);
}

function shiftById(state: AppState, id: string): Shift | undefined {
  return state.shifts.find((shift) => shift.id === id);
}

function offerById(state: AppState, id: string): ShiftOffer | undefined {
  return state.offers.find((offer) => offer.id === id);
}

export function weeklyHours(state: AppState, personId: string, weekDates: string[]): number {
  return state.shifts
    .filter(
      (shift) =>
        shift.personId === personId &&
        weekDates.includes(shift.date) &&
        shift.status !== "cancelled",
    )
    .reduce((sum, shift) => sum + paidHours(shift.start, shift.end, shift.breakMinutes), 0);
}

export function hasClash(
  state: AppState,
  personId: string,
  candidate: Pick<Shift, "date" | "start" | "end">,
  ignoreShiftId?: string,
): boolean {
  return state.shifts.some(
    (shift) =>
      shift.personId === personId &&
      shift.id !== ignoreShiftId &&
      shift.status !== "cancelled" &&
      shift.date === candidate.date &&
      overlaps(shift.start, shift.end, candidate.start, candidate.end),
  );
}

export function canActorClaim(actor: Person, shift: Shift, offer?: ShiftOffer): string | null {
  if (!hasPermission(actor.roleId, "shifts.claim")) {
    return "Your role cannot claim shifts.";
  }
  if (shift.personId === actor.id) return "You already have this shift.";
  if (shift.status === "cancelled") return "That shift was cancelled.";
  if (offer) {
    if (offer.status !== "open") return "This offer is no longer open.";
    if (offer.offeredById === actor.id) return "You posted this offer.";
    if (
      offer.eligibleDepartmentIds.length > 0 &&
      !offer.eligibleDepartmentIds.some((dept) => isQualifiedForDepartment(actor, dept))
    ) {
      return "You are not qualified for this department.";
    }
  } else if (shift.personId !== null) {
    return "This shift is already assigned.";
  }
  if (!isQualifiedForDepartment(actor, shift.departmentId) && !offer) {
    return "You are not qualified for this department.";
  }
  if (actor.storeId !== shift.storeId && actor.roleId !== "area_manager" && actor.roleId !== "admin") {
    return "This shift is at another store.";
  }
  return null;
}

export function claimOffer(state: AppState, actorId: string, offerId: string): EngineResult {
  const actor = personById(state, actorId);
  const offer = offerById(state, offerId);
  if (!actor || !offer) return { ok: false, error: "Offer not found." };
  const shift = shiftById(state, offer.shiftId);
  if (!shift) return { ok: false, error: "Shift not found." };

  const blocked = canActorClaim(actor, shift, offer);
  if (blocked) return { ok: false, error: blocked };
  if (hasClash(state, actor.id, shift)) {
    return { ok: false, error: "That overlaps a shift you already have." };
  }

  const needsApproval = offer.kind !== "open_claim";
  const nextOffer: ShiftOffer = {
    ...offer,
    claimedById: actor.id,
    status: needsApproval ? "pending_approval" : "approved",
  };

  const nextShifts = needsApproval
    ? state.shifts
    : state.shifts.map((item) =>
        item.id === shift.id ? { ...item, personId: actor.id, status: "published" as const } : item,
      );

  return {
    ok: true,
    message: needsApproval
      ? "Claimed — waiting on a lead or manager to approve."
      : "Shift is yours. It’s on your roster.",
    state: {
      ...state,
      offers: state.offers.map((item) => (item.id === offer.id ? nextOffer : item)),
      shifts: nextShifts,
    },
  };
}

export function decideOffer(
  state: AppState,
  actorId: string,
  offerId: string,
  decision: "approved" | "declined",
): EngineResult {
  const actor = personById(state, actorId);
  const offer = offerById(state, offerId);
  if (!actor || !offer) return { ok: false, error: "Offer not found." };
  if (!hasPermission(actor.roleId, "shifts.approve")) {
    return { ok: false, error: "Your role cannot approve shift moves." };
  }
  if (offer.status !== "pending_approval" && offer.status !== "open") {
    return { ok: false, error: "This offer is already closed." };
  }
  if (!offer.claimedById && decision === "approved") {
    return { ok: false, error: "Nobody has claimed this yet." };
  }

  const shift = shiftById(state, offer.shiftId);
  if (!shift) return { ok: false, error: "Shift not found." };

  if (
    actor.roleId === "team_lead" &&
    actor.departmentId !== shift.departmentId &&
    actor.storeId === shift.storeId
  ) {
    return { ok: false, error: "Team leads can only approve their department." };
  }

  let shifts = state.shifts;
  if (decision === "approved" && offer.claimedById) {
    if (offer.kind === "swap" && offer.targetShiftId) {
      const target = shiftById(state, offer.targetShiftId);
      if (!target) return { ok: false, error: "Swap partner shift is missing." };
      shifts = state.shifts.map((item) => {
        if (item.id === shift.id) return { ...item, personId: offer.claimedById! };
        if (item.id === target.id) return { ...item, personId: offer.offeredById };
        return item;
      });
    } else {
      shifts = state.shifts.map((item) =>
        item.id === shift.id ? { ...item, personId: offer.claimedById! } : item,
      );
    }
  }

  return {
    ok: true,
    message: decision === "approved" ? "Approved. Rosters updated." : "Declined. The shift stays put.",
    state: {
      ...state,
      shifts,
      offers: state.offers.map((item) =>
        item.id === offer.id ? { ...item, status: decision } : item,
      ),
    },
  };
}

export function postGiveaway(
  state: AppState,
  actorId: string,
  shiftId: string,
  reason: string,
): EngineResult {
  const actor = personById(state, actorId);
  const shift = shiftById(state, shiftId);
  if (!actor || !shift) return { ok: false, error: "Shift not found." };
  if (!hasPermission(actor.roleId, "shifts.giveaway")) {
    return { ok: false, error: "Your role cannot give away shifts." };
  }
  if (shift.personId !== actor.id) return { ok: false, error: "You can only offer your own shift." };
  if (state.offers.some((offer) => offer.shiftId === shiftId && offer.status === "open")) {
    return { ok: false, error: "This shift is already in the market." };
  }

  const offer: ShiftOffer = {
    id: `off-${Date.now()}`,
    kind: "giveaway",
    shiftId,
    offeredById: actor.id,
    status: "open",
    reason,
    createdAt: new Date().toISOString(),
    eligibleDepartmentIds: [shift.departmentId],
  };

  return {
    ok: true,
    message: "Posted to the shift market.",
    state: { ...state, offers: [offer, ...state.offers] },
  };
}

export function postOpenShift(
  state: AppState,
  actorId: string,
  input: Omit<Shift, "id" | "personId" | "status" | "published">,
): EngineResult {
  const actor = personById(state, actorId);
  if (!actor) return { ok: false, error: "Unknown user." };
  if (!hasPermission(actor.roleId, "shifts.post_open")) {
    return { ok: false, error: "Your role cannot post open shifts." };
  }

  const shift: Shift = {
    ...input,
    id: `sh-open-${Date.now()}`,
    personId: null,
    status: "published",
    published: true,
  };

  const offer: ShiftOffer = {
    id: `off-open-${Date.now()}`,
    kind: "open_claim",
    shiftId: shift.id,
    offeredById: actor.id,
    status: "open",
    reason: "Coverage needed",
    createdAt: new Date().toISOString(),
    eligibleDepartmentIds: [shift.departmentId],
  };

  return {
    ok: true,
    message: "Open shift is live in the market.",
    state: {
      ...state,
      shifts: [...state.shifts, shift],
      offers: [offer, ...state.offers],
    },
  };
}

export function publishStoreWeek(
  state: AppState,
  actorId: string,
  storeId: string,
  dates: string[],
): EngineResult {
  const actor = personById(state, actorId);
  if (!actor) return { ok: false, error: "Unknown user." };
  if (!hasPermission(actor.roleId, "schedule.publish")) {
    return { ok: false, error: "Your role cannot publish the roster." };
  }

  return {
    ok: true,
    message: "Roster published. The floor can see it.",
    state: {
      ...state,
      shifts: state.shifts.map((shift) =>
        shift.storeId === storeId && dates.includes(shift.date)
          ? { ...shift, published: true, status: shift.status === "draft" ? "published" : shift.status }
          : shift,
      ),
    },
  };
}

export function clockPunch(
  state: AppState,
  actorId: string,
  type: "in" | "out" | "break_start" | "break_end",
  shiftId?: string,
): EngineResult {
  const actor = personById(state, actorId);
  if (!actor) return { ok: false, error: "Unknown user." };
  if (!hasPermission(actor.roleId, "clock.own")) {
    return { ok: false, error: "Your role cannot use the clock." };
  }

  const punch = {
    id: `punch-${Date.now()}`,
    personId: actor.id,
    shiftId,
    type,
    at: new Date().toISOString(),
    source: "app" as const,
    insideGeofence: true,
  };

  let shifts = state.shifts;
  if (type === "in" && shiftId) {
    shifts = state.shifts.map((shift) =>
      shift.id === shiftId ? { ...shift, status: "in_progress" as const } : shift,
    );
  }
  if (type === "out" && shiftId) {
    shifts = state.shifts.map((shift) =>
      shift.id === shiftId ? { ...shift, status: "completed" as const } : shift,
    );
  }

  const labels = {
    in: "You're on the clock.",
    out: "Punched out. Nice one.",
    break_start: "Break started.",
    break_end: "Back on the floor.",
  };

  return {
    ok: true,
    message: labels[type],
    state: { ...state, punches: [punch, ...state.punches], shifts },
  };
}

export function decideTimeOff(
  state: AppState,
  actorId: string,
  requestId: string,
  decision: "approved" | "declined",
): EngineResult {
  const actor = personById(state, actorId);
  if (!actor) return { ok: false, error: "Unknown user." };
  if (!hasPermission(actor.roleId, "timeoff.approve")) {
    return { ok: false, error: "Your role cannot approve leave." };
  }
  return {
    ok: true,
    message: decision === "approved" ? "Leave approved." : "Leave declined.",
    state: {
      ...state,
      timeOff: state.timeOff.map((item) =>
        item.id === requestId ? { ...item, status: decision } : item,
      ),
    },
  };
}

export function toggleTask(state: AppState, actorId: string, taskId: string): EngineResult {
  const actor = personById(state, actorId);
  if (!actor) return { ok: false, error: "Unknown user." };
  if (!hasPermission(actor.roleId, "tasks.complete")) {
    return { ok: false, error: "Your role cannot complete tasks." };
  }
  return {
    ok: true,
    message: "Task updated.",
    state: {
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "done" ? "open" : "done" }
          : task,
      ),
    },
  };
}

export function connectIntegration(state: AppState, actorId: string, integrationId: string): EngineResult {
  const actor = personById(state, actorId);
  if (!actor) return { ok: false, error: "Unknown user." };
  if (!hasPermission(actor.roleId, "integrations.manage")) {
    return { ok: false, error: "Your role cannot manage integrations." };
  }
  const now = new Date().toISOString();
  return {
    ok: true,
    message: "Integration connected. First sync queued.",
    state: {
      ...state,
      integrations: state.integrations.map((item) =>
        item.id === integrationId
          ? { ...item, status: "connected", lastSyncAt: now }
          : item,
      ),
      syncEvents: [
        {
          id: `sync-${Date.now()}`,
          integrationId,
          at: now,
          message: "Handshake ok. Mapping employees by employee number.",
          level: "ok",
        },
        ...state.syncEvents,
      ],
    },
  };
}

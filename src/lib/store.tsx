"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { weekDays } from "./dates";
import { hasPermission } from "./permissions";
import { createInitialState } from "./seed";
import {
  claimOffer,
  clockPunch,
  connectIntegration,
  decideOffer,
  decideTimeOff,
  postGiveaway,
  postOpenShift,
  publishStoreWeek,
  toggleTask,
} from "./shift-engine";
import type {
  AppState,
  DepartmentId,
  Permission,
  Person,
  Shift,
} from "./types";

type Action =
  | { type: "switch-user"; userId: string }
  | { type: "switch-store"; storeId: string }
  | { type: "claim-offer"; offerId: string }
  | { type: "decide-offer"; offerId: string; decision: "approved" | "declined" }
  | { type: "giveaway"; shiftId: string; reason: string }
  | { type: "post-open"; shift: Omit<Shift, "id" | "personId" | "status" | "published"> }
  | { type: "publish-week"; dates: string[] }
  | { type: "punch"; punchType: "in" | "out" | "break_start" | "break_end"; shiftId?: string }
  | { type: "decide-leave"; requestId: string; decision: "approved" | "declined" }
  | { type: "toggle-task"; taskId: string }
  | { type: "connect-integration"; integrationId: string }
  | { type: "reset" };

export interface StoreApi {
  state: AppState;
  me: Person;
  store: AppState["stores"][number];
  toast: string | null;
  can: (permission: Permission) => boolean;
  dispatch: (action: Action) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

interface InternalState {
  app: AppState;
  toast: string | null;
}

function reducer(state: InternalState, action: Action): InternalState {
  const fail = (error: string): InternalState => ({ ...state, toast: error });
  const apply = (result: { ok: true; state: AppState; message: string } | { ok: false; error: string }) => {
    if (!result.ok) return fail(result.error);
    return { app: result.state, toast: result.message };
  };

  switch (action.type) {
    case "switch-user": {
      const person = state.app.people.find((item) => item.id === action.userId);
      if (!person) return fail("Unknown teammate.");
      return {
        app: { ...state.app, currentUserId: person.id, actingStoreId: person.storeId },
        toast: `Signed in as ${person.preferredName} · ${person.roleId.replaceAll("_", " ")}`,
      };
    }
    case "switch-store":
      return { app: { ...state.app, actingStoreId: action.storeId }, toast: null };
    case "claim-offer":
      return apply(claimOffer(state.app, state.app.currentUserId, action.offerId));
    case "decide-offer":
      return apply(decideOffer(state.app, state.app.currentUserId, action.offerId, action.decision));
    case "giveaway":
      return apply(postGiveaway(state.app, state.app.currentUserId, action.shiftId, action.reason));
    case "post-open":
      return apply(postOpenShift(state.app, state.app.currentUserId, action.shift));
    case "publish-week":
      return apply(
        publishStoreWeek(state.app, state.app.currentUserId, state.app.actingStoreId, action.dates),
      );
    case "punch":
      return apply(clockPunch(state.app, state.app.currentUserId, action.punchType, action.shiftId));
    case "decide-leave":
      return apply(decideTimeOff(state.app, state.app.currentUserId, action.requestId, action.decision));
    case "toggle-task":
      return apply(toggleTask(state.app, state.app.currentUserId, action.taskId));
    case "connect-integration":
      return apply(connectIntegration(state.app, state.app.currentUserId, action.integrationId));
    case "reset":
      return { app: createInitialState(), toast: "Demo reset to this morning." };
    default:
      return state;
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [internal, dispatch] = useReducer(reducer, undefined, () => ({
    app: createInitialState(),
    toast: null,
  }));

  const value = useMemo<StoreApi>(() => {
    const me = internal.app.people.find((person) => person.id === internal.app.currentUserId);
    const store =
      internal.app.stores.find((item) => item.id === internal.app.actingStoreId) ??
      internal.app.stores[0];
    if (!me) throw new Error("Current user missing");
    return {
      state: internal.app,
      me,
      store,
      toast: internal.toast,
      can: (permission) => hasPermission(me.roleId, permission),
      dispatch,
    };
  }, [internal]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): StoreApi {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useAppStore must be used inside AppStoreProvider");
  return value;
}

export function visibleShiftsFor(state: AppState, me: Person, storeId: string): Shift[] {
  const canArea = hasPermission(me.roleId, "schedule.view.area");
  const canStore = hasPermission(me.roleId, "schedule.view.store");
  const canDept = hasPermission(me.roleId, "schedule.view.department");

  return state.shifts.filter((shift) => {
    if (canArea) return true;
    if (canStore) return shift.storeId === storeId;
    if (canDept) {
      return shift.storeId === me.storeId && shift.departmentId === me.departmentId;
    }
    return shift.personId === me.id && (shift.published || shift.status !== "draft");
  });
}

export const DEPARTMENT_META: Record<
  DepartmentId,
  { label: string; short: string; tint: string }
> = {
  checkout: { label: "Checkout", short: "CO", tint: "var(--dept-checkout)" },
  fresh: { label: "Fresh produce", short: "FR", tint: "var(--dept-fresh)" },
  bakery: { label: "Bakery", short: "BK", tint: "var(--dept-bakery)" },
  deli: { label: "Deli", short: "DL", tint: "var(--dept-deli)" },
  nightfill: { label: "Nightfill", short: "NF", tint: "var(--dept-nightfill)" },
  online: { label: "Online / eStore", short: "ON", tint: "var(--dept-online)" },
  customer_service: { label: "Customer service", short: "CS", tint: "var(--dept-cs)" },
  grocery: { label: "Grocery", short: "GR", tint: "var(--dept-grocery)" },
};

export function personName(person: Person): string {
  return `${person.preferredName} ${person.lastName}`;
}

export function initials(person: Person): string {
  return `${person.preferredName[0]}${person.lastName[0]}`.toUpperCase();
}

export { weekDays };

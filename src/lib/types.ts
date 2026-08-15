export const DEMO_TODAY = "2026-08-15";

export type RoleId =
  | "team_member"
  | "team_lead"
  | "department_manager"
  | "store_manager"
  | "area_manager"
  | "people_culture"
  | "payroll"
  | "admin";

export type Permission =
  | "schedule.view.own"
  | "schedule.view.department"
  | "schedule.view.store"
  | "schedule.view.area"
  | "schedule.create"
  | "schedule.edit"
  | "schedule.publish"
  | "shifts.offer"
  | "shifts.claim"
  | "shifts.giveaway"
  | "shifts.post_open"
  | "shifts.approve"
  | "clock.own"
  | "clock.correct"
  | "timesheet.view.own"
  | "timesheet.approve"
  | "timesheet.export"
  | "availability.edit.own"
  | "availability.view.team"
  | "timeoff.request"
  | "timeoff.approve"
  | "team.view"
  | "team.manage"
  | "news.view"
  | "news.publish"
  | "tasks.complete"
  | "tasks.assign"
  | "approvals.queue"
  | "integrations.manage"
  | "permissions.manage"
  | "settings.store"
  | "settings.org";

export type DepartmentId =
  | "checkout"
  | "fresh"
  | "bakery"
  | "deli"
  | "nightfill"
  | "online"
  | "customer_service"
  | "grocery";

export type ShiftStatus =
  | "draft"
  | "published"
  | "in_progress"
  | "completed"
  | "cancelled";

export type OfferKind = "swap" | "giveaway" | "open_claim";

export type OfferStatus =
  | "open"
  | "pending_approval"
  | "approved"
  | "declined"
  | "withdrawn"
  | "expired";

export interface Store {
  id: string;
  name: string;
  code: string;
  suburb: string;
  state: "NSW" | "VIC" | "QLD";
  address: string;
  timezone: string;
  format: "Supermarket" | "Metro";
  geofenceMeters: number;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  phone: string;
  roleId: RoleId;
  storeId: string;
  departmentId: DepartmentId;
  secondaryDepartments: DepartmentId[];
  avatarHue: number;
  contractedHours: number;
  awardLevel: string;
  startDate: string;
  status: "active" | "on_leave";
  employeeNumber: string;
}

export interface Shift {
  id: string;
  storeId: string;
  departmentId: DepartmentId;
  personId: string | null;
  date: string;
  start: string;
  end: string;
  breakMinutes: number;
  roleLabel: string;
  status: ShiftStatus;
  notes?: string;
  published: boolean;
}

export interface ShiftOffer {
  id: string;
  kind: OfferKind;
  shiftId: string;
  offeredById: string;
  targetShiftId?: string;
  claimedById?: string;
  status: OfferStatus;
  reason?: string;
  createdAt: string;
  eligibleDepartmentIds: DepartmentId[];
}

export interface Punch {
  id: string;
  personId: string;
  shiftId?: string;
  type: "in" | "out" | "break_start" | "break_end";
  at: string;
  source: "app" | "kiosk" | "ukg_import";
  insideGeofence: boolean;
}

export interface TimeOffRequest {
  id: string;
  personId: string;
  startDate: string;
  endDate: string;
  kind: "annual" | "personal" | "unpaid" | "rdo";
  hours: number;
  status: "pending" | "approved" | "declined";
  note?: string;
}

export interface AvailabilityWindow {
  id: string;
  personId: string;
  weekday: number;
  start: string;
  end: string;
  preferred: boolean;
}

export interface NewsItem {
  id: string;
  storeId: string | "all";
  title: string;
  body: string;
  authorId: string;
  publishedAt: string;
  pinned: boolean;
}

export interface FloorTask {
  id: string;
  storeId: string;
  departmentId?: DepartmentId;
  title: string;
  dueDate: string;
  assignedToId?: string;
  status: "open" | "done";
  createdById: string;
}

export type IntegrationStatus =
  | "connected"
  | "syncing"
  | "error"
  | "available";

export interface Integration {
  id: string;
  name: string;
  vendor: string;
  category:
    | "wfm"
    | "payroll"
    | "identity"
    | "calendar"
    | "comms"
    | "pos"
    | "award";
  status: IntegrationStatus;
  lastSyncAt?: string;
  description: string;
  objects: string[];
  direction: "import" | "export" | "bidirectional";
}

export interface SyncEvent {
  id: string;
  integrationId: string;
  at: string;
  message: string;
  level: "ok" | "warn" | "error";
}

export interface AppState {
  people: Person[];
  stores: Store[];
  shifts: Shift[];
  offers: ShiftOffer[];
  punches: Punch[];
  timeOff: TimeOffRequest[];
  availability: AvailabilityWindow[];
  news: NewsItem[];
  tasks: FloorTask[];
  integrations: Integration[];
  syncEvents: SyncEvent[];
  currentUserId: string;
  actingStoreId: string;
}

export interface RoleDefinition {
  id: RoleId;
  name: string;
  blurb: string;
  permissions: Permission[];
}

import type { Permission, Person, RoleDefinition, RoleId, Shift } from "./types";

const FLOOR: Permission[] = [
  "schedule.view.own",
  "shifts.offer",
  "shifts.claim",
  "shifts.giveaway",
  "clock.own",
  "timesheet.view.own",
  "availability.edit.own",
  "timeoff.request",
  "team.view",
  "news.view",
  "tasks.complete",
];

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "team_member",
    name: "Team member",
    blurb: "Own roster, claim and offer shifts, clock, availability.",
    permissions: FLOOR,
  },
  {
    id: "team_lead",
    name: "Team lead",
    blurb: "Department coverage, open shifts, first-line approvals.",
    permissions: [
      ...FLOOR,
      "schedule.view.department",
      "shifts.post_open",
      "shifts.approve",
      "availability.view.team",
      "approvals.queue",
      "tasks.assign",
    ],
  },
  {
    id: "department_manager",
    name: "Department manager",
    blurb: "Build the department roster and approve leave in the aisle.",
    permissions: [
      ...FLOOR,
      "schedule.view.department",
      "schedule.create",
      "schedule.edit",
      "shifts.post_open",
      "shifts.approve",
      "availability.view.team",
      "timeoff.approve",
      "approvals.queue",
      "tasks.assign",
    ],
  },
  {
    id: "store_manager",
    name: "Store manager",
    blurb: "Publish the store, correct clocks, run the floor.",
    permissions: [
      ...FLOOR,
      "schedule.view.department",
      "schedule.view.store",
      "schedule.create",
      "schedule.edit",
      "schedule.publish",
      "shifts.post_open",
      "shifts.approve",
      "clock.correct",
      "timesheet.approve",
      "availability.view.team",
      "timeoff.approve",
      "team.manage",
      "news.publish",
      "tasks.assign",
      "approvals.queue",
      "settings.store",
    ],
  },
  {
    id: "area_manager",
    name: "Area manager",
    blurb: "Multi-store coverage, labour, and publish across the cluster.",
    permissions: [
      ...FLOOR,
      "schedule.view.department",
      "schedule.view.store",
      "schedule.view.area",
      "schedule.create",
      "schedule.edit",
      "schedule.publish",
      "shifts.post_open",
      "shifts.approve",
      "clock.correct",
      "timesheet.approve",
      "availability.view.team",
      "timeoff.approve",
      "team.manage",
      "news.publish",
      "tasks.assign",
      "approvals.queue",
      "settings.store",
      "settings.org",
    ],
  },
  {
    id: "people_culture",
    name: "People & culture",
    blurb: "Roles, leave, and who can do what — without opening UKG.",
    permissions: [
      ...FLOOR,
      "schedule.view.store",
      "schedule.view.area",
      "availability.view.team",
      "timeoff.approve",
      "team.manage",
      "news.publish",
      "approvals.queue",
      "permissions.manage",
      "settings.org",
    ],
  },
  {
    id: "payroll",
    name: "Payroll",
    blurb: "Award-ready timesheets out to Xero / MYOB, not a CSV graveyard.",
    permissions: [
      "schedule.view.store",
      "timesheet.view.own",
      "timesheet.approve",
      "timesheet.export",
      "clock.correct",
      "team.view",
      "news.view",
      "integrations.manage",
    ],
  },
  {
    id: "admin",
    name: "Admin",
    blurb: "Integrations, permissions, and the keys to the building.",
    permissions: [
      ...FLOOR,
      "schedule.view.department",
      "schedule.view.store",
      "schedule.view.area",
      "schedule.create",
      "schedule.edit",
      "schedule.publish",
      "shifts.post_open",
      "shifts.approve",
      "clock.correct",
      "timesheet.approve",
      "timesheet.export",
      "availability.view.team",
      "timeoff.approve",
      "team.manage",
      "news.publish",
      "tasks.assign",
      "approvals.queue",
      "integrations.manage",
      "permissions.manage",
      "settings.store",
      "settings.org",
    ],
  },
];

export const PERMISSION_CATALOG: {
  id: Permission;
  label: string;
  group: string;
}[] = [
  { id: "schedule.view.own", label: "View own roster", group: "Schedule" },
  { id: "schedule.view.department", label: "View department roster", group: "Schedule" },
  { id: "schedule.view.store", label: "View store roster", group: "Schedule" },
  { id: "schedule.view.area", label: "View area / multi-store", group: "Schedule" },
  { id: "schedule.create", label: "Create shifts", group: "Schedule" },
  { id: "schedule.edit", label: "Edit unpublished shifts", group: "Schedule" },
  { id: "schedule.publish", label: "Publish roster", group: "Schedule" },
  { id: "shifts.offer", label: "Offer a swap", group: "Shift market" },
  { id: "shifts.claim", label: "Claim open / offered shifts", group: "Shift market" },
  { id: "shifts.giveaway", label: "Give away a shift", group: "Shift market" },
  { id: "shifts.post_open", label: "Post open shifts", group: "Shift market" },
  { id: "shifts.approve", label: "Approve claims & swaps", group: "Shift market" },
  { id: "clock.own", label: "Clock in / out", group: "Time" },
  { id: "clock.correct", label: "Correct punches", group: "Time" },
  { id: "timesheet.view.own", label: "View own timesheet", group: "Time" },
  { id: "timesheet.approve", label: "Approve timesheets", group: "Time" },
  { id: "timesheet.export", label: "Export to payroll", group: "Time" },
  { id: "availability.edit.own", label: "Edit own availability", group: "Availability" },
  { id: "availability.view.team", label: "View team availability", group: "Availability" },
  { id: "timeoff.request", label: "Request leave", group: "Availability" },
  { id: "timeoff.approve", label: "Approve leave", group: "Availability" },
  { id: "team.view", label: "View directory", group: "People" },
  { id: "team.manage", label: "Manage team profiles", group: "People" },
  { id: "news.view", label: "Read store news", group: "Floor" },
  { id: "news.publish", label: "Publish news", group: "Floor" },
  { id: "tasks.complete", label: "Complete tasks", group: "Floor" },
  { id: "tasks.assign", label: "Assign tasks", group: "Floor" },
  { id: "approvals.queue", label: "Work the approvals queue", group: "People" },
  { id: "integrations.manage", label: "Manage integrations", group: "Admin" },
  { id: "permissions.manage", label: "Edit role permissions", group: "Admin" },
  { id: "settings.store", label: "Store settings", group: "Admin" },
  { id: "settings.org", label: "Organisation settings", group: "Admin" },
];

export function roleById(id: RoleId): RoleDefinition {
  const role = ROLE_DEFINITIONS.find((item) => item.id === id);
  if (!role) throw new Error(`Unknown role ${id}`);
  return role;
}

export function hasPermission(roleId: RoleId, permission: Permission): boolean {
  return roleById(roleId).permissions.includes(permission);
}

export function canSeeShift(actor: Person, shift: Shift, subject: Person | null): boolean {
  if (hasPermission(actor.roleId, "schedule.view.area")) return true;
  if (hasPermission(actor.roleId, "schedule.view.store") && actor.storeId === shift.storeId) {
    return true;
  }
  if (
    hasPermission(actor.roleId, "schedule.view.department") &&
    actor.storeId === shift.storeId &&
    actor.departmentId === shift.departmentId
  ) {
    return true;
  }
  if (shift.personId === actor.id) return true;
  if (subject && subject.id === actor.id) return true;
  return false;
}

export function departmentsFor(person: Person): string[] {
  return [person.departmentId, ...person.secondaryDepartments];
}

export function isQualifiedForDepartment(person: Person, departmentId: string): boolean {
  return departmentsFor(person).includes(departmentId);
}

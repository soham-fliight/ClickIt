import { describe, expect, it } from "vitest";
import { canSeeShift, hasPermission, roleById } from "./permissions";
import { PEOPLE, SHIFTS } from "./seed";

describe("role permissions", () => {
  it("lets a team member claim and offer, but not publish", () => {
    expect(hasPermission("team_member", "shifts.claim")).toBe(true);
    expect(hasPermission("team_member", "shifts.giveaway")).toBe(true);
    expect(hasPermission("team_member", "schedule.publish")).toBe(false);
    expect(hasPermission("team_member", "permissions.manage")).toBe(false);
  });

  it("lets a team lead approve their world but not run payroll", () => {
    expect(hasPermission("team_lead", "shifts.approve")).toBe(true);
    expect(hasPermission("team_lead", "approvals.queue")).toBe(true);
    expect(hasPermission("team_lead", "timesheet.export")).toBe(false);
    expect(hasPermission("team_lead", "integrations.manage")).toBe(false);
  });

  it("gives store managers publish + clock correct", () => {
    expect(hasPermission("store_manager", "schedule.publish")).toBe(true);
    expect(hasPermission("store_manager", "clock.correct")).toBe(true);
    expect(hasPermission("store_manager", "news.publish")).toBe(true);
  });

  it("keeps payroll narrow and export-capable", () => {
    expect(hasPermission("payroll", "timesheet.export")).toBe(true);
    expect(hasPermission("payroll", "integrations.manage")).toBe(true);
    expect(hasPermission("payroll", "shifts.claim")).toBe(false);
    expect(hasPermission("payroll", "schedule.publish")).toBe(false);
  });

  it("gives admin every catalogued permission the role lists", () => {
    const admin = roleById("admin");
    expect(admin.permissions).toContain("integrations.manage");
    expect(admin.permissions).toContain("permissions.manage");
    expect(hasPermission("admin", "schedule.view.area")).toBe(true);
  });
});

describe("schedule visibility", () => {
  const alex = PEOPLE.find((person) => person.id === "p-alex")!;
  const priya = PEOPLE.find((person) => person.id === "p-priya")!;
  const jordan = PEOPLE.find((person) => person.id === "p-jordan")!;
  const alexShift = SHIFTS.find((shift) => shift.id === "sh-alex-sat")!;
  const lucaShift = SHIFTS.find((shift) => shift.id === "sh-luca-sat")!;
  const tomShift = SHIFTS.find((shift) => shift.id === "sh-tom-sat")!;

  it("team members only see their own shifts", () => {
    expect(canSeeShift(alex, alexShift, alex)).toBe(true);
    expect(canSeeShift(alex, lucaShift, null)).toBe(false);
  });

  it("team leads see their department in-store", () => {
    expect(canSeeShift(jordan, lucaShift, null)).toBe(true);
    expect(canSeeShift(jordan, alexShift, null)).toBe(false);
  });

  it("store managers see the store, not the whole area", () => {
    expect(canSeeShift(priya, alexShift, null)).toBe(true);
    expect(canSeeShift(priya, lucaShift, null)).toBe(true);
    expect(canSeeShift(priya, tomShift, null)).toBe(false);
  });
});

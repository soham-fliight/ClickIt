"use client";

import { roleById } from "@/lib/permissions";
import { DEPARTMENT_META, personName, useAppStore } from "@/lib/store";
import { Avatar, Card, DeptPill, Empty, PageHeader, StatusPill } from "@/components/ui";

export default function TeamPage() {
  const { state, store, can } = useAppStore();
  if (!can("team.view")) {
    return <Empty title="Directory hidden" body="This role can’t browse the team." />;
  }

  const people = state.people.filter((person) =>
    can("schedule.view.area") ? true : person.storeId === store.id,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Directory"
        title="Who’s in the building"
        description="Names, aisles, contracted hours. Not an HR dump of 40 fields."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => (
          <Card key={person.id} className="flex gap-3">
            <Avatar person={person} size="lg" />
            <div className="min-w-0">
              <p className="font-semibold">{personName(person)}</p>
              <p className="text-sm text-leaf">{roleById(person.roleId).name}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <DeptPill id={person.departmentId} />
                <StatusPill>{person.contractedHours}h</StatusPill>
                <StatusPill>{person.awardLevel}</StatusPill>
              </div>
              <p className="mt-2 truncate text-xs text-ink-soft">
                {DEPARTMENT_META[person.departmentId].label} · #{person.employeeNumber} ·{" "}
                {state.stores.find((item) => item.id === person.storeId)?.suburb}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

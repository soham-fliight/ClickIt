"use client";

import { PERMISSION_CATALOG, ROLE_DEFINITIONS, hasPermission } from "@/lib/permissions";
import { useAppStore } from "@/lib/store";
import type { Permission } from "@/lib/types";
import { Card, Empty, PageHeader } from "@/components/ui";

const GROUPS = [...new Set(PERMISSION_CATALOG.map((item) => item.group))];

export default function PermissionsPage() {
  const { can } = useAppStore();
  if (!can("permissions.manage")) {
    return (
      <Empty
        title="Permission matrix is P&C / admin"
        body="Switch to Morgan or Riley to see who can publish, approve, export and connect."
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Access"
        title="Who can do what"
        description="Eight roles. Named permissions. No ‘super user’ hiding in a UKG checkbox three menus deep."
      />

      <div className="card overflow-x-auto p-0">
        <table className="min-w-[980px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-3 text-xs uppercase tracking-[0.12em] text-ink-soft">Permission</th>
              {ROLE_DEFINITIONS.map((role) => (
                <th key={role.id} className="px-2 py-3 text-center text-xs font-semibold">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group) => (
              <PermissionGroup key={group} group={group} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {ROLE_DEFINITIONS.map((role) => (
          <Card key={role.id}>
            <p className="font-semibold">{role.name}</p>
            <p className="mt-1 text-sm text-ink-soft">{role.blurb}</p>
            <p className="mt-2 text-xs text-ink-soft">{role.permissions.length} permissions</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PermissionGroup({ group }: { group: string }) {
  const rows = PERMISSION_CATALOG.filter((item) => item.group === group);
  return (
    <>
      <tr className="bg-paper-deep/60">
        <td colSpan={ROLE_DEFINITIONS.length + 1} className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
          {group}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.id} className="border-b border-line/60">
          <td className="px-4 py-2">{row.label}</td>
          {ROLE_DEFINITIONS.map((role) => {
            const on = hasPermission(role.id, row.id as Permission);
            return (
              <td key={role.id} className="px-2 py-2 text-center">
                <span
                  className={
                    on
                      ? "inline-block h-2.5 w-2.5 rounded-full bg-leaf"
                      : "inline-block h-2.5 w-2.5 rounded-full bg-paper-deep"
                  }
                  aria-label={on ? "allowed" : "denied"}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

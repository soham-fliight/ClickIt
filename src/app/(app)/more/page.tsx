"use client";

import {
  CalendarDays,
  CheckSquare,
  LayoutGrid,
  ListTodo,
  Megaphone,
  Plug,
  Settings,
  Shield,
  Sun,
  Users,
} from "lucide-react";
import Link from "next/link";
import { roleById } from "@/lib/permissions";
import { personName, useAppStore } from "@/lib/store";
import type { Permission } from "@/lib/types";
import { Avatar, Card, PageHeader } from "@/components/ui";

const LINKS: { href: string; label: string; blurb: string; permission?: Permission; icon: typeof Users }[] = [
  { href: "/availability", label: "Availability", blurb: "Preferred windows and leave", permission: "availability.edit.own", icon: Sun },
  { href: "/roster", label: "Team roster", blurb: "Department and store week", permission: "schedule.view.department", icon: LayoutGrid },
  { href: "/approvals", label: "Approvals", blurb: "Swaps, giveaways, leave", permission: "approvals.queue", icon: CheckSquare },
  { href: "/team", label: "Team", blurb: "Who’s in the building", permission: "team.view", icon: Users },
  { href: "/news", label: "News", blurb: "What the store needs to know", permission: "news.view", icon: Megaphone },
  { href: "/tasks", label: "Tasks", blurb: "Do the thing, tick the thing", permission: "tasks.complete", icon: ListTodo },
  { href: "/integrations", label: "Integrations", blurb: "UKG, payroll, SSO, calendars", permission: "integrations.manage", icon: Plug },
  { href: "/permissions", label: "Permissions", blurb: "Who can do what", permission: "permissions.manage", icon: Shield },
  { href: "/settings", label: "Settings", blurb: "Store, geofence, award", permission: "settings.store", icon: Settings },
  { href: "/schedule", label: "My roster", blurb: "Published shifts only", permission: "schedule.view.own", icon: CalendarDays },
];

export default function MorePage() {
  const { me, store, can } = useAppStore();
  const role = roleById(me.roleId);
  const items = LINKS.filter((item) => !item.permission || can(item.permission));

  return (
    <div>
      <PageHeader eyebrow="More" title={personName(me)} description={`${role.name} · ${store.suburb}`} />
      <Card className="mb-4 flex items-center gap-3">
        <Avatar person={me} size="lg" />
        <div>
          <p className="font-semibold">{me.email}</p>
          <p className="text-sm text-ink-soft">
            #{me.employeeNumber} · {me.awardLevel} · {me.contractedHours}h contract
          </p>
        </div>
      </Card>
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="card flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf-mist text-leaf">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold">{item.label}</span>
                <span className="block text-sm text-ink-soft">{item.blurb}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

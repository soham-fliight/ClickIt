"use client";

import {
  ArrowLeftRight,
  CalendarDays,
  CheckSquare,
  Clock3,
  Home,
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
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { roleById } from "@/lib/permissions";
import { personName, useAppStore } from "@/lib/store";
import type { Permission } from "@/lib/types";
import { Avatar, Button, cn } from "./ui";

const NAV: {
  href: string;
  label: string;
  icon: typeof Home;
  permission?: Permission;
  mobile?: boolean;
}[] = [
  { href: "/today", label: "Today", icon: Home, mobile: true },
  { href: "/schedule", label: "My roster", icon: CalendarDays, permission: "schedule.view.own", mobile: true },
  { href: "/roster", label: "Team roster", icon: LayoutGrid, permission: "schedule.view.department" },
  { href: "/market", label: "Shift market", icon: ArrowLeftRight, permission: "shifts.claim", mobile: true },
  { href: "/clock", label: "Clock", icon: Clock3, permission: "clock.own", mobile: true },
  { href: "/availability", label: "Availability", icon: Sun, permission: "availability.edit.own" },
  { href: "/approvals", label: "Approvals", icon: CheckSquare, permission: "approvals.queue" },
  { href: "/team", label: "Team", icon: Users, permission: "team.view" },
  { href: "/news", label: "News", icon: Megaphone, permission: "news.view" },
  { href: "/tasks", label: "Tasks", icon: ListTodo, permission: "tasks.complete" },
  { href: "/integrations", label: "Integrations", icon: Plug, permission: "integrations.manage" },
  { href: "/permissions", label: "Permissions", icon: Shield, permission: "permissions.manage" },
  { href: "/settings", label: "Settings", icon: Settings, permission: "settings.store" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { me, store, state, can, toast, dispatch } = useAppStore();
  const role = roleById(me.roleId);
  const items = NAV.filter((item) => !item.permission || can(item.permission));
  const mobile = items.filter((item) => item.mobile).slice(0, 4);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-line bg-white/70 px-4 py-5 backdrop-blur lg:flex lg:flex-col">
        <Link href="/today" className="px-2">
          <p className="display text-2xl">ClickIt</p>
          <p className="text-xs text-ink-soft">The floor, without UKG.</p>
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium",
                  active ? "bg-leaf text-white" : "text-ink-soft hover:bg-paper",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 rounded-2xl bg-paper p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {store.code}
          </p>
          <p className="mt-1 text-sm font-semibold">{store.name}</p>
          {can("schedule.view.area") ? (
            <select
              className="mt-2 w-full rounded-xl border border-line bg-white px-2 py-1.5 text-sm"
              value={state.actingStoreId}
              onChange={(event) => dispatch({ type: "switch-store", storeId: event.target.value })}
            >
              {state.stores.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.suburb}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-paper/80 px-4 py-3 backdrop-blur">
          <div className="lg:hidden">
            <p className="display text-xl leading-none">ClickIt</p>
            <p className="text-[11px] text-ink-soft">{store.suburb}</p>
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm text-ink-soft">{role.blurb}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Switch demo role"
              className="max-w-[180px] rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold sm:max-w-xs sm:text-sm"
              value={me.id}
              onChange={(event) => dispatch({ type: "switch-user", userId: event.target.value })}
            >
              {state.people.map((person) => (
                <option key={person.id} value={person.id}>
                  {personName(person)} · {roleById(person.roleId).name}
                </option>
              ))}
            </select>
            <Button variant="ghost" onClick={() => dispatch({ type: "reset" })}>
              Reset
            </Button>
            <Link href="/" className="hidden sm:block">
              <Avatar person={me} />
            </Link>
          </div>
        </header>

        {toast ? (
          <div className="mx-4 mt-3 rounded-2xl bg-leaf-deep px-4 py-2 text-sm text-white">
            {toast}
          </div>
        ) : null}

        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-10">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-white/95 px-1 py-2 backdrop-blur lg:hidden">
          {mobile.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-semibold",
                  active ? "text-leaf" : "text-ink-soft",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

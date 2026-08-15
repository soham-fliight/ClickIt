"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { roleById } from "@/lib/permissions";
import { personName, useAppStore } from "@/lib/store";
import { Avatar, Button, Card } from "@/components/ui";

const FEATURED = [
  "p-alex",
  "p-jordan",
  "p-casey",
  "p-priya",
  "p-sam",
  "p-morgan",
  "p-dana",
  "p-riley",
];

export default function GatePage() {
  const router = useRouter();
  const { state, dispatch } = useAppStore();

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf">
          Northside Fresh · demo tenant
        </p>
        <h1 className="display mt-3 text-5xl leading-[1.05] sm:text-6xl">
          ClickIt
        </h1>
        <p className="mt-4 text-lg leading-8 text-ink-soft">
          Rosters, shift offers, clocks and permissions — the WorkJam-shaped
          floor app Woolworths should have got instead of UKG Pro. Walk the
          store as any role. Nothing here is a training video.
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED.map((id) => {
          const person = state.people.find((item) => item.id === id);
          if (!person) return null;
          const role = roleById(person.roleId);
          return (
            <button
              key={person.id}
              onClick={() => {
                dispatch({ type: "switch-user", userId: person.id });
                router.push("/today");
              }}
              className="card p-4 text-left transition hover:-translate-y-0.5 hover:border-leaf"
            >
              <Avatar person={person} size="lg" />
              <p className="mt-3 font-semibold">{personName(person)}</p>
              <p className="text-sm text-leaf">{role.name}</p>
              <p className="mt-2 text-sm leading-5 text-ink-soft">{role.blurb}</p>
            </button>
          );
        })}
      </div>

      <Card className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="display text-2xl">Already on the floor?</p>
          <p className="text-sm text-ink-soft">
            Jump in as Alex at Bondi checkout — Saturday closer is sitting in the market.
          </p>
        </div>
        <Button
          onClick={() => {
            dispatch({ type: "switch-user", userId: "p-alex" });
            router.push("/today");
          }}
        >
          Open the floor <ArrowRight className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  );
}

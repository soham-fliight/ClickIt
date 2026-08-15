"use client";

import { personName, useAppStore } from "@/lib/store";
import { Button, Card, Empty, PageHeader, StatusPill } from "@/components/ui";

const TONE = {
  connected: "good",
  syncing: "warn",
  error: "bad",
  available: "neutral",
} as const;

export default function IntegrationsPage() {
  const { state, can, dispatch, me } = useAppStore();
  if (!can("integrations.manage")) {
    return (
      <Empty
        title="Integrations are locked"
        body="Admin and payroll can connect UKG, Xero, SSO and the rest. Switch to Riley or Dana."
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Integrations"
        title="Leave UKG. Keep the history."
        description={`Signed in as ${personName(me)}. Connectors are real-shaped: objects, direction, last sync — not a logo graveyard.`}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {state.integrations.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  {item.vendor} · {item.category}
                </p>
                <h2 className="display mt-1 text-2xl">{item.name}</h2>
              </div>
              <StatusPill tone={TONE[item.status]}>{item.status}</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-soft">{item.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.objects.map((object) => (
                <StatusPill key={object}>{object}</StatusPill>
              ))}
              <StatusPill>{item.direction}</StatusPill>
            </div>
            <p className="mt-3 text-xs text-ink-soft">
              {item.lastSyncAt ? `Last sync ${item.lastSyncAt.replace("T", " ").slice(0, 16)}` : "Never synced"}
            </p>
            {item.status === "available" ? (
              <Button className="mt-4" onClick={() => dispatch({ type: "connect-integration", integrationId: item.id })}>
                Connect
              </Button>
            ) : (
              <Button
                className="mt-4"
                variant="secondary"
                onClick={() => dispatch({ type: "connect-integration", integrationId: item.id })}
              >
                Sync now
              </Button>
            )}
          </Card>
        ))}
      </div>

      <h2 className="display mt-10 text-2xl">Sync log</h2>
      <div className="mt-3 space-y-2">
        {state.syncEvents.map((event) => {
          const integration = state.integrations.find((item) => item.id === event.integrationId);
          return (
            <Card key={event.id} className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold">{integration?.name}</p>
                <p className="text-sm text-ink-soft">{event.message}</p>
              </div>
              <StatusPill tone={event.level === "ok" ? "good" : event.level === "warn" ? "warn" : "bad"}>
                {event.level}
              </StatusPill>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

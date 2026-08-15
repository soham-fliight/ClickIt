"use client";

import { useAppStore } from "@/lib/store";
import { Card, Empty, PageHeader, StatusPill } from "@/components/ui";

export default function SettingsPage() {
  const { store, state, can } = useAppStore();
  if (!can("settings.store") && !can("settings.org")) {
    return (
      <Empty
        title="Store settings are locked"
        body="Store managers, area managers and admin can change the building."
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title={store.name}
        description="Store identity, geofence, and the cluster. ClickIt is multi-store from day one."
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Store</p>
          <p className="display mt-2 text-3xl">{store.code}</p>
          <p className="mt-2 text-sm text-ink-soft">{store.address}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill>{store.format}</StatusPill>
            <StatusPill>{store.timezone}</StatusPill>
            <StatusPill>{store.geofenceMeters}m geofence</StatusPill>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Cluster</p>
          <ul className="mt-3 space-y-2 text-sm">
            {state.stores.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.name}
                  <span className="block text-ink-soft">{item.code}</span>
                </span>
                <StatusPill>{item.format}</StatusPill>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="md:col-span-2">
          <p className="font-semibold">Award & breaks</p>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            General Retail Industry Award is on. Evening after 6pm, Saturday +25%, Sunday +50%.
            Default meal break 30 minutes on shifts over 5 hours. Nightfill is treated as a
            through-midnight shift, not two UKG rows that don’t add up.
          </p>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { personName, useAppStore } from "@/lib/store";
import { Card, Empty, PageHeader, StatusPill } from "@/components/ui";

export default function NewsPage() {
  const { state, store, can } = useAppStore();
  if (!can("news.view")) {
    return <Empty title="No news access" body="This role doesn’t get the store feed." />;
  }
  const items = state.news.filter((item) => item.storeId === "all" || item.storeId === store.id);

  return (
    <div>
      <PageHeader
        eyebrow="News"
        title="What the store needs to know"
        description={
          can("news.publish")
            ? "You can publish. Keep it short — the floor is not reading a policy PDF."
            : "Pinned first. Written like a human."
        }
      />
      <div className="space-y-3">
        {items.map((item) => {
          const author = state.people.find((person) => person.id === item.authorId);
          return (
            <Card key={item.id}>
              <div className="flex flex-wrap gap-2">
                {item.pinned ? <StatusPill tone="good">Pinned</StatusPill> : null}
                <StatusPill>{item.storeId === "all" ? "All stores" : store.suburb}</StatusPill>
              </div>
              <h2 className="display mt-3 text-2xl">{item.title}</h2>
              <p className="mt-2 leading-7 text-ink-soft">{item.body}</p>
              <p className="mt-4 text-xs text-ink-soft">
                {author ? personName(author) : "ClickIt"} · {item.publishedAt.slice(0, 10)}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

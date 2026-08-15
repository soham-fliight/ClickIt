"use client";

import { DEPARTMENT_META, personName, useAppStore } from "@/lib/store";
import { Button, Card, Empty, PageHeader, StatusPill } from "@/components/ui";

export default function TasksPage() {
  const { state, store, can, dispatch } = useAppStore();
  if (!can("tasks.complete")) {
    return <Empty title="No tasks" body="This role doesn’t run floor checklists." />;
  }
  const tasks = state.tasks.filter((task) => task.storeId === store.id);

  return (
    <div>
      <PageHeader
        eyebrow="Tasks"
        title="Do the thing, tick the thing"
        description="Opening checks, culls, fire walks. Assigned to a person, not a void."
      />
      <div className="space-y-3">
        {tasks.map((task) => {
          const who = task.assignedToId
            ? state.people.find((person) => person.id === task.assignedToId)
            : null;
          return (
            <Card key={task.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{task.title}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-ink-soft">
                  <StatusPill tone={task.status === "done" ? "good" : "warn"}>{task.status}</StatusPill>
                  {task.departmentId ? (
                    <StatusPill>{DEPARTMENT_META[task.departmentId].label}</StatusPill>
                  ) : null}
                  <span>Due {task.dueDate}</span>
                  <span>{who ? personName(who) : "Unassigned"}</span>
                </div>
              </div>
              <Button variant="secondary" onClick={() => dispatch({ type: "toggle-task", taskId: task.id })}>
                {task.status === "done" ? "Reopen" : "Complete"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

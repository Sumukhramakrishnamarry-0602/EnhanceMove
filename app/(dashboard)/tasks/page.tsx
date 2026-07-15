import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { AddTaskDialog } from "@/components/shared/add-task-dialog";
import { TaskRow } from "@/components/tasks/task-row";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/supabase/types";

const TABS = [
  { key: "all", label: "All" },
  { key: "due-soon", label: "Due soon" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
] as const;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { tab?: string; new?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tab = searchParams.tab ?? "all";
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let query = supabase.from("tasks").select("*").eq("owner_id", user!.id).order("due_at", { ascending: true, nullsFirst: false });

  if (tab === "due-soon") {
    query = query.eq("completed", false).gte("due_at", now.toISOString()).lte("due_at", in7Days.toISOString());
  } else if (tab === "overdue") {
    query = query.eq("completed", false).lt("due_at", now.toISOString());
  } else if (tab === "completed") {
    query = query.eq("completed", true);
  } else {
    query = query.eq("completed", false);
  }

  const { data: tasks } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">Stay on top of what needs to happen next.</p>
        </div>
        <AddTaskDialog defaultOpen={searchParams.new === "1"} />
      </div>

      <div className="flex items-center gap-1 overflow-x-auto rounded-md border border-border bg-background p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/tasks?tab=${t.key}`}
            className={cn(
              "whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
              tab === t.key ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Card>
        {!tasks || tasks.length === 0 ? (
          <EmptyState icon={CheckSquare} title="Nothing here" description="You're all caught up in this view." />
        ) : (
          <ul className="divide-y divide-border">
            {(tasks as Task[]).map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

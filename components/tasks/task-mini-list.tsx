"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { toggleTaskComplete } from "@/lib/actions/tasks";
import { formatDate, cn } from "@/lib/utils";
import { CheckSquare } from "lucide-react";
import type { Task, Priority } from "@/lib/supabase/types";

const PRIORITY_VARIANT: Record<Priority, "destructive" | "warning" | "secondary"> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

export function TaskMiniList({ tasks }: { tasks: Task[] }) {
  const [, startTransition] = useTransition();

  if (tasks.length === 0) {
    return <EmptyState icon={CheckSquare} title="No tasks yet" />;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li key={t.id} className="flex items-center gap-3 rounded-md border border-border p-3">
          <Checkbox
            checked={t.completed}
            onCheckedChange={(checked) => startTransition(() => toggleTaskComplete(t.id, checked === true))}
          />
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", t.completed && "text-muted-foreground line-through")}>
              {t.title}
            </p>
            <p className="text-xs text-muted-foreground">Due {formatDate(t.due_at)}</p>
          </div>
          <Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge>
        </li>
      ))}
    </ul>
  );
}

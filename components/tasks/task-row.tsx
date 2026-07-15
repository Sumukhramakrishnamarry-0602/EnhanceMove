"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { toggleTaskComplete } from "@/lib/actions/tasks";
import { formatDateTime, cn, daysBetween } from "@/lib/utils";
import type { Task, Priority } from "@/lib/supabase/types";

const PRIORITY_VARIANT: Record<Priority, "destructive" | "warning" | "secondary"> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

export function TaskRow({ task }: { task: Task }) {
  const [, startTransition] = useTransition();
  const overdue = !task.completed && task.due_at && daysBetween(new Date(), new Date(task.due_at)) < 0;

  return (
    <li className="flex items-center gap-3 p-4">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => startTransition(() => toggleTaskComplete(task.id, checked === true))}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium text-foreground", task.completed && "text-muted-foreground line-through")}>
          {task.title}
        </p>
        <p className={cn("text-xs text-muted-foreground", overdue && "font-medium text-destructive")}>
          {task.due_at ? `Due ${formatDateTime(task.due_at)}` : "No due date"}
        </p>
      </div>
      <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
      <EditTaskDialog task={task} />
    </li>
  );
}

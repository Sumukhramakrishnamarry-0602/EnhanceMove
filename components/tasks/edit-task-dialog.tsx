"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { updateTask, deleteTask } from "@/lib/actions/tasks";
import { Pencil, Trash2 } from "lucide-react";
import type { Task, Priority } from "@/lib/supabase/types";
import type { ActionState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Save changes
    </Button>
  );
}

export function EditTaskDialog({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const boundUpdate = (state: ActionState, formData: FormData) => updateTask(task.id, state, formData);
  const [state, formAction] = useFormState<ActionState, FormData>(boundUpdate, {});
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !state.error && !state.fieldErrors) {
      setOpen(false);
      submitted.current = false;
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Edit task">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update this task&apos;s details.</DialogDescription>
        </DialogHeader>
        <form
          action={(formData) => {
            submitted.current = true;
            formAction(formData);
          }}
          className="space-y-4"
        >
          {task.related_entity_type && <input type="hidden" name="related_entity_type" value={task.related_entity_type} />}
          {task.related_entity_id && <input type="hidden" name="related_entity_id" value={task.related_entity_id} />}
          <input type="hidden" name="priority" value={priority} />

          <FormField label="Title" htmlFor="title" error={state.fieldErrors?.title} required>
            <Input id="title" name="title" defaultValue={task.title} />
          </FormField>
          <FormField label="Description" htmlFor="description">
            <Textarea id="description" name="description" rows={3} defaultValue={task.description ?? ""} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Due date" htmlFor="due_at">
              <Input
                id="due_at"
                name="due_at"
                type="datetime-local"
                defaultValue={task.due_at ? task.due_at.slice(0, 16) : ""}
              />
            </FormField>
            <FormField label="Priority" htmlFor="priority-select">
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger id="priority-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter className="justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:bg-red-50"
              onClick={async () => {
                await deleteTask(task.id);
                setOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

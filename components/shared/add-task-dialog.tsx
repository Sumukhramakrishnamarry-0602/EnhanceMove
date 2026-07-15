"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createTask } from "@/lib/actions/tasks";
import { Plus } from "lucide-react";
import type { Priority, RelatedEntityType } from "@/lib/supabase/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Add task
    </Button>
  );
}

export function AddTaskDialog({
  relatedEntityType,
  relatedEntityId,
  trigger,
  defaultOpen,
}: {
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [priority, setPriority] = useState<Priority>("Medium");
  const [state, formAction] = useFormState(createTask, {});
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
        {trigger ?? (
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" /> Add task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Create a to-do for yourself.</DialogDescription>
        </DialogHeader>
        <form
          action={(formData) => {
            submitted.current = true;
            formAction(formData);
          }}
          className="space-y-4"
        >
          {relatedEntityType && <input type="hidden" name="related_entity_type" value={relatedEntityType} />}
          {relatedEntityId && <input type="hidden" name="related_entity_id" value={relatedEntityId} />}
          <input type="hidden" name="priority" value={priority} />

          <FormField label="Title" htmlFor="title" error={state.fieldErrors?.title} required>
            <Input id="title" name="title" placeholder="Send proposal" />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <Textarea id="description" name="description" rows={3} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Due date" htmlFor="due_at">
              <Input id="due_at" name="due_at" type="datetime-local" />
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

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

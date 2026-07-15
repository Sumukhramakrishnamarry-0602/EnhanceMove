"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createActivity } from "@/lib/actions/activities";
import { Plus } from "lucide-react";
import type { RelatedEntityType, ActivityType } from "@/lib/supabase/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Add activity
    </Button>
  );
}

export function AddActivityDialog({
  relatedEntityType,
  relatedEntityId,
}: {
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ActivityType>("note");
  const [state, formAction] = useFormState(createActivity, {});
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
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4" /> Add activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log an activity</DialogTitle>
          <DialogDescription>Record a call, email, meeting, or note.</DialogDescription>
        </DialogHeader>
        <form
          action={(formData) => {
            submitted.current = true;
            formAction(formData);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="related_entity_type" value={relatedEntityType} />
          <input type="hidden" name="related_entity_id" value={relatedEntityId} />
          <input type="hidden" name="type" value={type} />

          <FormField label="Type" htmlFor="activity-type">
            <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
              <SelectTrigger id="activity-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Subject" htmlFor="subject" error={state.fieldErrors?.subject} required>
            <Input id="subject" name="subject" placeholder="Discovery call" />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <Textarea id="description" name="description" rows={3} />
          </FormField>

          <FormField label="Due date (optional)" htmlFor="due_at">
            <Input id="due_at" name="due_at" type="datetime-local" />
          </FormField>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

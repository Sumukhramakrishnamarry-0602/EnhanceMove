"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useState } from "react";
import type { ActionState } from "@/lib/actions/auth";
import type { Contact } from "@/lib/supabase/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {label}
    </Button>
  );
}

export function ContactForm({
  action,
  contact,
  companyOptions,
  onCancel,
  submitLabel = "Save contact",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  contact?: Partial<Contact>;
  companyOptions: ComboboxOption[];
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const [companyId, setCompanyId] = useState(contact?.company_id ?? "");

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="first_name" error={state.fieldErrors?.first_name} required>
          <Input id="first_name" name="first_name" defaultValue={contact?.first_name} />
        </FormField>
        <FormField label="Last name" htmlFor="last_name" error={state.fieldErrors?.last_name}>
          <Input id="last_name" name="last_name" defaultValue={contact?.last_name} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email" error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} />
        </FormField>
        <FormField label="Phone" htmlFor="phone" error={state.fieldErrors?.phone}>
          <Input id="phone" name="phone" defaultValue={contact?.phone ?? ""} />
        </FormField>
      </div>

      <FormField label="Company" htmlFor="company_id">
        <input type="hidden" name="company_id" value={companyId} />
        <Combobox
          options={companyOptions}
          value={companyId}
          onChange={setCompanyId}
          placeholder="Search companies…"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Title / role" htmlFor="title" error={state.fieldErrors?.title}>
          <Input id="title" name="title" defaultValue={contact?.title ?? ""} />
        </FormField>
        <FormField label="LinkedIn URL" htmlFor="linkedin_url" error={state.fieldErrors?.linkedin_url}>
          <Input id="linkedin_url" name="linkedin_url" defaultValue={contact?.linkedin_url ?? ""} />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes" error={state.fieldErrors?.notes}>
        <Textarea id="notes" name="notes" rows={4} defaultValue={contact?.notes ?? ""} />
      </FormField>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

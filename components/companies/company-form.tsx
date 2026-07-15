"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import type { ActionState } from "@/lib/actions/auth";
import type { Company, CompanyStatus } from "@/lib/supabase/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {label}
    </Button>
  );
}

export function CompanyForm({
  action,
  company,
  onCancel,
  submitLabel = "Save company",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  company?: Partial<Company>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const [status, setStatus] = useState<CompanyStatus>(company?.status ?? "Prospect");

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Company name" htmlFor="name" error={state.fieldErrors?.name} required>
        <Input id="name" name="name" defaultValue={company?.name} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Website" htmlFor="website" error={state.fieldErrors?.website}>
          <Input id="website" name="website" placeholder="https://example.com" defaultValue={company?.website ?? ""} />
        </FormField>
        <FormField label="Industry" htmlFor="industry" error={state.fieldErrors?.industry}>
          <Input id="industry" name="industry" defaultValue={company?.industry ?? ""} />
        </FormField>
      </div>

      <FormField label="Status" htmlFor="status">
        <input type="hidden" name="status" value={status} />
        <Select value={status} onValueChange={(v) => setStatus(v as CompanyStatus)}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Prospect">Prospect</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Notes" htmlFor="notes" error={state.fieldErrors?.notes}>
        <Textarea id="notes" name="notes" rows={4} defaultValue={company?.notes ?? ""} />
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

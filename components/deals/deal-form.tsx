"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useState } from "react";
import type { ActionState } from "@/lib/actions/auth";
import type { Deal, DealStage, DealStatus } from "@/lib/supabase/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {label}
    </Button>
  );
}

const STAGES: DealStage[] = ["Lead", "Qualified", "Demo", "Proposal", "Won", "Lost"];
const STATUSES: DealStatus[] = ["Open", "Closed Won", "Closed Lost"];
const CURRENCIES = ["USD", "EUR", "GBP", "AED", "INR"];

export function DealForm({
  action,
  deal,
  companyOptions,
  contactOptions,
  onCancel,
  submitLabel = "Save deal",
  defaultStage,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  deal?: Partial<Deal>;
  companyOptions: ComboboxOption[];
  contactOptions: ComboboxOption[];
  onCancel?: () => void;
  submitLabel?: string;
  defaultStage?: DealStage;
}) {
  const [state, formAction] = useFormState(action, {});
  const [companyId, setCompanyId] = useState(deal?.company_id ?? "");
  const [contactId, setContactId] = useState(deal?.contact_id ?? "");
  const [stage, setStage] = useState<DealStage>(deal?.stage ?? defaultStage ?? "Lead");
  const [status, setStatus] = useState<DealStatus>(deal?.status ?? "Open");
  const [currency, setCurrency] = useState(deal?.currency ?? "USD");

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Deal title" htmlFor="title" error={state.fieldErrors?.title} required>
        <Input id="title" name="title" defaultValue={deal?.title} placeholder="Acme Inc. — Annual plan" />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Company" htmlFor="company_id">
          <input type="hidden" name="company_id" value={companyId} />
          <Combobox options={companyOptions} value={companyId} onChange={setCompanyId} placeholder="Search companies…" />
        </FormField>
        <FormField label="Contact" htmlFor="contact_id">
          <input type="hidden" name="contact_id" value={contactId} />
          <Combobox options={contactOptions} value={contactId} onChange={setContactId} placeholder="Search contacts…" />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Amount" htmlFor="amount" error={state.fieldErrors?.amount}>
          <Input id="amount" name="amount" type="number" min="0" step="0.01" defaultValue={deal?.amount ?? 0} />
        </FormField>
        <FormField label="Currency" htmlFor="currency">
          <input type="hidden" name="currency" value={currency} />
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Probability %" htmlFor="probability" error={state.fieldErrors?.probability}>
          <Input id="probability" name="probability" type="number" min="0" max="100" defaultValue={deal?.probability ?? 10} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Stage" htmlFor="stage">
          <input type="hidden" name="stage" value={stage} />
          <Select value={stage} onValueChange={(v) => setStage(v as DealStage)}>
            <SelectTrigger id="stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Status" htmlFor="status">
          <input type="hidden" name="status" value={status} />
          <Select value={status} onValueChange={(v) => setStatus(v as DealStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Expected close date" htmlFor="expected_close_date">
          <Input id="expected_close_date" name="expected_close_date" type="date" defaultValue={deal?.expected_close_date ?? ""} />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={3} defaultValue={deal?.notes ?? ""} />
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

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { TIMEZONES } from "@/lib/timezones";
import type { Profile, Role } from "@/lib/supabase/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Save changes
    </Button>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useFormState(async (prevState: Awaited<ReturnType<typeof updateProfile>>, fd: FormData) => {
    const result = await updateProfile(prevState, fd);
    if (!result?.error && !result?.fieldErrors) toast.success("Profile updated");
    return result;
  }, {});
  const [role, setRole] = useState<Role>(profile.role);
  const [timezone, setTimezone] = useState(profile.timezone);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="avatar_url" value={profile.avatar_url ?? ""} />
      <FormField label="Full name" htmlFor="full_name" error={state.fieldErrors?.full_name} required>
        <Input id="full_name" name="full_name" defaultValue={profile.full_name} />
      </FormField>

      <FormField label="Role" htmlFor="role">
        <input type="hidden" name="role" value={role} />
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Founder">Founder</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Ops">Ops</SelectItem>
            <SelectItem value="Investor Relations">Investor Relations</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Company name" htmlFor="company_name" error={state.fieldErrors?.company_name} required>
        <Input id="company_name" name="company_name" defaultValue={profile.company_name} />
      </FormField>

      <FormField label="Timezone" htmlFor="timezone">
        <input type="hidden" name="timezone" value={timezone} />
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger id="timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

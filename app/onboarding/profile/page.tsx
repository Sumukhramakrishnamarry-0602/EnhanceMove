"use client";

import { useFormState, useFormStatus } from "react-dom";
import { completeOnboarding } from "@/lib/actions/profile";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { TIMEZONES } from "@/lib/timezones";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending}>
      Complete profile &amp; go to dashboard
    </Button>
  );
}

export default function OnboardingProfilePage() {
  const [state, formAction] = useFormState(completeOnboarding, initialState);
  const [role, setRole] = useState("Founder");
  const [timezone, setTimezone] = useState(
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              E
            </div>
            <span className="text-lg font-semibold tracking-tight">EnhanceMove</span>
          </div>
          <CardTitle className="text-xl">Set up your profile</CardTitle>
          <CardDescription>Tell us a bit about you so we can tailor your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <FormField label="Full name" htmlFor="full_name" error={state.fieldErrors?.full_name} required>
              <Input id="full_name" name="full_name" placeholder="Jordan Blake" autoComplete="name" />
            </FormField>

            <FormField label="Role" htmlFor="role" error={state.fieldErrors?.role} required>
              <input type="hidden" name="role" value={role} />
              <Select value={role} onValueChange={setRole}>
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
              <Input id="company_name" name="company_name" placeholder="Acme Inc." />
            </FormField>

            <FormField label="Timezone" htmlFor="timezone" error={state.fieldErrors?.timezone} required>
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
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

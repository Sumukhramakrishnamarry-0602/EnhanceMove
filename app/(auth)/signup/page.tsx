"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signup, type ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending}>
      Create account
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signup, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Start organizing your pipeline in minutes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          <FormField label="Email" htmlFor="email" error={state.fieldErrors?.email} required>
            <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" />
          </FormField>
          <FormField label="Password" htmlFor="password" error={state.fieldErrors?.password} required hint="At least 8 characters">
            <Input id="password" name="password" type="password" autoComplete="new-password" />
          </FormField>
          <FormField
            label="Confirm password"
            htmlFor="confirmPassword"
            error={state.fieldErrors?.confirmPassword}
            required
          >
            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" />
          </FormField>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton />
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { login, sendMagicLink, type ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { Mail } from "lucide-react";

const initialState: ActionState = {};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending}>
      {children}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);
  const [magicState, magicAction] = useFormState(sendMagicLink, initialState);
  const [magicSent, setMagicSent] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Log in</CardTitle>
        <CardDescription>Welcome back. Enter your details to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "password" ? (
          <form action={formAction} className="space-y-4">
            <FormField label="Email" htmlFor="email" error={state.fieldErrors?.email} required>
              <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" />
            </FormField>
            <FormField label="Password" htmlFor="password" error={state.fieldErrors?.password} required>
              <Input id="password" name="password" type="password" autoComplete="current-password" />
            </FormField>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <SubmitButton>Log in</SubmitButton>
          </form>
        ) : (
          <form
            action={async (formData) => {
              await magicAction(formData);
              setMagicSent(true);
            }}
            className="space-y-4"
          >
            <FormField label="Email" htmlFor="magic-email" error={magicState.fieldErrors?.email} required>
              <Input id="magic-email" name="email" type="email" placeholder="you@company.com" />
            </FormField>
            {magicState.error && <p className="text-sm text-destructive">{magicState.error}</p>}
            {magicSent && !magicState.error && (
              <p className="text-sm text-emerald-700">Check your inbox for a login link.</p>
            )}
            <SubmitButton>
              <Mail className="h-4 w-4" /> Send magic link
            </SubmitButton>
          </form>
        )}

        <button
          type="button"
          onClick={() => setMode(mode === "password" ? "magic" : "password")}
          className="w-full text-center text-sm text-primary hover:underline"
        >
          {mode === "password" ? "Log in with a magic link instead" : "Log in with a password instead"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

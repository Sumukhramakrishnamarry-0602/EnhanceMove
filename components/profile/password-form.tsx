"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changePassword } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { useRef } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Update password
    </Button>
  );
}

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(async (prevState: Awaited<ReturnType<typeof changePassword>>, fd: FormData) => {
    const result = await changePassword(prevState, fd);
    if (!result?.error && !result?.fieldErrors) {
      toast.success("Password updated");
      formRef.current?.reset();
    }
    return result;
  }, {});

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <FormField label="New password" htmlFor="password" error={state.fieldErrors?.password} hint="At least 8 characters" required>
        <Input id="password" name="password" type="password" autoComplete="new-password" />
      </FormField>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

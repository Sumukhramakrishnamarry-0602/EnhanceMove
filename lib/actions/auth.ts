"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validators/schemas";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = { email: formData.get("email"), password: formData.get("password") };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signup(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) {
    return { error: error.message };
  }

  redirect("/onboarding/profile");
}

export async function sendMagicLink(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string;
  if (!email) return { error: "Enter an email address" };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });
  if (error) return { error: error.message };

  return { error: undefined };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function flatten(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) {
    if (val?.[0]) out[key] = val[0];
  }
  return out;
}

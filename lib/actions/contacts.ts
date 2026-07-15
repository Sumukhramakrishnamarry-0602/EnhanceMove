"use server";

import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validators/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions/auth";

function parseContactForm(formData: FormData) {
  return contactSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    company_id: formData.get("company_id") ?? "",
    title: formData.get("title") ?? "",
    linkedin_url: formData.get("linkedin_url") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

function toFieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) if (val?.[0]) out[key] = val[0];
  return out;
}

export async function createContact(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseContactForm(formData);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { company_id, ...rest } = parsed.data;
  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...rest, company_id: company_id || null, owner_id: user!.id })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/contacts");
  redirect(`/contacts/${data!.id}`);
}

export async function updateContact(
  contactId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseContactForm(formData);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const supabase = createClient();
  const { company_id, ...rest } = parsed.data;
  const { error } = await supabase
    .from("contacts")
    .update({ ...rest, company_id: company_id || null })
    .eq("id", contactId);

  if (error) return { error: error.message };

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  return {};
}

export async function deleteContact(contactId: string) {
  const supabase = createClient();
  await supabase.from("contacts").delete().eq("id", contactId);
  revalidatePath("/contacts");
  redirect("/contacts");
}

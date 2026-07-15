"use server";

import { createClient } from "@/lib/supabase/server";
import { companySchema } from "@/lib/validators/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions/auth";

function parseCompanyForm(formData: FormData) {
  return companySchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website") ?? "",
    industry: formData.get("industry") ?? "",
    status: formData.get("status") ?? "Prospect",
    notes: formData.get("notes") ?? "",
  });
}

function toFieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) if (val?.[0]) out[key] = val[0];
  return out;
}

export async function createCompany(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseCompanyForm(formData);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("companies")
    .insert({ ...parsed.data, owner_id: user!.id })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/companies");
  redirect(`/companies/${data!.id}`);
}

export async function updateCompany(
  companyId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseCompanyForm(formData);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const supabase = createClient();
  const { error } = await supabase.from("companies").update(parsed.data).eq("id", companyId);
  if (error) return { error: error.message };

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  return {};
}

export async function deleteCompany(companyId: string) {
  const supabase = createClient();
  await supabase.from("companies").delete().eq("id", companyId);
  revalidatePath("/companies");
  redirect("/companies");
}

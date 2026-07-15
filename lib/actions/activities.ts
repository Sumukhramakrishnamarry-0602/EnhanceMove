"use server";

import { createClient } from "@/lib/supabase/server";
import { activitySchema } from "@/lib/validators/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions/auth";

function toFieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) if (val?.[0]) out[key] = val[0];
  return out;
}

export async function createActivity(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = activitySchema.safeParse({
    type: formData.get("type") ?? "note",
    subject: formData.get("subject"),
    description: formData.get("description") ?? "",
    related_entity_type: formData.get("related_entity_type"),
    related_entity_id: formData.get("related_entity_id"),
    due_at: formData.get("due_at") ?? "",
  });
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { due_at, ...rest } = parsed.data;
  const { error } = await supabase.from("activities").insert({
    ...rest,
    due_at: due_at || null,
    owner_id: user!.id,
  });
  if (error) return { error: error.message };

  // Keep "last contacted" fresh so the "no recent activity" badge clears.
  if (parsed.data.related_entity_type === "contact") {
    await supabase
      .from("contacts")
      .update({ last_contacted_at: new Date().toISOString() })
      .eq("id", parsed.data.related_entity_id);
  }

  revalidatePath("/activities");
  revalidatePath(`/${parsed.data.related_entity_type}s/${parsed.data.related_entity_id}`);
  return {};
}

export async function markActivityComplete(activityId: string, path: string) {
  const supabase = createClient();
  await supabase.from("activities").update({ completed_at: new Date().toISOString() }).eq("id", activityId);
  revalidatePath(path);
}

export async function deleteActivity(activityId: string, path: string) {
  const supabase = createClient();
  await supabase.from("activities").delete().eq("id", activityId);
  revalidatePath(path);
}

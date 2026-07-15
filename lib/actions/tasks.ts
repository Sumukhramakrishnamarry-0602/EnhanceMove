"use server";

import { createClient } from "@/lib/supabase/server";
import { taskSchema } from "@/lib/validators/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions/auth";

function toFieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) if (val?.[0]) out[key] = val[0];
  return out;
}

export async function createTask(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    related_entity_type: formData.get("related_entity_type") ?? "",
    related_entity_id: formData.get("related_entity_id") ?? "",
    due_at: formData.get("due_at") ?? "",
    priority: formData.get("priority") ?? "Medium",
  });
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { due_at, related_entity_type, related_entity_id, ...rest } = parsed.data;
  const { error } = await supabase.from("tasks").insert({
    ...rest,
    due_at: due_at || null,
    related_entity_type: related_entity_type || null,
    related_entity_id: related_entity_id || null,
    owner_id: user!.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return {};
}

export async function updateTask(taskId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    related_entity_type: formData.get("related_entity_type") ?? "",
    related_entity_id: formData.get("related_entity_id") ?? "",
    due_at: formData.get("due_at") ?? "",
    priority: formData.get("priority") ?? "Medium",
  });
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const supabase = createClient();
  const { due_at, related_entity_type, related_entity_id, ...rest } = parsed.data;
  const { error } = await supabase
    .from("tasks")
    .update({
      ...rest,
      due_at: due_at || null,
      related_entity_type: related_entity_type || null,
      related_entity_id: related_entity_id || null,
    })
    .eq("id", taskId);
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  return {};
}

export async function toggleTaskComplete(taskId: string, completed: boolean) {
  const supabase = createClient();
  await supabase.from("tasks").update({ completed }).eq("id", taskId);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string) {
  const supabase = createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

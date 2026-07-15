"use server";

import { createClient } from "@/lib/supabase/server";
import { profileSchema, notificationPrefsSchema } from "@/lib/validators/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions/auth";

export async function completeOnboarding(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = {
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    company_name: formData.get("company_name"),
    timezone: formData.get("timezone"),
    avatar_url: formData.get("avatar_url") || "",
  };
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) if (v?.[0]) fieldErrors[k] = v[0];
    return { fieldErrors };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, onboarding_completed: true })
    .eq("id", user!.id);

  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function updateProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = {
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    company_name: formData.get("company_name"),
    timezone: formData.get("timezone"),
    avatar_url: formData.get("avatar_url") || "",
  };
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) if (v?.[0]) fieldErrors[k] = v[0];
    return { fieldErrors };
  }

  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user!.id);
  if (error) return { error: error.message };

  revalidatePath("/profile");
  return {};
}

export async function updateNotificationPrefs(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = {
    notify_task_due: formData.get("notify_task_due") === "on",
    notify_deal_changes: formData.get("notify_deal_changes") === "on",
  };
  const parsed = notificationPrefsSchema.parse(raw);

  await supabase.from("profiles").update(parsed).eq("id", user!.id);
  revalidatePath("/profile");
}

export async function changePassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const password = formData.get("password") as string;
  if (!password || password.length < 8) {
    return { fieldErrors: { password: "Password must be at least 8 characters" } };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return {};
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    cacheControl: "3600",
  });
  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatarAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "Choose an image to upload" };
  if (!file.type.startsWith("image/")) return { error: "File must be an image" };
  if (file.size > 5 * 1024 * 1024) return { error: "Image must be under 5MB" };

  try {
    const url = await uploadAvatar(user!.id, file);
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user!.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }

  revalidatePath("/profile");
  return {};
}

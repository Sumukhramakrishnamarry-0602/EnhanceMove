"use server";

import { createClient } from "@/lib/supabase/server";
import { dealSchema } from "@/lib/validators/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions/auth";
import type { DealStage } from "@/lib/supabase/types";

function parseDealForm(formData: FormData) {
  return dealSchema.safeParse({
    title: formData.get("title"),
    company_id: formData.get("company_id") ?? "",
    contact_id: formData.get("contact_id") ?? "",
    stage: formData.get("stage") ?? "Lead",
    amount: formData.get("amount") ?? 0,
    currency: formData.get("currency") ?? "USD",
    expected_close_date: formData.get("expected_close_date") ?? "",
    probability: formData.get("probability") ?? 10,
    status: formData.get("status") ?? "Open",
    notes: formData.get("notes") ?? "",
  });
}

function toFieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) if (val?.[0]) out[key] = val[0];
  return out;
}

export async function createDeal(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseDealForm(formData);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { company_id, contact_id, expected_close_date, ...rest } = parsed.data;
  const { data, error } = await supabase
    .from("deals")
    .insert({
      ...rest,
      company_id: company_id || null,
      contact_id: contact_id || null,
      expected_close_date: expected_close_date || null,
      owner_id: user!.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Automation: new deal gets an initial "Intro call" activity.
  await supabase.from("activities").insert({
    owner_id: user!.id,
    related_entity_type: "deal",
    related_entity_id: data!.id,
    type: "call",
    subject: "Intro call",
    description: "Auto-created when this deal was opened.",
  });

  revalidatePath("/deals");
  redirect(`/deals/${data!.id}`);
}

export async function updateDeal(dealId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseDealForm(formData);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase.from("deals").select("stage").eq("id", dealId).single();

  const { company_id, contact_id, expected_close_date, ...rest } = parsed.data;
  const { error } = await supabase
    .from("deals")
    .update({
      ...rest,
      company_id: company_id || null,
      contact_id: contact_id || null,
      expected_close_date: expected_close_date || null,
    })
    .eq("id", dealId);

  if (error) return { error: error.message };

  // Automation: stage transitioned into Proposal → auto-create follow-up task.
  if (existing && existing.stage !== "Proposal" && parsed.data.stage === "Proposal") {
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 2);
    await supabase.from("tasks").insert({
      owner_id: user!.id,
      related_entity_type: "deal",
      related_entity_id: dealId,
      title: "Send proposal",
      due_at: dueAt.toISOString(),
      priority: "High",
    });
  }

  revalidatePath("/deals");
  revalidatePath(`/deals/${dealId}`);
  return {};
}

export async function updateDealStage(dealId: string, stage: DealStage) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase.from("deals").select("stage").eq("id", dealId).single();

  await supabase.from("deals").update({ stage }).eq("id", dealId);

  if (existing && existing.stage !== "Proposal" && stage === "Proposal") {
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 2);
    await supabase.from("tasks").insert({
      owner_id: user!.id,
      related_entity_type: "deal",
      related_entity_id: dealId,
      title: "Send proposal",
      due_at: dueAt.toISOString(),
      priority: "High",
    });
  }

  revalidatePath("/deals");
}

export async function deleteDeal(dealId: string) {
  const supabase = createClient();
  await supabase.from("deals").delete().eq("id", dealId);
  revalidatePath("/deals");
  redirect("/deals");
}

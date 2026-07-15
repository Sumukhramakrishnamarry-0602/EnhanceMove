import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { AddActivityDialog } from "@/components/shared/add-activity-dialog";
import { AddTaskDialog } from "@/components/shared/add-task-dialog";
import { TaskMiniList } from "@/components/tasks/task-mini-list";
import { EditDealDialog } from "@/components/deals/edit-deal-dialog";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { updateDeal, deleteDeal } from "@/lib/actions/deals";
import { formatCurrency, formatDate, fullName } from "@/lib/utils";
import type { Activity, Task } from "@/lib/supabase/types";

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: deal } = await supabase
    .from("deals")
    .select("*, companies(id, name), contacts(id, first_name, last_name)")
    .eq("id", params.id)
    .single();

  if (!deal) notFound();

  const [{ data: activities }, { data: tasks }, { data: companies }, { data: contacts }] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("related_entity_type", "deal")
      .eq("related_entity_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("*")
      .eq("related_entity_type", "deal")
      .eq("related_entity_id", params.id)
      .order("due_at", { ascending: true }),
    supabase.from("companies").select("id, name").eq("owner_id", user!.id).order("name"),
    supabase.from("contacts").select("id, first_name, last_name").eq("owner_id", user!.id).order("first_name"),
  ]);

  const companyOptions = (companies ?? []).map((c) => ({ value: c.id, label: c.name }));
  const contactOptions = (contacts ?? []).map((c) => ({ value: c.id, label: fullName(c.first_name, c.last_name) }));
  const boundUpdate = updateDeal.bind(null, deal.id);
  const boundDelete = deleteDeal.bind(null, deal.id);
  const company = deal.companies as { id: string; name: string } | null;
  const contact = deal.contacts as { id: string; first_name: string; last_name: string } | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{deal.title}</h1>
            <Badge>{deal.stage}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {company && (
              <Link href={`/companies/${company.id}`} className="hover:text-primary hover:underline">
                {company.name}
              </Link>
            )}
            {company && contact && " · "}
            {contact && (
              <Link href={`/contacts/${contact.id}`} className="hover:text-primary hover:underline">
                {fullName(contact.first_name, contact.last_name)}
              </Link>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <EditDealDialog deal={deal} companyOptions={companyOptions} contactOptions={contactOptions} action={boundUpdate} />
          <ConfirmDeleteButton onDelete={boundDelete} itemLabel="this deal" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-lg font-semibold">{formatCurrency(deal.amount, deal.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Probability</p>
            <p className="text-lg font-semibold">{deal.probability}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Close date</p>
            <p className="text-lg font-semibold">{formatDate(deal.expected_close_date)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-lg font-semibold">{deal.status}</p>
          </CardContent>
        </Card>
      </div>

      {deal.notes && (
        <Card>
          <CardContent className="whitespace-pre-wrap p-4 text-sm text-muted-foreground">{deal.notes}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Tasks</CardTitle>
            <AddTaskDialog relatedEntityType="deal" relatedEntityId={deal.id} />
          </CardHeader>
          <CardContent>
            <TaskMiniList tasks={(tasks ?? []) as Task[]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Activity timeline</CardTitle>
            <AddActivityDialog relatedEntityType="deal" relatedEntityId={deal.id} />
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={(activities ?? []) as Activity[]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

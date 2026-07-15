import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { Pagination } from "@/components/shared/list-toolbar";
import { ACTIVITY_ICONS, ACTIVITY_LABELS } from "@/lib/activity-meta";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ListChecks } from "lucide-react";
import type { ActivityType, RelatedEntityType } from "@/lib/supabase/types";

const PAGE_SIZE = 25;

async function entityLink(
  supabase: ReturnType<typeof createClient>,
  type: RelatedEntityType,
  id: string
): Promise<{ label: string; href: string } | null> {
  if (type === "contact") {
    const { data } = await supabase.from("contacts").select("first_name, last_name").eq("id", id).single();
    if (!data) return null;
    return { label: `${data.first_name} ${data.last_name ?? ""}`.trim(), href: `/contacts/${id}` };
  }
  if (type === "company") {
    const { data } = await supabase.from("companies").select("name").eq("id", id).single();
    if (!data) return null;
    return { label: data.name, href: `/companies/${id}` };
  }
  const { data } = await supabase.from("deals").select("title").eq("id", id).single();
  if (!data) return null;
  return { label: data.title, href: `/deals/${id}` };
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: { type?: string; entity?: string; page?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const page = Number(searchParams.page ?? "1");
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("activities")
    .select("*", { count: "exact" })
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.type) query = query.eq("type", searchParams.type as ActivityType);
  if (searchParams.entity) query = query.eq("related_entity_type", searchParams.entity as RelatedEntityType);

  const { data: activities, count } = await query;
  const hasMore = (count ?? 0) > to + 1;

  const withLinks = await Promise.all(
    (activities ?? []).map(async (a) => ({
      ...a,
      link: await entityLink(supabase, a.related_entity_type as RelatedEntityType, a.related_entity_id),
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Activities</h1>
        <p className="text-sm text-muted-foreground">Every call, email, meeting, and note across your CRM.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterSelect
          paramKey="type"
          placeholder="All types"
          options={[
            { value: "call", label: "Call" },
            { value: "email", label: "Email" },
            { value: "meeting", label: "Meeting" },
            { value: "note", label: "Note" },
            { value: "task", label: "Task" },
            { value: "other", label: "Other" },
          ]}
        />
        <FilterSelect
          paramKey="entity"
          placeholder="All records"
          options={[
            { value: "contact", label: "Contacts" },
            { value: "company", label: "Companies" },
            { value: "deal", label: "Deals" },
          ]}
        />
      </div>

      <Card>
        {withLinks.length === 0 ? (
          <EmptyState icon={ListChecks} title="No activity yet" description="Activity you log across contacts, companies, and deals will show up here." />
        ) : (
          <>
            <ul className="divide-y divide-border">
              {withLinks.map((a) => {
                const Icon = ACTIVITY_ICONS[a.type as ActivityType];
                return (
                  <li key={a.id} className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{a.subject}</p>
                        <Badge variant="outline">{ACTIVITY_LABELS[a.type as ActivityType]}</Badge>
                      </div>
                      {a.description && <p className="mt-0.5 text-sm text-muted-foreground">{a.description}</p>}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {a.link && (
                          <Link href={a.link.href} className="hover:text-primary hover:underline">
                            {a.link.label}
                          </Link>
                        )}
                        <span>·</span>
                        <span>{formatDateTime(a.created_at)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Pagination page={page} hasMore={hasMore} />
          </>
        )}
      </Card>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchBox } from "@/components/shared/list-toolbar";
import { DealsKanban } from "@/components/deals/deals-kanban";
import { DealsList } from "@/components/deals/deals-list";
import { Plus, LayoutGrid, List, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Deal } from "@/lib/supabase/types";

export default async function DealsPage({
  searchParams,
}: {
  searchParams: { q?: string; view?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("deals")
    .select("*, companies(name)")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  if (searchParams.q) query = query.ilike("title", `%${searchParams.q}%`);

  const { data: deals } = await query;
  const view = searchParams.view === "list" ? "list" : "kanban";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Deals</h1>
          <p className="text-sm text-muted-foreground">{deals?.length ?? 0} total</p>
        </div>
        <Button asChild size="sm">
          <Link href="/deals/new">
            <Plus className="h-4 w-4" /> New deal
          </Link>
        </Button>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <SearchBox placeholder="Search deals…" />
        <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
          <Link
            href={{ query: { ...searchParams, view: "kanban" } }}
            className={cn(
              "flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium",
              view === "kanban" ? "bg-secondary text-foreground" : "text-muted-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Pipeline
          </Link>
          <Link
            href={{ query: { ...searchParams, view: "list" } }}
            className={cn(
              "flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium",
              view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" /> List
          </Link>
        </div>
      </div>

      {!deals || deals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No deals yet"
            description="Create your first deal to start tracking your pipeline."
            action={
              <Button asChild size="sm">
                <Link href="/deals/new">
                  <Plus className="h-4 w-4" /> New deal
                </Link>
              </Button>
            }
          />
        </Card>
      ) : view === "kanban" ? (
        <DealsKanban deals={deals as Deal[]} />
      ) : (
        <Card>
          <DealsList deals={deals as (Deal & { companies?: { name: string } | null })[]} />
        </Card>
      )}
    </div>
  );
}

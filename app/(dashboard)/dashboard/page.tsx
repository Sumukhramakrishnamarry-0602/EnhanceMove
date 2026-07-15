import { createClient } from "@/lib/supabase/server";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import type { Deal, Task, Activity } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [dealsRes, tasksDueRes, overdueRes, activitiesRes] = await Promise.all([
    supabase.from("deals").select("id, stage, amount, status").eq("owner_id", user!.id),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user!.id)
      .eq("completed", false)
      .lte("due_at", in7Days.toISOString())
      .gte("due_at", now.toISOString()),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user!.id)
      .eq("completed", false)
      .lt("due_at", now.toISOString()),
    supabase
      .from("activities")
      .select("*")
      .eq("owner_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const deals = (dealsRes.data ?? []) as Pick<Deal, "id" | "stage" | "amount" | "status">[];
  const openDeals = deals.filter((d) => d.status === "Open");
  const totalOpenValue = openDeals.reduce((sum, d) => sum + Number(d.amount), 0);

  const stageOrder: Deal["stage"][] = ["Lead", "Qualified", "Demo", "Proposal", "Won", "Lost"];
  const dealsByStage = stageOrder.map((stage) => ({
    stage,
    count: deals.filter((d) => d.stage === stage).length,
    value: deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + Number(d.amount), 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening across your pipeline.</p>
        </div>
        <QuickActions />
      </div>

      <KpiCards
        openDealsCount={openDeals.length}
        openDealsValue={totalOpenValue}
        tasksDueSoon={tasksDueRes.count ?? 0}
        tasksOverdue={overdueRes.count ?? 0}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PipelineChart data={dealsByStage} />
        </div>
        <RecentActivity activities={(activitiesRes.data ?? []) as Activity[]} />
      </div>
    </div>
  );
}

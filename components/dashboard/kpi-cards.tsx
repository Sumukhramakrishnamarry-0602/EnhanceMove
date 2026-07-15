import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Briefcase, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
            tone === "warning" ? "bg-amber-50 text-amber-700" : "bg-primary-50 text-primary-700"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCards({
  openDealsCount,
  openDealsValue,
  tasksDueSoon,
  tasksOverdue,
}: {
  openDealsCount: number;
  openDealsValue: number;
  tasksDueSoon: number;
  tasksOverdue: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi icon={Briefcase} label="Open deals" value={String(openDealsCount)} />
      <Kpi icon={DollarSign} label="Open pipeline value" value={formatCurrency(openDealsValue)} />
      <Kpi icon={Clock} label="Tasks due in 7 days" value={String(tasksDueSoon)} />
      <Kpi icon={AlertTriangle} label="Overdue tasks" value={String(tasksOverdue)} tone={tasksOverdue > 0 ? "warning" : "default"} />
    </div>
  );
}

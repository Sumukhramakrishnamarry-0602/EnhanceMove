import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ACTIVITY_ICONS } from "@/lib/activity-meta";
import { formatDateTime } from "@/lib/utils";
import { ListChecks } from "lucide-react";
import type { Activity } from "@/lib/supabase/types";

export function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Your last logged calls, emails, meetings, and notes.</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState icon={ListChecks} title="No activity yet" description="Log a call or note to see it here." />
        ) : (
          <ul className="space-y-4">
            {activities.map((a) => {
              const Icon = ACTIVITY_ICONS[a.type];
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{a.subject}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(a.created_at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

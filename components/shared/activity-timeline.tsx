import { ACTIVITY_ICONS } from "@/lib/activity-meta";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import { ListChecks } from "lucide-react";
import type { Activity } from "@/lib/supabase/types";

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <EmptyState icon={ListChecks} title="No activity logged" description="Add a call, email, or note to build a timeline." />;
  }

  return (
    <ul className="space-y-5">
      {activities.map((a) => {
        const Icon = ACTIVITY_ICONS[a.type];
        return (
          <li key={a.id} className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{a.subject}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(a.created_at)}</span>
              </div>
              {a.description && <p className="mt-0.5 text-sm text-muted-foreground">{a.description}</p>}
              {(a.ai_summary || a.ai_next_action) && (
                <div className="mt-2 rounded-md border border-primary-100 bg-primary-50 px-3 py-2 text-xs text-primary-800">
                  {a.ai_summary && <p>{a.ai_summary}</p>}
                  {a.ai_next_action && <p className="mt-0.5 font-medium">Suggested: {a.ai_next_action}</p>}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

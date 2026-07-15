"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { updateNotificationPrefs } from "@/lib/actions/profile";
import { toast } from "sonner";
import type { Profile } from "@/lib/supabase/types";

export function NotificationPrefsForm({ profile }: { profile: Profile }) {
  const [, startTransition] = useTransition();

  const save = (partial: Partial<Pick<Profile, "notify_task_due" | "notify_deal_changes">>) => {
    const formData = new FormData();
    formData.set(
      "notify_task_due",
      (partial.notify_task_due ?? profile.notify_task_due) ? "on" : "off"
    );
    formData.set(
      "notify_deal_changes",
      (partial.notify_deal_changes ?? profile.notify_deal_changes) ? "on" : "off"
    );
    startTransition(async () => {
      await updateNotificationPrefs(formData);
      toast.success("Preferences saved");
    });
  };

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-3">
        <Checkbox
          defaultChecked={profile.notify_task_due}
          onCheckedChange={(checked) => save({ notify_task_due: checked === true })}
        />
        <span>
          <span className="block text-sm font-medium text-foreground">Task reminders</span>
          <span className="block text-xs text-muted-foreground">Email me when a task is due soon or overdue.</span>
        </span>
      </label>
      <label className="flex items-start gap-3">
        <Checkbox
          defaultChecked={profile.notify_deal_changes}
          onCheckedChange={(checked) => save({ notify_deal_changes: checked === true })}
        />
        <span>
          <span className="block text-sm font-medium text-foreground">Deal changes</span>
          <span className="block text-xs text-muted-foreground">Email me when a deal moves stage or closes.</span>
        </span>
      </label>
    </div>
  );
}

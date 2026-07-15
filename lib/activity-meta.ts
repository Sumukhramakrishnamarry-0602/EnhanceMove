import { Phone, Mail, Users2, StickyNote, CheckSquare, MoreHorizontal, type LucideIcon } from "lucide-react";
import type { ActivityType } from "@/lib/supabase/types";

export const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: Users2,
  note: StickyNote,
  task: CheckSquare,
  other: MoreHorizontal,
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
  task: "Task",
  other: "Other",
};

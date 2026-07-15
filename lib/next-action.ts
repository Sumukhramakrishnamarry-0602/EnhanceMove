import { daysBetween } from "@/lib/utils";
import type { Deal } from "@/lib/supabase/types";

export function nextBestActionForContact(
  lastContactedAt: string | null,
  deals: Pick<Deal, "stage" | "status">[]
): string {
  const openDeal = deals.find((d) => d.status === "Open");
  if (openDeal?.stage === "Proposal") return "Follow up on the open proposal.";
  if (!lastContactedAt) return "Log an intro call to kick things off.";

  const days = daysBetween(new Date(), new Date(lastContactedAt));
  if (days > 14) return `Reach out — no contact in ${days} days.`;
  if (!openDeal) return "Consider starting a deal with this contact.";
  return "Keep the conversation going — check in soon.";
}

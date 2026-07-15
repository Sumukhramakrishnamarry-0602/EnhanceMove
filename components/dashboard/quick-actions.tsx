import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, DollarSign, CheckSquare } from "lucide-react";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/contacts/new">
          <UserPlus className="h-4 w-4" /> New contact
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href="/deals/new">
          <DollarSign className="h-4 w-4" /> New deal
        </Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/tasks?new=1">
          <CheckSquare className="h-4 w-4" /> New task
        </Link>
      </Button>
    </div>
  );
}

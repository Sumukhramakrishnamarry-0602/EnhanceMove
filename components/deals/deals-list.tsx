import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Deal } from "@/lib/supabase/types";

export function DealsList({ deals }: { deals: (Deal & { companies?: { name: string } | null })[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Deal</TableHead>
          <TableHead className="hidden sm:table-cell">Company</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="hidden md:table-cell">Close date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((d) => (
          <TableRow key={d.id}>
            <TableCell>
              <Link href={`/deals/${d.id}`} className="font-medium text-foreground hover:text-primary">
                {d.title}
              </Link>
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">{d.companies?.name ?? "—"}</TableCell>
            <TableCell>
              <Badge variant="outline">{d.stage}</Badge>
            </TableCell>
            <TableCell className="font-medium">{formatCurrency(d.amount, d.currency)}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(d.expected_close_date)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

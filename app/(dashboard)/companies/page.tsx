import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchBox, Pagination } from "@/components/shared/list-toolbar";
import { FilterSelect } from "@/components/shared/filter-select";
import { Building2, Plus } from "lucide-react";

const PAGE_SIZE = 20;
const STATUS_VARIANT = { Active: "success", Prospect: "default", Inactive: "secondary" } as const;

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const page = Number(searchParams.page ?? "1");
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("companies")
    .select("*, contacts(count), deals(count)", { count: "exact" })
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.q) query = query.ilike("name", `%${searchParams.q}%`);
  if (searchParams.status) query = query.eq("status", searchParams.status);

  const { data: companies, count } = await query;
  const hasMore = (count ?? 0) > to + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Companies</h1>
          <p className="text-sm text-muted-foreground">{count ?? 0} total</p>
        </div>
        <Button asChild size="sm">
          <Link href="/companies/new">
            <Plus className="h-4 w-4" /> New company
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox placeholder="Search companies…" />
        <FilterSelect
          paramKey="status"
          placeholder="All statuses"
          options={[
            { value: "Prospect", label: "Prospect" },
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ]}
        />
      </div>

      <Card>
        {!companies || companies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No companies yet"
            description="Add a company to start organizing contacts and deals."
            action={
              <Button asChild size="sm">
                <Link href="/companies/new">
                  <Plus className="h-4 w-4" /> New company
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="hidden sm:table-cell">Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Contacts</TableHead>
                  <TableHead className="hidden md:table-cell">Deals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/companies/${c.id}`} className="font-medium text-foreground hover:text-primary">
                        {c.name}
                      </Link>
                      {c.website && (
                        <p className="text-xs text-muted-foreground">{c.website.replace(/^https?:\/\//, "")}</p>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{c.industry ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status as keyof typeof STATUS_VARIANT]}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {(c.contacts as { count: number }[])?.[0]?.count ?? 0}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {(c.deals as { count: number }[])?.[0]?.count ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} hasMore={hasMore} />
          </>
        )}
      </Card>
    </div>
  );
}

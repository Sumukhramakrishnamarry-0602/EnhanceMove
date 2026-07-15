import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchBox, Pagination } from "@/components/shared/list-toolbar";
import { FilterSelect } from "@/components/shared/filter-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Users } from "lucide-react";
import { fullName, initials, daysBetween } from "@/lib/utils";

const PAGE_SIZE = 20;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string; page?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const page = Number(searchParams.page ?? "1");
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("contacts")
    .select("*, companies(name)", { count: "exact" })
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.q) {
    query = query.or(
      `first_name.ilike.%${searchParams.q}%,last_name.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`
    );
  }

  if (searchParams.filter === "stale") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    query = query.or(`last_contacted_at.is.null,last_contacted_at.lt.${cutoff.toISOString()}`);
  }

  const { data: contacts, count } = await query;
  const hasMore = (count ?? 0) > to + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground">{count ?? 0} total</p>
        </div>
        <Button asChild size="sm">
          <Link href="/contacts/new">
            <UserPlus className="h-4 w-4" /> New contact
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox placeholder="Search name or email…" />
        <FilterSelect
          paramKey="filter"
          placeholder="All contacts"
          options={[{ value: "stale", label: "No recent activity" }]}
        />
      </div>

      <Card>
        {!contacts || contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Add your first contact to start tracking relationships."
            action={
              <Button asChild size="sm">
                <Link href="/contacts/new">
                  <UserPlus className="h-4 w-4" /> New contact
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Company</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => {
                  const name = fullName(c.first_name, c.last_name);
                  const stale = !c.last_contacted_at || daysBetween(new Date(), new Date(c.last_contacted_at)) > 14;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link href={`/contacts/${c.id}`} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{initials(name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground hover:text-primary">{name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {(c.companies as { name: string } | null)?.name ?? "—"}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{c.email ?? "—"}</TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">{c.phone ?? "—"}</TableCell>
                      <TableCell>
                        {stale ? (
                          <Badge variant="warning">No recent activity</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Pagination page={page} hasMore={hasMore} />
          </>
        )}
      </Card>
    </div>
  );
}

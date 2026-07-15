import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { AddActivityDialog } from "@/components/shared/add-activity-dialog";
import { EditCompanyDialog } from "@/components/companies/edit-company-dialog";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { updateCompany, deleteCompany } from "@/lib/actions/companies";
import { fullName, formatCurrency, formatDate } from "@/lib/utils";
import { Users, Briefcase, Globe } from "lucide-react";
import type { Activity, Contact, Deal, CompanyStatus } from "@/lib/supabase/types";

const STATUS_VARIANT: Record<CompanyStatus, "success" | "default" | "secondary"> = {
  Active: "success",
  Prospect: "default",
  Inactive: "secondary",
};

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: company } = await supabase.from("companies").select("*").eq("id", params.id).single();
  if (!company) notFound();

  const [{ data: contacts }, { data: deals }, { data: activities }] = await Promise.all([
    supabase.from("contacts").select("*").eq("company_id", params.id).order("first_name"),
    supabase.from("deals").select("*").eq("company_id", params.id).order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select("*")
      .eq("related_entity_type", "company")
      .eq("related_entity_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  const boundUpdate = updateCompany.bind(null, company.id);
  const boundDelete = deleteCompany.bind(null, company.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{company.name}</h1>
            <Badge variant={STATUS_VARIANT[company.status as CompanyStatus]}>{company.status}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {company.industry && <span>{company.industry}</span>}
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary hover:underline">
                <Globe className="h-3.5 w-3.5" /> {company.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <EditCompanyDialog company={company} action={boundUpdate} />
          <ConfirmDeleteButton onDelete={boundDelete} itemLabel="this company" />
        </div>
      </div>

      {company.notes && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground whitespace-pre-wrap">{company.notes}</CardContent>
        </Card>
      )}

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">Contacts ({contacts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({deals?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card>
            <CardContent className="p-4">
              {!contacts || contacts.length === 0 ? (
                <EmptyState icon={Users} title="No contacts at this company yet" />
              ) : (
                <ul className="divide-y divide-border">
                  {(contacts as Contact[]).map((c) => (
                    <li key={c.id} className="py-3">
                      <Link href={`/contacts/${c.id}`} className="flex items-center justify-between hover:text-primary">
                        <span className="font-medium">{fullName(c.first_name, c.last_name)}</span>
                        <span className="text-sm text-muted-foreground">{c.email}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <CardContent className="p-4">
              {!deals || deals.length === 0 ? (
                <EmptyState icon={Briefcase} title="No deals with this company yet" />
              ) : (
                <ul className="divide-y divide-border">
                  {(deals as Deal[]).map((d) => (
                    <li key={d.id} className="py-3">
                      <Link href={`/deals/${d.id}`} className="flex items-center justify-between hover:text-primary">
                        <div>
                          <p className="font-medium">{d.title}</p>
                          <p className="text-xs text-muted-foreground">Closes {formatDate(d.expected_close_date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(d.amount, d.currency)}</p>
                          <Badge variant="outline">{d.stage}</Badge>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Activity timeline</CardTitle>
              <AddActivityDialog relatedEntityType="company" relatedEntityId={company.id} />
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={(activities ?? []) as Activity[]} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

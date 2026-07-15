import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { AddActivityDialog } from "@/components/shared/add-activity-dialog";
import { EditContactDialog } from "@/components/contacts/edit-contact-dialog";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { updateContact, deleteContact } from "@/lib/actions/contacts";
import { fullName, initials, formatCurrency, formatDate } from "@/lib/utils";
import { nextBestActionForContact } from "@/lib/next-action";
import { Sparkles, Briefcase, Mail, Phone, Linkedin } from "lucide-react";
import type { Activity, Deal } from "@/lib/supabase/types";

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contact } = await supabase
    .from("contacts")
    .select("*, companies(id, name)")
    .eq("id", params.id)
    .single();

  if (!contact) notFound();

  const [{ data: deals }, { data: activities }, { data: companies }] = await Promise.all([
    supabase.from("deals").select("*").eq("contact_id", params.id).order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select("*")
      .eq("related_entity_type", "contact")
      .eq("related_entity_id", params.id)
      .order("created_at", { ascending: false }),
    supabase.from("companies").select("id, name").eq("owner_id", user!.id).order("name"),
  ]);

  const name = fullName(contact.first_name, contact.last_name);
  const companyOptions = (companies ?? []).map((c) => ({ value: c.id, label: c.name }));
  const boundUpdate = updateContact.bind(null, contact.id);
  const boundDelete = deleteContact.bind(null, contact.id);
  const hint = nextBestActionForContact(contact.last_contacted_at, (deals ?? []) as Deal[]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{name}</h1>
            <p className="text-sm text-muted-foreground">
              {contact.title ? `${contact.title} · ` : ""}
              {contact.companies ? (
                <Link href={`/companies/${(contact.companies as { id: string }).id}`} className="hover:text-primary hover:underline">
                  {(contact.companies as { name: string }).name}
                </Link>
              ) : (
                "No company"
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <EditContactDialog contact={contact} companyOptions={companyOptions} action={boundUpdate} />
          <ConfirmDeleteButton onDelete={boundDelete} itemLabel="this contact" />
        </div>
      </div>

      <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary-700">Next best action</p>
            <p className="text-sm text-primary-900">{hint}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Contact info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="hover:text-primary hover:underline">
                    {contact.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">No email</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{contact.phone || <span className="text-muted-foreground">No phone</span>}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                {contact.linkedin_url ? (
                  <a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="truncate hover:text-primary hover:underline">
                    View profile
                  </a>
                ) : (
                  <span className="text-muted-foreground">No LinkedIn</span>
                )}
              </div>
              {contact.notes && (
                <>
                  <Separator />
                  <p className="whitespace-pre-wrap text-muted-foreground">{contact.notes}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related deals</CardTitle>
            </CardHeader>
            <CardContent>
              {!deals || deals.length === 0 ? (
                <EmptyState icon={Briefcase} title="No deals yet" />
              ) : (
                <ul className="space-y-3">
                  {(deals as Deal[]).map((d) => (
                    <li key={d.id}>
                      <Link href={`/deals/${d.id}`} className="block rounded-md border border-border p-3 hover:border-primary-200 hover:bg-primary-50/40">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-foreground">{d.title}</span>
                          <Badge>{d.stage}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatCurrency(d.amount, d.currency)} · Closes {formatDate(d.expected_close_date)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Activity timeline</CardTitle>
              <AddActivityDialog relatedEntityType="contact" relatedEntityId={contact.id} />
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={(activities ?? []) as Activity[]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

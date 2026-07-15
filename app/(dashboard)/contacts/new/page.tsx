import { createClient } from "@/lib/supabase/server";
import { createContact } from "@/lib/actions/contacts";
import { ContactForm } from "@/components/contacts/contact-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function NewContactPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user!.id)
    .order("name");

  const companyOptions = (companies ?? []).map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">New contact</h1>
        <p className="text-sm text-muted-foreground">Add a person to your CRM.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
          <CardDescription>Required fields are marked with an asterisk.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm action={createContact} companyOptions={companyOptions} />
        </CardContent>
      </Card>
    </div>
  );
}

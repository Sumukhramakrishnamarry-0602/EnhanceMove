import { createClient } from "@/lib/supabase/server";
import { createDeal } from "@/lib/actions/deals";
import { DealForm } from "@/components/deals/deal-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { fullName } from "@/lib/utils";

export default async function NewDealPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: companies }, { data: contacts }] = await Promise.all([
    supabase.from("companies").select("id, name").eq("owner_id", user!.id).order("name"),
    supabase.from("contacts").select("id, first_name, last_name").eq("owner_id", user!.id).order("first_name"),
  ]);

  const companyOptions = (companies ?? []).map((c) => ({ value: c.id, label: c.name }));
  const contactOptions = (contacts ?? []).map((c) => ({ value: c.id, label: fullName(c.first_name, c.last_name) }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">New deal</h1>
        <p className="text-sm text-muted-foreground">
          A &quot;Intro call&quot; activity will be created automatically for this deal.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Deal details</CardTitle>
          <CardDescription>Required fields are marked with an asterisk.</CardDescription>
        </CardHeader>
        <CardContent>
          <DealForm action={createDeal} companyOptions={companyOptions} contactOptions={contactOptions} />
        </CardContent>
      </Card>
    </div>
  );
}

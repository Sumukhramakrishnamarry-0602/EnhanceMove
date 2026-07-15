import { createCompany } from "@/lib/actions/companies";
import { CompanyForm } from "@/components/companies/company-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">New company</h1>
        <p className="text-sm text-muted-foreground">Add a company to your CRM.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Company details</CardTitle>
          <CardDescription>Required fields are marked with an asterisk.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm action={createCompany} />
        </CardContent>
      </Card>
    </div>
  );
}

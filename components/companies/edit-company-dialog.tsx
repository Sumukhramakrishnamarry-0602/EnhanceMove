"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CompanyForm } from "@/components/companies/company-form";
import { Pencil } from "lucide-react";
import type { ActionState } from "@/lib/actions/auth";
import type { Company } from "@/lib/supabase/types";

export function EditCompanyDialog({
  company,
  action,
}: {
  company: Company;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit company</DialogTitle>
          <DialogDescription>Update this company&apos;s details.</DialogDescription>
        </DialogHeader>
        <CompanyForm
          action={async (state, formData) => {
            const result = await action(state, formData);
            if (!result?.error && !result?.fieldErrors) setOpen(false);
            return result;
          }}
          company={company}
          onCancel={() => setOpen(false)}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
}

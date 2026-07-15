"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DealForm } from "@/components/deals/deal-form";
import { Pencil } from "lucide-react";
import type { ActionState } from "@/lib/actions/auth";
import type { Deal } from "@/lib/supabase/types";
import type { ComboboxOption } from "@/components/ui/combobox";

export function EditDealDialog({
  deal,
  companyOptions,
  contactOptions,
  action,
}: {
  deal: Deal;
  companyOptions: ComboboxOption[];
  contactOptions: ComboboxOption[];
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit deal</DialogTitle>
          <DialogDescription>Update this deal&apos;s details.</DialogDescription>
        </DialogHeader>
        <DealForm
          action={async (state, formData) => {
            const result = await action(state, formData);
            if (!result?.error && !result?.fieldErrors) setOpen(false);
            return result;
          }}
          deal={deal}
          companyOptions={companyOptions}
          contactOptions={contactOptions}
          onCancel={() => setOpen(false)}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
}

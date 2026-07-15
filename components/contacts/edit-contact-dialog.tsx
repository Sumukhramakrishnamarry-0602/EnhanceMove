"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contacts/contact-form";
import { Pencil } from "lucide-react";
import type { ActionState } from "@/lib/actions/auth";
import type { Contact } from "@/lib/supabase/types";
import type { ComboboxOption } from "@/components/ui/combobox";

export function EditContactDialog({
  contact,
  companyOptions,
  action,
}: {
  contact: Contact;
  companyOptions: ComboboxOption[];
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
          <DialogTitle>Edit contact</DialogTitle>
          <DialogDescription>Update this person&apos;s details.</DialogDescription>
        </DialogHeader>
        <ContactForm
          action={async (state, formData) => {
            const result = await action(state, formData);
            if (!result?.error && !result?.fieldErrors) setOpen(false);
            return result;
          }}
          contact={contact}
          companyOptions={companyOptions}
          onCancel={() => setOpen(false)}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
}

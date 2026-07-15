"use client";

import { useFormState } from "react-dom";
import { uploadAvatarAction } from "@/lib/actions/profile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { useRef } from "react";
import { Camera } from "lucide-react";

export function AvatarUploader({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  const [state, formAction] = useFormState(uploadAvatarAction, {});
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
      </Avatar>
      <div>
        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept="image/*"
          className="hidden"
          onChange={() => formRef.current?.requestSubmit()}
        />
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <Camera className="h-4 w-4" /> Change photo
        </Button>
        {state.error && <p className="mt-1 text-xs text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}

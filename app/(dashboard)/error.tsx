"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t load this page. Try again, and if the problem continues, refresh the app.
      </p>
      <Button onClick={reset} size="sm">
        Try again
      </Button>
    </div>
  );
}

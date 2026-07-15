"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBox({ placeholder = "Search…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  );
}

export function Pagination({ page, hasMore }: { page: number; hasMore: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const go = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (page === 1 && !hasMore) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-1 py-3">
      <button
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-xs text-muted-foreground">Page {page}</span>
      <button
        disabled={!hasMore}
        onClick={() => go(page + 1)}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

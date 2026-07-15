"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  emptyText = "No results found.",
  disabled,
}: {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-subtle focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className={cn("truncate text-left", !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1 scrollbar-thin">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-secondary"
            >
              Clear selection
            </button>
          )}
          {filtered.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">{emptyText}</p>
          )}
          {filtered.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-secondary"
            >
              <span className="min-w-0">
                <span className="block truncate">{option.label}</span>
                {option.sublabel && (
                  <span className="block truncate text-xs text-muted-foreground">{option.sublabel}</span>
                )}
              </span>
              {value === option.value && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

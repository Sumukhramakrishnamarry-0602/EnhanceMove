"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateDealStage } from "@/lib/actions/deals";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Deal, DealStage } from "@/lib/supabase/types";

const STAGES: DealStage[] = ["Lead", "Qualified", "Demo", "Proposal", "Won", "Lost"];

const STAGE_ACCENT: Record<DealStage, string> = {
  Lead: "bg-slate-400",
  Qualified: "bg-sky-400",
  Demo: "bg-violet-400",
  Proposal: "bg-amber-400",
  Won: "bg-emerald-500",
  Lost: "bg-red-400",
};

export function DealsKanban({ deals }: { deals: Deal[] }) {
  const [items, setItems] = useState(deals);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);
  const [, startTransition] = useTransition();

  const moveDeal = (dealId: string, stage: DealStage) => {
    setItems((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage } : d)));
    startTransition(() => {
      updateDealStage(dealId, stage);
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-2 sm:grid-cols-2 lg:grid-cols-6 lg:gap-3">
      {STAGES.map((stage) => {
        const stageDeals = items.filter((d) => d.stage === stage);
        const total = stageDeals.reduce((sum, d) => sum + Number(d.amount), 0);
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStage(stage);
            }}
            onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              const dealId = e.dataTransfer.getData("text/deal-id");
              if (dealId) moveDeal(dealId, stage);
              setDragOverStage(null);
            }}
            className={cn(
              "flex min-h-[16rem] flex-col rounded-lg border border-border bg-secondary/40 p-2 transition-colors",
              dragOverStage === stage && "border-primary-300 bg-primary-50/60"
            )}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", STAGE_ACCENT[stage])} />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stage}</span>
              </div>
              <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
            </div>
            <p className="mb-2 px-1 text-xs text-muted-foreground">{formatCurrency(total)}</p>

            <div className="flex-1 space-y-2">
              {stageDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/deal-id", deal.id)}
                  className="block cursor-grab rounded-md border border-border bg-background p-3 shadow-subtle transition-shadow hover:shadow-card active:cursor-grabbing"
                >
                  <p className="truncate text-sm font-medium text-foreground">{deal.title}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(deal.amount, deal.currency)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Closes {formatDate(deal.expected_close_date)}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

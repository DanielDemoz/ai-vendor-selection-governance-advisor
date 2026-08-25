"use client";

import type { TradeOffSummary } from "@/engine/explainability";
import { Card } from "@/components/ui/primitives";

export function TradeOffsPanel({ tradeOffs }: { tradeOffs: TradeOffSummary }) {
  return (
    <Card className="mb-8 print:break-inside-avoid">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Trade-offs</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-medium text-emerald-900">Why the top option won</h3>
          <p className="mt-2 text-sm text-emerald-800">{tradeOffs.whyWinnerWon}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-medium text-slate-900">What you give up</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
            {tradeOffs.whatYouGiveUp.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

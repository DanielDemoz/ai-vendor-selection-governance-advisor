"use client";

import type { NoClearWinnerOption } from "@/engine/explainability";
import { Card } from "@/components/ui/primitives";

export function NoClearWinnerCompare({
  options,
  explanation,
}: {
  options: NoClearWinnerOption[];
  explanation?: string;
}) {
  if (options.length < 2) return null;

  return (
    <Card className="mb-8 border-teal-200 bg-teal-50/50">
      <h2 className="text-lg font-semibold text-teal-900">Two strong options</h2>
      {explanation && <p className="mt-2 text-sm text-teal-800">{explanation}</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {options.map((opt, i) => (
          <div key={opt.productId} className="rounded-lg border border-teal-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
              Option {String.fromCharCode(65 + i)}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{opt.productName}</h3>
            <p className="mt-1 text-sm text-slate-600">Fit: {opt.fitDisplay}</p>
            <p className="mt-3 text-sm font-medium text-slate-800">{opt.strengthLabel}</p>
            <ul className="mt-2 space-y-1">
              {opt.topPriorities.map((p) => (
                <li key={p.label} className="flex justify-between text-sm text-slate-600">
                  <span>{p.label}</span>
                  <span className="font-medium">{p.level}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

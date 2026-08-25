"use client";

import type { GovernanceSummary } from "@/engine/explainability";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  met: "bg-emerald-50 text-emerald-800 border-emerald-200",
  caution: "bg-amber-50 text-amber-800 border-amber-200",
  gap: "bg-red-50 text-red-800 border-red-200",
  unknown: "bg-slate-50 text-slate-700 border-slate-200",
};

const CONFIDENCE_LABELS = {
  high: "High confidence",
  moderate: "Moderate confidence",
  low: "Low confidence",
  insufficient: "Insufficient evidence",
};

export function GovernanceSummaryPanel({ summary }: { summary: GovernanceSummary }) {
  return (
    <Card className="mb-8">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Governance assessment</h2>
          <p className="mt-1 text-sm text-slate-600">{summary.headline}</p>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            summary.overallConfidence === "high" && "border-emerald-200 bg-emerald-50 text-emerald-800",
            summary.overallConfidence === "moderate" && "border-amber-200 bg-amber-50 text-amber-800",
            summary.overallConfidence === "low" && "border-orange-200 bg-orange-50 text-orange-800",
            summary.overallConfidence === "insufficient" && "border-red-200 bg-red-50 text-red-800",
          )}
        >
          {CONFIDENCE_LABELS[summary.overallConfidence]}
        </span>
      </div>

      {summary.checks.length > 0 && (
        <ul className="space-y-3">
          {summary.checks.map((check) => (
            <li
              key={check.label}
              className={cn("rounded-lg border px-4 py-3 text-sm", STATUS_STYLES[check.status])}
            >
              <p className="font-medium">{check.label}</p>
              <p className="mt-1 opacity-90">{check.detail}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-slate-500">{summary.evidenceNote}</p>
    </Card>
  );
}

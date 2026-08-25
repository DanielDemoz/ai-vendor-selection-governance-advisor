"use client";

import type { AssessmentResult } from "@/engine/scorer";
import { formatScoreLevel } from "@/engine/scoring-rubric";
import { Card } from "@/components/ui/primitives";
import { PRIORITY_OPTIONS } from "@/lib/constants";
import { useState } from "react";

export function ExplainabilityPanel({ result }: { result: AssessmentResult }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCalculation, setShowCalculation] = useState(false);
  const weights = [...result.priorityWeights.entries()];
  const selected = result.topThree[selectedIndex];

  if (result.topThree.length === 0) return null;

  return (
    <Card className="mb-8 print:break-inside-avoid">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Why was this recommended?</h2>
      <p className="mb-4 text-sm text-slate-600">
        Transparent breakdown based on your priorities and verified product information.
      </p>

      {result.topThree.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {result.topThree.map((r, i) => (
            <button
              key={r.product.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                selectedIndex === i
                  ? "border-teal-600 bg-teal-50 text-teal-900"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {r.product.product}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">Your priorities</h3>
          <div className="space-y-2">
            {weights.map(([priority, weight]) => (
              <div key={priority}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{PRIORITY_OPTIONS.find((p) => p.id === priority)?.label ?? priority}</span>
                  <span className="font-medium">{Math.round(weight * 100)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-teal-600"
                    style={{ width: `${Math.round(weight * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
              {selected.product.product}
            </h3>
            <div className="space-y-2">
              {selected.dimensionBreakdown.map((d) => (
                <div key={d.priority} className="flex justify-between text-sm">
                  <span>{PRIORITY_OPTIONS.find((p) => p.id === d.priority)?.label ?? d.priority}</span>
                  <span className="font-medium">{formatScoreLevel(d.level)}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Governance confidence: {selected.governance.confidence}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowCalculation(!showCalculation)}
        className="mt-4 text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        {showCalculation ? "Hide" : "View"} how we calculated this
      </button>

      {showCalculation && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-3 text-sm font-medium text-slate-900">Calculation methodology</h4>
          <ol className="space-y-2">
            {result.explainability.calculationSteps.map((step, i) => (
              <li key={step.label} className="text-sm text-slate-700">
                <span className="font-medium text-slate-900">{i + 1}. {step.label}:</span> {step.value}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-slate-500">
            Missing evidence (unknown) is excluded from the weighted average — never treated as proof of safety or risk.
          </p>
        </div>
      )}
    </Card>
  );
}

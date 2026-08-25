"use client";

import { Card } from "@/components/ui/primitives";

export function NextStepsPanel({ steps }: { steps: string[] }) {
  if (steps.length === 0) return null;

  return (
    <Card className="mb-8 print:break-inside-avoid">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Next steps</h2>
      <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </Card>
  );
}

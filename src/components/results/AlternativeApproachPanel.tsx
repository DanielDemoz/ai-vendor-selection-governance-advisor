"use client";

import { Card } from "@/components/ui/primitives";

const CUSTOM_WHEN = [
  "Highly specialized workflow or unique business process",
  "Strong customization requirements commercial tools cannot meet",
  "Sensitive data requirements with available technical capability",
  "Integration needs that off-the-shelf products cannot satisfy",
  "Sufficient expected ROI to justify build investment",
];

export function AlternativeApproachPanel({
  type,
  reason,
}: {
  type: string;
  reason: string;
}) {
  const titles: Record<string, string> = {
    custom: "Consider a Custom / In-House Solution",
    hybrid: "Consider a Hybrid Approach",
    open_source: "Consider Open-Source / Self-Hosted",
    ai_not_appropriate: "AI May Not Be the Best Next Step",
  };

  return (
    <Card className="mb-8 border-slate-300">
      <h2 className="text-lg font-semibold text-slate-900">{titles[type] ?? "Alternative approach"}</h2>
      <p className="mt-2 text-sm text-slate-700">{reason}</p>

      {type === "custom" && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-800">This may be appropriate when:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
            {CUSTOM_WHEN.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            We recommend custom development conservatively, simple use cases with no technical staff
            should start with commercial tools or free tiers.
          </p>
        </div>
      )}

      {type === "hybrid" && (
        <p className="mt-3 text-sm text-slate-600">
          Your use cases span multiple categories, a single product may not cover everything.
          Consider pairing a general assistant with a specialized tool for automation, coding, or customer service.
        </p>
      )}
    </Card>
  );
}

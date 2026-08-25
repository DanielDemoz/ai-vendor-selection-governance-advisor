"use client";

import type { Product } from "@/lib/schemas";
import { getEvidenceLabel } from "@/engine/explainability";
import { cn } from "@/lib/utils";

export function EvidenceSources({ product }: { product: Product }) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer font-medium text-teal-700">View sources</summary>
      <div className="mt-3 space-y-3">
        <p className="text-xs text-slate-500">
          Last verified: {product.last_verified}
          {product.residency_evidence_level === "inferred" && (
            <span className="ml-2 text-amber-700">· Geographic info inferred</span>
          )}
          {product.residency_evidence_level === "unknown" && (
            <span className="ml-2 text-amber-700">· Residency evidence unavailable</span>
          )}
        </p>
        <ul className="space-y-2">
          {product.sources.map((s) => {
            const badge = getEvidenceLabel(s.type);
            return (
              <li key={s.url} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded border px-2 py-0.5 text-xs font-medium", badge.className)}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-slate-500">Verified {s.verified}</span>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-teal-700 underline"
                >
                  {s.topic}
                </a>
              </li>
            );
          })}
        </ul>
        {product.sources.length === 0 && (
          <p className="text-xs text-amber-700">Information not available from verified sources.</p>
        )}
      </div>
    </details>
  );
}

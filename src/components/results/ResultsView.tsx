"use client";

import { useState } from "react";
import type { ProductRanking, AssessmentResult } from "@/engine/scorer";
import { formatScoreLevel } from "@/engine/scoring-rubric";
import { Card } from "@/components/ui/primitives";
import { EvidenceSources } from "@/components/results/EvidenceSources";
import { GovernanceSummaryPanel } from "@/components/results/GovernanceSummaryPanel";
import { ExplainabilityPanel } from "@/components/results/ExplainabilityPanel";
import { TradeOffsPanel } from "@/components/results/TradeOffsPanel";
import { NoClearWinnerCompare } from "@/components/results/NoClearWinnerCompare";
import { AlternativeApproachPanel } from "@/components/results/AlternativeApproachPanel";
import { NextStepsPanel } from "@/components/results/NextStepsPanel";
import { ResultsActions } from "@/components/results/ResultsActions";
import type { UserProfile } from "@/lib/schemas";

const MEDALS = ["🥇", "🥈", "🥉"];
const LABELS = ["Best Fit", "Alternative", "Alternative"];

function ProductCard({ ranking, index }: { ranking: ProductRanking; index: number }) {
  const { product } = ranking;

  return (
    <Card className="mb-6 print:break-inside-avoid">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">
            {MEDALS[index] ?? "•"} {LABELS[index] ?? "Option"}
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-900">{product.product}</h3>
          <p className="text-sm text-slate-500">
            {product.vendor} · {product.category.replace(/_/g, " ")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-slate-900">Fit: {ranking.fitDisplay}</p>
          <p className="text-sm text-slate-600">{ranking.fitLabel}</p>
        </div>
      </div>

      {ranking.filterStatus === "requirement_not_met" && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {ranking.filterReason}
        </div>
      )}

      {ranking.governance.blocked && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Governance information insufficient for a confident recommendation.
        </div>
      )}

      {ranking.staleData && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ Product information last verified more than 90 days ago.
        </div>
      )}

      <blockquote className="mb-4 border-l-4 border-teal-500 pl-4 text-slate-700 italic">
        {index === 0 ? "Best match for your stated priorities." : "A strong alternative with different trade-offs."}
      </blockquote>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 font-medium text-slate-900">Why it matches</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
            {ranking.whyMatches.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-medium text-slate-900">Pros</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
            {product.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 font-medium text-slate-900">Cons</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
            {product.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
        {ranking.tradeOffs.length > 0 && (
          <div>
            <h4 className="mb-2 font-medium text-slate-900">Key trade-off</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
              {ranking.tradeOffs.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {ranking.governance.warnings.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 font-medium text-slate-900">Important considerations</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-amber-900">
            {ranking.governance.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <EvidenceSources product={product} />
      </div>
    </Card>
  );
}

function ComparisonTable({ rankings }: { rankings: ProductRanking[] }) {
  const cols = rankings.slice(0, 3);
  if (cols.length < 2) return null;

  const rows = [
    { label: "Price", key: "price" as const },
    { label: "Privacy", key: "privacy" as const },
    { label: "Integration", key: "integration" as const },
    { label: "Ease of use", key: "ease_of_use" as const },
    { label: "Governance info", key: "data_controls" as const },
  ];

  return (
    <Card className="mb-8 overflow-x-auto print:break-inside-avoid">
      <h3 className="mb-4 text-lg font-semibold">Compare options</h3>
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-2 text-left font-medium text-slate-600">Criterion</th>
            {cols.map((c) => (
              <th key={c.product.id} className="px-3 py-2 text-left font-medium text-slate-900">
                {c.product.product}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-slate-100">
              <td className="py-2 text-slate-600">{row.label}</td>
              {cols.map((c) => (
                <td key={c.product.id} className="px-3 py-2">
                  {formatScoreLevel(c.product.scores[row.key])}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="py-2 text-slate-600">Pricing band</td>
            {cols.map((c) => (
              <td key={c.product.id} className="px-3 py-2">{c.product.pricing_band}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

export function ResultsView({
  result,
  profile,
}: {
  result: AssessmentResult;
  profile: UserProfile;
}) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="results-page">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Your AI Options</h1>
      <p className="mb-6 text-slate-600">
        Based on your priorities, budget, and governance requirements.
      </p>

      <ResultsActions profile={profile} result={result} />

      <GovernanceSummaryPanel summary={result.explainability.governanceSummary} />

      {result.noClearWinner && (
        <NoClearWinnerCompare
          options={result.explainability.noClearWinnerOptions}
          explanation={result.noClearWinnerExplanation}
        />
      )}

      {result.alternativeApproach && (
        <AlternativeApproachPanel
          type={result.alternativeApproach.type}
          reason={result.alternativeApproach.reason}
        />
      )}

      {result.topThree.length === 0 && (
        <Card className="mb-8">
          <p className="font-medium text-slate-900">
            We don&apos;t have enough evidence to confidently recommend options for your requirements.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Try adjusting hard requirements or explore alternative approaches below.
          </p>
        </Card>
      )}

      {result.topThree.length > 0 && <ExplainabilityPanel result={result} />}

      {result.explainability.tradeOffs && (
        <TradeOffsPanel tradeOffs={result.explainability.tradeOffs} />
      )}

      {result.topThree.map((r, i) => (
        <ProductCard key={r.product.id} ranking={r} index={i} />
      ))}

      <ComparisonTable rankings={result.topThree} />

      {result.allSuitable.length > 3 && (
        <div className="mb-8 text-center no-print">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            {showAll ? "Show fewer options" : `Compare all ${result.allSuitable.length} suitable options`}
          </button>
          {showAll && (
            <div className="mt-4">
              <ComparisonTable rankings={result.allSuitable} />
            </div>
          )}
        </div>
      )}

      <NextStepsPanel steps={result.explainability.nextSteps} />

      {result.brukdCta.show && (
        <Card className="mb-8 border-slate-300 bg-slate-50 print:break-inside-avoid">
          <h3 className="text-lg font-semibold text-slate-900">Need a More Customized Assessment?</h3>
          <p className="mt-2 text-sm text-slate-700">
            If your requirements go beyond choosing an off-the-shelf AI tool, BRUKD Consultancy can help assess
            your options and determine whether a commercial, open-source, hybrid, or custom AI approach makes sense.
          </p>
          <a
            href="https://brukdconsultancy.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Talk to BRUKD Consultancy
          </a>
        </Card>
      )}

      <p className="text-xs text-slate-500">
        Recommendations are based on the information provided and product information available at the time of
        assessment. Product features, pricing, policies, and terms can change. Results are decision-support
        information and should not be treated as legal, privacy, security, or financial advice.
      </p>
    </div>
  );
}

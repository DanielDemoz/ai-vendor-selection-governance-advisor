import type { Priority, Product, UserProfile } from "@/lib/schemas";
import type { ProductRanking } from "@/engine/scorer";
import { formatScoreLevel } from "@/engine/scoring-rubric";
import { PRIORITY_OPTIONS } from "@/lib/constants";

export type GovernanceSummary = {
  overallConfidence: "high" | "moderate" | "low" | "insufficient";
  headline: string;
  checks: {
    label: string;
    status: "met" | "caution" | "gap" | "unknown";
    detail: string;
  }[];
  evidenceNote: string;
};

export type NoClearWinnerOption = {
  productName: string;
  productId: string;
  fitDisplay: string;
  strengthLabel: string;
  topPriorities: { label: string; level: string }[];
};

export type TradeOffSummary = {
  whyWinnerWon: string;
  whatYouGiveUp: string[];
};

export type CalculationStep = {
  label: string;
  value: string;
};

export type Explainability = {
  governanceSummary: GovernanceSummary;
  tradeOffs: TradeOffSummary | null;
  noClearWinnerOptions: NoClearWinnerOption[];
  calculationSteps: CalculationStep[];
  nextSteps: string[];
};

function priorityLabel(p: Priority): string {
  return PRIORITY_OPTIONS.find((o) => o.id === p)?.label ?? p.replace(/_/g, " ");
}

export function buildGovernanceSummary(
  profile: UserProfile,
  topThree: ProductRanking[],
): GovernanceSummary {
  const checks: GovernanceSummary["checks"] = [];
  const highPrivacy =
    profile.privacyImportance === "very_high" ||
    profile.privacyImportance === "critical";

  const sensitiveTypes = profile.dataTypes.filter((d) =>
    ["customer_information", "employee_information", "financial_information",
      "personal_information", "sensitive_information", "confidential_proprietary"].includes(d),
  );

  if (sensitiveTypes.length > 0) {
    const confidentProducts = topThree.filter(
      (r) => r.governance.confidence === "high" && !r.governance.blocked,
    );
    checks.push({
      label: "Sensitive data handling",
      status: confidentProducts.length > 0 ? "met" : highPrivacy ? "gap" : "caution",
      detail:
        confidentProducts.length > 0
          ? `${confidentProducts.length} top option(s) have documented governance for sensitive data.`
          : "No top recommendation has high-confidence governance documentation for your data types.",
    });
  }

  if (profile.trainingExclusion === "required" || profile.trainingExclusion === "prefer") {
    const verified = topThree.filter((r) => r.product.training_opt_out !== "unknown");
    checks.push({
      label: "Training exclusion",
      status: verified.length === topThree.length && topThree.length > 0 ? "met" : "unknown",
      detail:
        verified.length > 0
          ? "Training/opt-out policies verified from official sources where available."
          : "Training exclusion policy could not be verified for all options.",
    });
  }

  if (profile.dataProcessingPreference === "canada_required") {
    const canadaOk = topThree.filter((r) => r.product.canada_supported === "yes");
    checks.push({
      label: "Canada data processing",
      status: canadaOk.length > 0 ? "met" : "gap",
      detail:
        canadaOk.length > 0
          ? "At least one option documents Canada data processing."
          : "No top option meets Canada-required processing based on available evidence.",
    });
  } else if (profile.dataProcessingPreference === "canada_preferred") {
    checks.push({
      label: "Canada preference",
      status: "caution",
      detail: "Canada preferred, verify residency with vendor before adoption.",
    });
  }

  const blockedCount = topThree.filter((r) => r.governance.blocked).length;
  if (blockedCount > 0) {
    checks.push({
      label: "Governance confidence",
      status: "gap",
      detail: `${blockedCount} option(s) lack sufficient governance evidence for a confident recommendation.`,
    });
  }

  const staleCount = topThree.filter((r) => r.staleData).length;
  if (staleCount > 0) {
    checks.push({
      label: "Information freshness",
      status: "caution",
      detail: `${staleCount} product record(s) were last verified more than 90 days ago.`,
    });
  }

  let overallConfidence: GovernanceSummary["overallConfidence"] = "high";
  if (checks.some((c) => c.status === "gap")) overallConfidence = "insufficient";
  else if (checks.filter((c) => c.status === "unknown" || c.status === "caution").length >= 2) {
    overallConfidence = "low";
  } else if (checks.some((c) => c.status === "caution" || c.status === "unknown")) {
    overallConfidence = "moderate";
  }

  const headline =
    overallConfidence === "high"
      ? "Governance documentation appears adequate for your stated requirements."
      : overallConfidence === "moderate"
        ? "Some governance areas need verification before adoption."
        : overallConfidence === "low"
          ? "Several governance gaps, independent verification recommended."
          : "Governance information insufficient for fully confident recommendations.";

  return {
    overallConfidence,
    headline,
    checks,
    evidenceNote:
      "Information labeled vendor-stated comes from official documentation. Independent assessment reflects our structured evaluation. Unknown means insufficient evidence, not treated as proof of safety or risk.",
  };
}

export function buildTradeOffSummary(
  topThree: ProductRanking[],
): TradeOffSummary | null {
  if (topThree.length < 2) return null;

  const winner = topThree[0];
  const runnerUp = topThree[1];

  const winnerStrengths = winner.dimensionBreakdown
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3)
    .map((d) => priorityLabel(d.priority).toLowerCase());

  const whyWinnerWon =
    winnerStrengths.length > 0
      ? `Strong ${winnerStrengths.join(" + ")} fit based on your weighted priorities.`
      : "Best overall weighted match for your profile.";

  const giveUp: string[] = [];

  for (const other of topThree.slice(1, 3)) {
    for (const dim of other.dimensionBreakdown.sort((a, b) => b.contribution - a.contribution).slice(0, 1)) {
      const winnerDim = winner.dimensionBreakdown.find((d) => d.priority === dim.priority);
      if (winnerDim && dim.contribution > winnerDim.contribution) {
        giveUp.push(
          `${other.product.product} has stronger ${priorityLabel(dim.priority).toLowerCase()} features`,
        );
      }
    }
    if (other.product.scores.price !== "unknown" && winner.product.scores.price !== "unknown") {
      const priceOrder = { limited: 1, moderate: 2, strong: 3, excellent: 4, unknown: 0 };
      const oPrice = priceOrder[other.product.scores.price as keyof typeof priceOrder] ?? 0;
      const wPrice = priceOrder[winner.product.scores.price as keyof typeof priceOrder] ?? 0;
      if (oPrice > wPrice) {
        giveUp.push(`${other.product.product} has a lower price point`);
      }
    }
  }

  if (giveUp.length === 0 && runnerUp) {
    giveUp.push(`${runnerUp.product.product} may suit teams prioritizing different trade-offs`);
  }

  return { whyWinnerWon, whatYouGiveUp: [...new Set(giveUp)].slice(0, 3) };
}

export function buildNoClearWinnerOptions(
  topThree: ProductRanking[],
): NoClearWinnerOption[] {
  return topThree.slice(0, 2).map((r, i) => {
    const topDims = r.dimensionBreakdown
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3);

    const strengthLabel =
      i === 0
        ? `Best for ${topDims.map((d) => priorityLabel(d.priority).toLowerCase()).join(" and ")}`
        : `Best for ${topDims[0] ? priorityLabel(topDims[0].priority).toLowerCase() : "alternative priorities"}`;

    return {
      productName: r.product.product,
      productId: r.product.id,
      fitDisplay: r.fitDisplay,
      strengthLabel,
      topPriorities: topDims.map((d) => ({
        label: priorityLabel(d.priority),
        level: formatScoreLevel(d.level),
      })),
    };
  });
}

export function buildCalculationSteps(
  profile: UserProfile,
  weights: Map<Priority, number>,
): CalculationStep[] {
  const steps: CalculationStep[] = [
    { label: "Input", value: `${profile.useCases.length} use case(s), ${profile.priorities.length} weighted priorities` },
    { label: "Hard filters", value: "Canada required, training exclusion, approach openness" },
    { label: "Weighting", value: profile.priorities.map((p) => `${priorityLabel(p)} ${Math.round((weights.get(p) ?? 0) * 100)}%`).join(", ") },
    { label: "Scoring rubric", value: "Ordinal levels (limited → excellent); unknown excluded" },
    { label: "Governance gate", value: "Applied before final ranking for sensitive data + high privacy" },
    { label: "Output", value: "Deterministic weighted match, same inputs always produce same ranking" },
  ];
  return steps;
}

export function buildNextSteps(
  result: {
    outcomeType: string;
    alternativeApproach: { type: string; reason: string } | null;
    topThree: ProductRanking[];
    noClearWinner: boolean;
  },
): string[] {
  const steps: string[] = [];

  if (result.outcomeType === "ai_not_appropriate") {
    steps.push("Clarify the specific business problem before evaluating AI tools.");
    steps.push("Document expected outcomes and success metrics.");
    return steps;
  }

  if (result.alternativeApproach?.type === "custom") {
    steps.push("Document your specialized workflow requirements.");
    steps.push("Estimate build vs. buy costs including maintenance.");
    steps.push("Run a small proof-of-concept before full commitment.");
  }

  if (result.topThree[0]) {
    steps.push(`Start a free trial or pilot with ${result.topThree[0].product.product} if available.`);
    steps.push("Verify current pricing and data policies on the vendor's official site.");
  }

  if (result.noClearWinner) {
    steps.push("Discuss the trade-offs with stakeholders to decide which priority matters most.");
  }

  steps.push("Review vendor security and privacy documentation before uploading sensitive data.");
  steps.push("Re-run this assessment if your requirements or budget change.");

  return [...new Set(steps)].slice(0, 6);
}

export function getEvidenceLabel(
  sourceType: "official" | "independent" | "community",
): { label: string; className: string } {
  switch (sourceType) {
    case "official":
      return { label: "Vendor-stated", className: "bg-blue-50 text-blue-800 border-blue-200" };
    case "independent":
      return { label: "Independent assessment", className: "bg-teal-50 text-teal-800 border-teal-200" };
    case "community":
      return { label: "Community source", className: "bg-slate-50 text-slate-700 border-slate-200" };
  }
}

export function buildExplainability(
  profile: UserProfile,
  weights: Map<Priority, number>,
  result: {
    topThree: ProductRanking[];
    noClearWinner: boolean;
    outcomeType: string;
    alternativeApproach: { type: string; reason: string } | null;
  },
): Explainability {
  return {
    governanceSummary: buildGovernanceSummary(profile, result.topThree),
    tradeOffs: result.topThree.length >= 2 ? buildTradeOffSummary(result.topThree) : null,
    noClearWinnerOptions: result.noClearWinner ? buildNoClearWinnerOptions(result.topThree) : [],
    calculationSteps: buildCalculationSteps(profile, weights),
    nextSteps: buildNextSteps(result),
  };
}

export function formatResultsAsText(
  result: {
    topThree: ProductRanking[];
    explainability: Explainability;
    noClearWinner: boolean;
    noClearWinnerExplanation?: string;
    alternativeApproach: { type: string; reason: string } | null;
  },
): string {
  const lines: string[] = [
    "AI Vendor Selection & Governance Advisor, Results",
    "================================================",
    "",
    result.explainability.governanceSummary.headline,
    "",
  ];

  if (result.noClearWinner && result.noClearWinnerExplanation) {
    lines.push("NO CLEAR WINNER", result.noClearWinnerExplanation, "");
  }

  if (result.alternativeApproach) {
    lines.push("ALTERNATIVE APPROACH", result.alternativeApproach.reason, "");
  }

  result.topThree.forEach((r, i) => {
    lines.push(`${i + 1}. ${r.product.product} (${r.product.vendor})`);
    lines.push(`   Fit: ${r.fitDisplay}, ${r.fitLabel}`);
    lines.push(`   Pros: ${r.product.strengths.join("; ")}`);
    lines.push(`   Cons: ${r.product.limitations.join("; ")}`);
    lines.push("");
  });

  if (result.explainability.tradeOffs) {
    lines.push("WHY THE TOP OPTION WON", result.explainability.tradeOffs.whyWinnerWon);
    lines.push("WHAT YOU GIVE UP", ...result.explainability.tradeOffs.whatYouGiveUp.map((g) => `- ${g}`));
    lines.push("");
  }

  lines.push("NEXT STEPS", ...result.explainability.nextSteps.map((s) => `- ${s}`));
  lines.push("", "Disclaimer: Decision-support only, not legal, privacy, security, or financial advice.");

  return lines.join("\n");
}

import type { Priority, Product, ScoreLevel, UserProfile } from "@/lib/schemas";
import { evaluateBrukdCta } from "@/engine/brukd-cta";
import {
  evaluateAlternativeApproach,
  shouldRecommendCustom,
} from "@/engine/custom-recommendation";
import { applyHardFilters, budgetCompatibility } from "@/engine/filters";
import { runGovernanceGate, isDataStale } from "@/engine/governance";
import {
  computePriorityWeights,
  getUseCaseCategories,
  needsHybridRecommendation,
  PRIORITY_TO_DIMENSION,
} from "@/engine/mapping";
import {
  numericToFitBand,
  scoreToNumeric,
  SCORE_VALUES,
} from "@/engine/scoring-rubric";
import { buildExplainability, type Explainability } from "@/engine/explainability";

export type ProductRanking = {
  product: Product;
  matchScore: number;
  fitLabel: string;
  fitDisplay: string;
  filterStatus: "eligible" | "requirement_not_met" | "excluded";
  filterReason?: string;
  governance: ReturnType<typeof runGovernanceGate>;
  dimensionBreakdown: { priority: Priority; level: ScoreLevel; weight: number; contribution: number }[];
  whyMatches: string[];
  tradeOffs: string[];
  staleData: boolean;
};

export type AssessmentResult = {
  rankings: ProductRanking[];
  topThree: ProductRanking[];
  allSuitable: ProductRanking[];
  noClearWinner: boolean;
  noClearWinnerExplanation?: string;
  alternativeApproach: ReturnType<typeof evaluateAlternativeApproach>;
  needsHybrid: boolean;
  outcomeType:
    | "commercial"
    | "open_source"
    | "custom"
    | "hybrid"
    | "no_winner"
    | "insufficient_evidence"
    | "ai_not_appropriate";
  priorityWeights: Map<Priority, number>;
  brukdCta: ReturnType<typeof evaluateBrukdCta>;
  explainability: Explainability;
};

const NO_CLEAR_WINNER_THRESHOLD = 5;

function getDimensionScore(
  product: Product,
  dimension: keyof Product["scores"] | "integration_microsoft" | "integration_google",
  profile: UserProfile,
): ScoreLevel {
  if (dimension === "integration_microsoft") {
    const hasM365 = profile.existingTools.includes("microsoft_365");
    if (!hasM365) return product.scores.integration;
    return product.integrations.includes("microsoft_365")
      ? boostLevel(product.scores.integration)
      : product.scores.integration;
  }
  if (dimension === "integration_google") {
    const hasGoogle = profile.existingTools.includes("google_workspace");
    if (!hasGoogle) return product.scores.integration;
    return product.integrations.includes("google_workspace")
      ? boostLevel(product.scores.integration)
      : product.scores.integration;
  }
  return product.scores[dimension];
}

function boostLevel(level: ScoreLevel): ScoreLevel {
  const order: ScoreLevel[] = ["unknown", "limited", "moderate", "strong", "excellent"];
  const idx = order.indexOf(level);
  if (idx < 0 || idx >= order.length - 1) return level;
  return order[idx + 1];
}

function useCaseFitScore(product: Product, profile: UserProfile): number {
  const useCaseMap: Record<string, string[]> = {
    general_productivity: ["general_productivity", "writing_content"],
    writing_content: ["writing_content", "marketing"],
    marketing: ["marketing", "writing_content"],
    research: ["research", "general_productivity"],
    customer_service: ["customer_service"],
    sales: ["sales", "general_productivity"],
    document_analysis: ["document_analysis", "general_productivity"],
    data_analysis: ["data_analysis"],
    coding: ["coding"],
    meeting_notes: ["meeting_notes", "general_productivity"],
    workflow_automation: ["workflow_automation"],
    internal_knowledge: ["internal_knowledge", "research"],
    image_generation: ["image_generation"],
    video_audio: ["video_audio"],
    hr_recruitment: ["hr_recruitment"],
    finance_accounting: ["finance_accounting"],
    other_operations: ["general_productivity"],
  };

  let matchCount = 0;
  for (const uc of profile.useCases) {
    const mapped = useCaseMap[uc] ?? [uc];
    if (mapped.some((m) => product.primary_use_cases.includes(m))) {
      matchCount += 2;
    } else if (mapped.some((m) => product.secondary_use_cases.includes(m))) {
      matchCount += 1;
    }
  }

  const maxPossible = profile.useCases.length * 2;
  const ratio = maxPossible > 0 ? matchCount / maxPossible : 0;

  if (ratio >= 0.8) return 100;
  if (ratio >= 0.6) return 75;
  if (ratio >= 0.4) return 50;
  if (ratio >= 0.2) return 25;
  return 0;
}

function computeMatchScore(
  product: Product,
  profile: UserProfile,
  weights: Map<Priority, number>,
): { score: number; breakdown: ProductRanking["dimensionBreakdown"] } {
  const breakdown: ProductRanking["dimensionBreakdown"] = [];
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [priority, weight] of weights) {
    const dimension = PRIORITY_TO_DIMENSION[priority];
    let numeric: number | null;

    if (dimension === "use_case_fit") {
      numeric = useCaseFitScore(product, profile);
    } else {
      const level = getDimensionScore(product, dimension, profile);
      numeric = scoreToNumeric(level);
      breakdown.push({
        priority,
        level,
        weight,
        contribution: 0,
      });
    }

    if (numeric === null) continue;

    const contribution = numeric * weight;
    weightedSum += contribution;
    totalWeight += weight;

    const existing = breakdown.find((b) => b.priority === priority);
    if (existing) {
      existing.contribution = contribution;
    } else {
      breakdown.push({
        priority,
        level: numeric >= 75 ? "strong" : numeric >= 50 ? "moderate" : "limited",
        weight,
        contribution,
      });
    }
  }

  let score = totalWeight > 0 ? weightedSum / totalWeight : 0;

  const budget = budgetCompatibility(product, profile);
  if (budget === "poor") score *= 0.7;
  else if (budget === "stretch") score *= 0.9;

  if (
    profile.integrationImportance === "critical" ||
    profile.integrationImportance === "very_important"
  ) {
    const integrationLevel = product.scores.integration;
    const intNumeric = scoreToNumeric(integrationLevel);
    if (intNumeric !== null && intNumeric < 50) score *= 0.85;
  }

  return { score: Math.round(Math.min(100, Math.max(0, score))), breakdown };
}

function buildWhyMatches(
  product: Product,
  profile: UserProfile,
  score: number,
): string[] {
  const reasons: string[] = [];

  const ucMatch = useCaseFitScore(product, profile);
  if (ucMatch >= 75) reasons.push("Strong use-case fit for your selected needs");
  else if (ucMatch >= 50) reasons.push("Moderate use-case fit");

  const budget = budgetCompatibility(product, profile);
  if (budget === "good") reasons.push("Fits your stated budget range");
  if (product.integrations.some((i) => profile.existingTools.includes(i))) {
    reasons.push("Integrates with tools you already use");
  }

  if (
    profile.privacyImportance === "high" ||
    profile.privacyImportance === "very_high" ||
    profile.privacyImportance === "critical"
  ) {
    if (product.scores.privacy === "strong" || product.scores.privacy === "excellent") {
      reasons.push("Meets your stated governance priorities");
    }
  }

  if (score >= 75) reasons.push("Best match for your stated priorities");

  return reasons.slice(0, 5);
}

function buildTradeOffs(
  ranked: ProductRanking[],
  index: number,
): string[] {
  const current = ranked[index];
  const tradeOffs: string[] = [];

  for (let i = 0; i < Math.min(ranked.length, 3); i++) {
    if (i === index) continue;
    const other = ranked[i];
    if (
      scoreToNumeric(other.product.scores.price) !== null &&
      scoreToNumeric(current.product.scores.price) !== null &&
      (SCORE_VALUES[other.product.scores.price as keyof typeof SCORE_VALUES] ?? 0) >
        (SCORE_VALUES[current.product.scores.price as keyof typeof SCORE_VALUES] ?? 0)
    ) {
      tradeOffs.push(`${other.product.product} offers better pricing value`);
    }
    if (
      other.product.scores.integration === "excellent" &&
      current.product.scores.integration !== "excellent"
    ) {
      tradeOffs.push(`${other.product.product} has stronger integration capabilities`);
    }
  }

  return tradeOffs.slice(0, 2);
}

export function runAssessment(
  profile: UserProfile,
  products: Product[],
): AssessmentResult {
  const weights = computePriorityWeights(profile.priorities);
  const hybridNeeded = needsHybridRecommendation(profile.useCases);
  const alternativeApproach = evaluateAlternativeApproach(profile, hybridNeeded);

  const rankings: ProductRanking[] = [];

  for (const product of products) {
    const filter = applyHardFilters(product, profile);
    const governance = runGovernanceGate(product, profile);
    const { score, breakdown } = computeMatchScore(product, profile, weights);

    let filterStatus: ProductRanking["filterStatus"] = "eligible";
    let filterReason: string | undefined;

    if (filter.status === "requirement_not_met") {
      filterStatus = "requirement_not_met";
      filterReason = filter.reason;
    } else if (filter.status === "excluded") {
      continue;
    }

    let adjustedScore = score;
    if (governance.blocked) adjustedScore = Math.min(adjustedScore, 45);
    if (filterStatus === "requirement_not_met") adjustedScore = 0;

    const fitBand = numericToFitBand(adjustedScore);

    rankings.push({
      product,
      matchScore: adjustedScore,
      fitLabel: fitBand.label,
      fitDisplay: fitBand.display,
      filterStatus,
      filterReason,
      governance,
      dimensionBreakdown: breakdown,
      whyMatches: buildWhyMatches(product, profile, adjustedScore),
      tradeOffs: [],
      staleData: isDataStale(product.last_verified),
    });
  }

  rankings.sort((a, b) => b.matchScore - a.matchScore);

  rankings.forEach((r, i) => {
    r.tradeOffs = buildTradeOffs(rankings, i);
  });

  const eligible = rankings.filter(
    (r) => r.filterStatus === "eligible" && !r.governance.blocked,
  );

  const allSuitable = rankings.filter(
    (r) => r.filterStatus !== "excluded" && r.matchScore > 0,
  );

  let noClearWinner = false;
  let noClearWinnerExplanation: string | undefined;

  if (eligible.length >= 2) {
    const diff = eligible[0].matchScore - eligible[1].matchScore;
    if (diff <= NO_CLEAR_WINNER_THRESHOLD) {
      const topStrengths = (r: ProductRanking) =>
        r.dimensionBreakdown
          .sort((a, b) => b.contribution - a.contribution)
          .slice(0, 2)
          .map((d) => d.priority);

      const aStrengths = topStrengths(eligible[0]);
      const bStrengths = topStrengths(eligible[1]);

      if (aStrengths.join() !== bStrengths.join()) {
        noClearWinner = true;
        noClearWinnerExplanation = `Your decision depends on whether ${aStrengths[0]?.replace(/_/g, " ")} or ${bStrengths[0]?.replace(/_/g, " ")} is more important — both ${eligible[0].product.product} and ${eligible[1].product.product} are strong options with different trade-offs.`;
      }
    }
  }

  const topThree = eligible.slice(0, 3);

  let outcomeType: AssessmentResult["outcomeType"] = "commercial";
  if (alternativeApproach?.type === "custom") outcomeType = "custom";
  else if (alternativeApproach?.type === "hybrid") outcomeType = "hybrid";
  else if (alternativeApproach?.type === "open_source") outcomeType = "open_source";
  else if (alternativeApproach?.type === "ai_not_appropriate") outcomeType = "ai_not_appropriate";
  else if (noClearWinner) outcomeType = "no_winner";
  else if (topThree.length === 0) outcomeType = "insufficient_evidence";
  else if (topThree[0]?.product.approach === "open_source") outcomeType = "open_source";

  const partialResult: AssessmentResult = {
    rankings,
    topThree,
    allSuitable,
    noClearWinner,
    noClearWinnerExplanation,
    alternativeApproach,
    needsHybrid: hybridNeeded,
    outcomeType,
    priorityWeights: weights,
    brukdCta: { show: false, reasons: [] },
    explainability: buildExplainability(profile, weights, {
      topThree,
      noClearWinner,
      outcomeType,
      alternativeApproach,
    }),
  };

  partialResult.brukdCta = evaluateBrukdCta(profile, partialResult);

  if (shouldRecommendCustom(profile) && !alternativeApproach) {
    partialResult.alternativeApproach = {
      type: "custom",
      reason:
        "Specialized workflow and customization requirements with available technical support suggest evaluating a custom approach.",
      confidence: "moderate",
    };
    partialResult.outcomeType = "custom";
    partialResult.brukdCta = evaluateBrukdCta(profile, partialResult);
  }

  partialResult.explainability = buildExplainability(profile, weights, {
    topThree: partialResult.topThree,
    noClearWinner: partialResult.noClearWinner,
    outcomeType: partialResult.outcomeType,
    alternativeApproach: partialResult.alternativeApproach,
  });

  return partialResult;
}

export { getUseCaseCategories };

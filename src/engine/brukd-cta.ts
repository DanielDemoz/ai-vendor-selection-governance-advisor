import type { UserProfile } from "@/lib/schemas";
import type { AssessmentResult } from "@/engine/scorer";

export type BrukdCtaReason =
  | "custom_recommended"
  | "governance_insufficient"
  | "integration_complexity"
  | "uncertain_requirements"
  | "hybrid_evaluation";

export type BrukdCtaResult = {
  show: boolean;
  reasons: BrukdCtaReason[];
};

export function evaluateBrukdCta(
  profile: UserProfile,
  result: AssessmentResult,
): BrukdCtaResult {
  const reasons: BrukdCtaReason[] = [];

  if (result.alternativeApproach?.type === "custom") {
    reasons.push("custom_recommended");
  }

  if (
    result.alternativeApproach?.type === "hybrid" ||
    result.needsHybrid
  ) {
    reasons.push("hybrid_evaluation");
  }

  const topBlocked = result.rankings.every(
    (r) => r.governance.blocked || r.filterStatus === "requirement_not_met",
  );
  if (topBlocked && result.rankings.length > 0) {
    reasons.push("governance_insufficient");
  }

  const allLowConfidence = result.rankings
    .slice(0, 3)
    .every((r) => r.governance.confidence === "insufficient" || r.governance.blocked);

  if (allLowConfidence && result.rankings.length >= 1) {
    reasons.push("governance_insufficient");
  }

  if (
    profile.integrationImportance === "critical" &&
    profile.existingTools.length >= 3
  ) {
    reasons.push("integration_complexity");
  }

  let uncertainCount = 0;
  if (profile.trainingExclusion === "not_sure") uncertainCount++;
  if (profile.dataProcessingPreference === "not_sure") uncertainCount++;
  if (profile.budget === "not_sure") uncertainCount++;
  if (profile.approachOpenness.includes("not_sure")) uncertainCount++;

  if (uncertainCount >= 3) {
    reasons.push("uncertain_requirements");
  }

  if (
    profile.privacyImportance === "critical" &&
    profile.dataTypes.some((d) =>
      ["customer_information", "confidential_proprietary", "sensitive_information"].includes(d),
    )
  ) {
    const hasConfidentTop = result.rankings.some(
      (r) => r.governance.confidence === "high" && !r.governance.blocked,
    );
    if (!hasConfidentTop) {
      reasons.push("governance_insufficient");
    }
  }

  const uniqueReasons = [...new Set(reasons)];

  const clearCommercialFit =
    result.outcomeType === "commercial" &&
    result.rankings[0]?.matchScore >= 75 &&
    result.rankings[0]?.governance.confidence === "high" &&
    !result.noClearWinner;

  if (clearCommercialFit && uniqueReasons.length === 0) {
    return { show: false, reasons: [] };
  }

  return {
    show: uniqueReasons.length > 0,
    reasons: uniqueReasons,
  };
}

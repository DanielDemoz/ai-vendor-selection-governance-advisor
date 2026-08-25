import type { Product, UserProfile } from "@/lib/schemas";

export type FilterResult =
  | { status: "eligible" }
  | { status: "excluded"; reason: string }
  | { status: "requirement_not_met"; reason: string };

export function applyHardFilters(
  product: Product,
  profile: UserProfile,
): FilterResult {
  if (product.approach === "meta") {
    return { status: "excluded", reason: "Meta recommendation entry" };
  }

  if (
    profile.dataProcessingPreference === "canada_required" &&
    product.canada_supported === "no"
  ) {
    return {
      status: "requirement_not_met",
      reason: "Does not currently meet stated requirement: Canada data processing required",
    };
  }

  if (
    profile.dataProcessingPreference === "canada_required" &&
    product.canada_supported === "unknown" &&
    product.residency_evidence_level === "unknown"
  ) {
    return {
      status: "requirement_not_met",
      reason: "Insufficient evidence for Canada-required data processing",
    };
  }

  if (
    profile.trainingExclusion === "required" &&
    product.training_opt_out === "no"
  ) {
    return {
      status: "requirement_not_met",
      reason: "Does not meet stated requirement: training exclusion required",
    };
  }

  if (
    profile.trainingExclusion === "required" &&
    product.training_opt_out === "unknown"
  ) {
    return {
      status: "requirement_not_met",
      reason: "Insufficient evidence on training exclusion policy",
    };
  }

  const onlyOpenSource =
    profile.approachOpenness.length === 1 &&
    profile.approachOpenness[0] === "open_source";

  if (onlyOpenSource && !product.self_hosting && product.approach !== "open_source") {
    return {
      status: "excluded",
      reason: "User limited to open-source/self-hosted options",
    };
  }

  const onlyCommercial =
    profile.approachOpenness.length === 1 &&
    profile.approachOpenness[0] === "commercial";

  if (onlyCommercial && product.approach === "open_source" && !product.business_tiers) {
    return {
      status: "excluded",
      reason: "User limited to commercial tools",
    };
  }

  return { status: "eligible" };
}

export function budgetCompatibility(
  product: Product,
  profile: UserProfile,
): "good" | "stretch" | "poor" | "unknown" {
  if (profile.budget === "not_sure") return "unknown";

  const bandOrder = ["free", "$", "$$", "$$$", "$$$$"] as const;
  const budgetToBand: Record<UserProfile["budget"], (typeof bandOrder)[number] | "any"> = {
    free: "free",
    under_10: "$",
    "10_25": "$",
    "25_50": "$$",
    "50_100": "$$$",
    "100_plus": "$$$$",
    project: "any",
    not_sure: "any",
  };

  const userBand = budgetToBand[profile.budget];
  if (userBand === "any") return "unknown";

  if (product.pricing_band === "unknown") return "unknown";
  if (profile.budget === "free" && !product.free_tier) return "poor";

  const userIdx = bandOrder.indexOf(userBand as (typeof bandOrder)[number]);
  const productIdx = bandOrder.indexOf(
    product.pricing_band as (typeof bandOrder)[number],
  );

  if (userIdx < 0 || productIdx < 0) return "unknown";
  if (productIdx <= userIdx) return "good";
  if (productIdx === userIdx + 1) return "stretch";
  return "poor";
}

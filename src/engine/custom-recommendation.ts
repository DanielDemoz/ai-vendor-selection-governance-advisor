import type { UserProfile } from "@/lib/schemas";

export type AlternativeRecommendation =
  | { type: "commercial"; reason: string }
  | { type: "open_source"; reason: string }
  | { type: "custom"; reason: string; confidence: "high" | "moderate" }
  | { type: "hybrid"; reason: string; toolCount: number }
  | { type: "ai_not_appropriate"; reason: string };

function isSimpleUseCase(profile: UserProfile): boolean {
  return (
    profile.useCases.length <= 2 &&
    !profile.useCases.includes("data_analysis") &&
    !profile.useCases.includes("coding") &&
    !profile.uniqueWorkflow
  );
}

function isLowBudget(profile: UserProfile): boolean {
  return profile.budget === "free" || profile.budget === "under_10";
}

export function evaluateAlternativeApproach(
  profile: UserProfile,
  hybridNeeded: boolean,
): AlternativeRecommendation | null {
  const noTechnical =
    profile.technicalStaff === "no" || profile.technicalStaff === "not_sure";
  const simple = isSimpleUseCase(profile);
  const lowBudget = isLowBudget(profile);

  const wantsCustom =
    profile.approachOpenness.includes("custom") ||
    profile.highCustomization ||
    profile.uniqueWorkflow;

  const highCustomization =
    profile.highCustomization ||
    profile.priorities.includes("customization") ||
    profile.uniqueWorkflow;

  if (
    wantsCustom &&
    highCustomization &&
    !noTechnical &&
    profile.technicalStaff === "yes"
  ) {
    if (lowBudget && simple) {
      return null;
    }
    return {
      type: "custom",
      reason:
        "Your requirements suggest specialized workflows, strong customization needs, and available technical capability — a custom or in-house approach may be worth evaluating.",
      confidence: profile.uniqueWorkflow ? "high" : "moderate",
    };
  }

  if (hybridNeeded) {
    return {
      type: "hybrid",
      reason:
        "Your selected use cases span multiple categories — you may benefit from a combination of specialized tools rather than a single product.",
      toolCount: 2,
    };
  }

  if (
    profile.approachOpenness.length === 1 &&
    profile.approachOpenness[0] === "open_source" &&
    profile.technicalStaff === "yes"
  ) {
    return {
      type: "open_source",
      reason:
        "You indicated openness to open-source options and have technical staff — self-hosted solutions may offer stronger data control.",
    };
  }

  if (
    profile.useCases.length === 0 ||
    (profile.useCases.length === 1 &&
      profile.useCases[0] === "other_operations" &&
      profile.budget === "free" &&
      noTechnical)
  ) {
    return {
      type: "ai_not_appropriate",
      reason:
        "Based on your inputs, a commercial AI investment may not be the best next step — clarify your business need and expected outcomes first.",
    };
  }

  if (lowBudget && noTechnical && simple) {
    if (
      profile.useCases.includes("data_analysis") ||
      profile.useCases.includes("coding")
    ) {
      return {
        type: "ai_not_appropriate",
        reason:
          "Advanced use cases with a free budget and no technical staff make most AI tools a poor fit right now — consider starting with free tiers or delaying until requirements are clearer.",
      };
    }
  }

  return null;
}

/** Conservative custom/in-house decision tree */
export function shouldRecommendCustom(profile: UserProfile): boolean {
  const noTechnical =
    profile.technicalStaff === "no" ||
    profile.technicalStaff === "not_sure";
  const simple = isSimpleUseCase(profile);
  const lowBudget = isLowBudget(profile);

  const hasDrivers =
    profile.uniqueWorkflow ||
    profile.highCustomization ||
    profile.priorities.includes("customization");

  if (!hasDrivers) return false;
  if (noTechnical) return false;
  if (lowBudget && simple) return false;

  return profile.technicalStaff === "yes" || profile.technicalStaff === "some";
}

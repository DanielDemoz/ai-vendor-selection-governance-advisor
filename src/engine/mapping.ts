import type { Priority, UserProfile } from "@/lib/schemas";

/** Maps user-selected priorities to product score dimensions */
export const PRIORITY_TO_DIMENSION: Record<
  Priority,
  keyof import("@/lib/schemas").Product["scores"] | "integration_microsoft" | "integration_google"
> = {
  price: "price",
  ease_of_use: "ease_of_use",
  privacy: "privacy",
  security: "security",
  data_controls: "data_controls",
  microsoft_integration: "integration_microsoft",
  google_integration: "integration_google",
  collaboration: "team_fit",
  writing: "use_case_fit",
  research: "use_case_fit",
  data_analysis: "capabilities",
  coding: "capabilities",
  automation: "capabilities",
  customization: "customization",
  scalability: "scalability",
  vendor_support: "administration",
  canadian_considerations: "privacy",
  open_source: "portability",
  avoid_lock_in: "vendor_lock_in",
};

/** Diminishing weight distribution for 3–5 priorities */
const WEIGHT_TEMPLATES: Record<number, number[]> = {
  3: [0.35, 0.33, 0.32],
  4: [0.28, 0.24, 0.24, 0.24],
  5: [0.25, 0.2, 0.18, 0.17, 0.2],
};

export function computePriorityWeights(
  priorities: Priority[],
): Map<Priority, number> {
  const template = WEIGHT_TEMPLATES[priorities.length] ?? WEIGHT_TEMPLATES[5];
  const weights = new Map<Priority, number>();
  priorities.forEach((p, i) => {
    weights.set(p, template[i] ?? 0.1);
  });
  const sum = [...weights.values()].reduce((a, b) => a + b, 0);
  for (const [k, v] of weights) {
    weights.set(k, v / sum);
  }
  return weights;
}

export function derivePrimaryUseCase(useCases: UserProfile["useCases"]): UserProfile["primaryUseCase"] {
  return useCases[0];
}

export function countUncertainAnswers(profile: UserProfile): number {
  let count = 0;
  if (profile.trainingExclusion === "not_sure") count++;
  if (profile.dataProcessingPreference === "not_sure") count++;
  if (profile.budget === "not_sure") count++;
  if (profile.technicalStaff === "not_sure") count++;
  if (profile.approachOpenness.includes("not_sure")) count++;
  if (profile.dataTypes.includes("unsure")) count++;
  return count;
}

export function needsHybridRecommendation(useCases: UserProfile["useCases"]): boolean {
  const categories = new Set(useCases.map((uc) => USE_CASE_CATEGORY[uc]));
  return categories.size >= 3;
}

const USE_CASE_CATEGORY: Record<UserProfile["useCases"][number], string> = {
  general_productivity: "assistant",
  writing_content: "assistant",
  marketing: "assistant",
  research: "assistant",
  customer_service: "cs",
  sales: "assistant",
  document_analysis: "assistant",
  data_analysis: "data",
  coding: "coding",
  meeting_notes: "assistant",
  workflow_automation: "automation",
  internal_knowledge: "assistant",
  image_generation: "creative",
  video_audio: "creative",
  hr_recruitment: "assistant",
  finance_accounting: "assistant",
  other_operations: "assistant",
};

export function getUseCaseCategories(useCases: UserProfile["useCases"]): string[] {
  return [...new Set(useCases.map((uc) => USE_CASE_CATEGORY[uc]))];
}

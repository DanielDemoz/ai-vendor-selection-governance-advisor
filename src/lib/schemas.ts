import { z } from "zod";

/** Ordinal scoring rubric — never infer from missing data */
export const ScoreLevelSchema = z.enum([
  "unknown",
  "limited",
  "moderate",
  "strong",
  "excellent",
]);

export const PricingModelSchema = z.enum([
  "per_user",
  "per_org",
  "usage",
  "bundled",
  "project",
  "free",
  "unknown",
]);

export const ResidencyEvidenceLevelSchema = z.enum([
  "official",
  "inferred",
  "unknown",
]);

export const BudgetBandSchema = z.enum([
  "free",
  "under_10",
  "10_25",
  "25_50",
  "50_100",
  "100_plus",
  "project",
  "not_sure",
]);

export const SourceSchema = z.object({
  type: z.enum(["official", "independent", "community"]),
  url: z.string().url(),
  topic: z.string(),
  verified: z.string(),
});

export const ProductScoresSchema = z.object({
  use_case_fit: ScoreLevelSchema,
  ease_of_use: ScoreLevelSchema,
  team_fit: ScoreLevelSchema,
  integration: ScoreLevelSchema,
  price: ScoreLevelSchema,
  free_tier: ScoreLevelSchema,
  pricing_scalability: ScoreLevelSchema,
  capabilities: ScoreLevelSchema,
  api: ScoreLevelSchema,
  customization: ScoreLevelSchema,
  data_controls: ScoreLevelSchema,
  privacy: ScoreLevelSchema,
  security: ScoreLevelSchema,
  administration: ScoreLevelSchema,
  transparency: ScoreLevelSchema,
  vendor_lock_in: ScoreLevelSchema,
  scalability: ScoreLevelSchema,
  portability: ScoreLevelSchema,
});

export const ProductSchema = z.object({
  id: z.string(),
  vendor: z.string(),
  product: z.string(),
  category: z.string(),
  approach: z.enum([
    "commercial",
    "open_source",
    "hybrid",
    "platform",
    "meta",
  ]),
  target_users: z.array(z.string()),
  pricing_model: PricingModelSchema,
  pricing_band: z.enum(["free", "$", "$$", "$$$", "$$$$", "unknown"]),
  pricing_summary: z.string(),
  free_tier: z.boolean(),
  business_tiers: z.boolean(),
  primary_use_cases: z.array(z.string()),
  secondary_use_cases: z.array(z.string()),
  integrations: z.array(z.string()),
  data_controls: z.string(),
  training_policy: z.string(),
  retention_information: z.string(),
  security_features: z.string(),
  administration: z.string(),
  collaboration: z.string(),
  api_available: z.boolean(),
  customization: ScoreLevelSchema,
  self_hosting: z.boolean(),
  geographic_options: z.array(z.string()),
  residency_evidence_level: ResidencyEvidenceLevelSchema,
  canada_supported: z.enum(["yes", "partial", "no", "unknown"]),
  training_opt_out: z.enum(["yes", "partial", "no", "unknown"]),
  scores: ProductScoresSchema,
  strengths: z.array(z.string()),
  limitations: z.array(z.string()),
  best_for: z.array(z.string()),
  not_ideal_for: z.array(z.string()),
  sources: z.array(SourceSchema),
  last_verified: z.string(),
});

export const ProductCatalogSchema = z.array(ProductSchema);

export const UseCaseSchema = z.enum([
  "general_productivity",
  "writing_content",
  "marketing",
  "research",
  "customer_service",
  "sales",
  "document_analysis",
  "data_analysis",
  "coding",
  "meeting_notes",
  "workflow_automation",
  "internal_knowledge",
  "image_generation",
  "video_audio",
  "hr_recruitment",
  "finance_accounting",
  "other_operations",
]);

export const PrioritySchema = z.enum([
  "price",
  "ease_of_use",
  "privacy",
  "security",
  "data_controls",
  "microsoft_integration",
  "google_integration",
  "collaboration",
  "writing",
  "research",
  "data_analysis",
  "coding",
  "automation",
  "customization",
  "scalability",
  "vendor_support",
  "canadian_considerations",
  "open_source",
  "avoid_lock_in",
]);

export const UserProfileSchema = z.object({
  useCases: z.array(UseCaseSchema).min(1),
  primaryUseCase: UseCaseSchema,
  orgSize: z.enum([
    "1_5",
    "6_20",
    "21_50",
    "51_100",
    "101_250",
    "250_plus",
  ]),
  userCount: z.enum(["1", "2_5", "6_20", "21_50", "50_plus"]),
  orgType: z.string(),
  existingTools: z.array(z.string()),
  integrationImportance: z.enum([
    "not_important",
    "somewhat",
    "important",
    "very_important",
    "critical",
  ]),
  dataTypes: z.array(z.string()),
  privacyImportance: z.enum(["low", "moderate", "high", "very_high", "critical"]),
  trainingExclusion: z.enum([
    "not_sure",
    "not_concern",
    "prefer",
    "required",
  ]),
  dataProcessingPreference: z.enum([
    "no_requirement",
    "canada_preferred",
    "canada_required",
    "specific_jurisdiction",
    "not_sure",
  ]),
  budget: BudgetBandSchema,
  budgetPriority: z.enum([
    "lowest_cost",
    "best_value",
    "best_capability",
    "balanced",
  ]),
  priorities: z.array(PrioritySchema).min(3).max(5),
  approachOpenness: z.array(
    z.enum([
      "commercial",
      "open_source",
      "custom",
      "combination",
      "not_sure",
    ]),
  ),
  lockInImportance: z.enum([
    "not_important",
    "somewhat",
    "important",
    "very_important",
  ]),
  technicalStaff: z.enum(["yes", "some", "no", "not_sure"]),
  uniqueWorkflow: z.boolean().optional(),
  highCustomization: z.boolean().optional(),
});

export const ScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  profile: UserProfileSchema,
  expectedOutcomeType: z.enum([
    "commercial",
    "open_source",
    "custom",
    "hybrid",
    "no_winner",
    "insufficient_evidence",
    "ai_not_appropriate",
  ]),
  expectedTopProductIds: z.array(z.string()).optional(),
});

export type ScoreLevel = z.infer<typeof ScoreLevelSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type UseCase = z.infer<typeof UseCaseSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;

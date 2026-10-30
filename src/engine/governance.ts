import type { Product, UserProfile } from "@/lib/schemas";

export type GovernanceResult = {
  passed: boolean;
  confidence: "high" | "moderate" | "low" | "insufficient";
  warnings: string[];
  blocked: boolean;
};

const SENSITIVE_DATA_TYPES = [
  "customer_information",
  "employee_information",
  "financial_information",
  "personal_information",
  "sensitive_information",
  "confidential_proprietary",
];

export function runGovernanceGate(
  product: Product,
  profile: UserProfile,
): GovernanceResult {
  const warnings: string[] = [];
  const hasSensitiveData = profile.dataTypes.some((d) =>
    SENSITIVE_DATA_TYPES.includes(d),
  );
  const highPrivacy =
    profile.privacyImportance === "very_high" ||
    profile.privacyImportance === "critical";

  if (hasSensitiveData && highPrivacy) {
    if (product.scores.privacy === "unknown") {
      return {
        passed: false,
        confidence: "insufficient",
        warnings: [
          "Governance information insufficient for a confident recommendation.",
        ],
        blocked: true,
      };
    }
    if (product.scores.data_controls === "unknown") {
      warnings.push(
        "Data control documentation is limited, verify before adopting with sensitive data.",
      );
    }
    if (product.scores.security === "unknown") {
      warnings.push(
        "Security documentation is limited, independent verification recommended.",
      );
    }
  }

  if (
    profile.trainingExclusion === "prefer" ||
    profile.trainingExclusion === "required"
  ) {
    if (product.training_opt_out === "unknown") {
      warnings.push(
        "Training/opt-out policy could not be verified from available sources.",
      );
    }
  }

  if (product.residency_evidence_level === "inferred") {
    warnings.push(
      "Geographic data processing information is inferred, not officially documented.",
    );
  }

  const governanceScores = [
    product.scores.privacy,
    product.scores.security,
    product.scores.data_controls,
    product.scores.transparency,
  ];

  const unknownCount = governanceScores.filter((s) => s === "unknown").length;

  if (unknownCount >= 3 && highPrivacy) {
    return {
      passed: false,
      confidence: "insufficient",
      warnings: [
        "Governance information insufficient for a confident recommendation.",
        ...warnings,
      ],
      blocked: true,
    };
  }

  const limitedCount = governanceScores.filter(
    (s) => s === "limited" || s === "unknown",
  ).length;

  let confidence: GovernanceResult["confidence"] = "high";
  if (unknownCount >= 2 || limitedCount >= 3) confidence = "low";
  else if (unknownCount >= 1 || limitedCount >= 2) confidence = "moderate";

  return {
    passed: true,
    confidence,
    warnings,
    blocked: false,
  };
}

export function isDataStale(lastVerified: string, maxDays = 90): boolean {
  const verified = new Date(lastVerified);
  const now = new Date("2026-08-25");
  const diffDays = (now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > maxDays;
}

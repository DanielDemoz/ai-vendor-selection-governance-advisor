import type { ScoreLevel } from "@/lib/schemas";

/** Numeric values for weighted scoring. `unknown` is excluded from denominator. */
export const SCORE_VALUES: Record<Exclude<ScoreLevel, "unknown">, number> = {
  limited: 25,
  moderate: 50,
  strong: 75,
  excellent: 100,
};

export const SCORE_LABELS: Record<ScoreLevel, string> = {
  unknown: "Insufficient evidence",
  limited: "Limited",
  moderate: "Moderate",
  strong: "Strong",
  excellent: "Excellent",
};

export const FIT_BANDS = [
  { min: 85, label: "Excellent match", display: "85–90%" },
  { min: 75, label: "Strong match", display: "75–84%" },
  { min: 65, label: "Good match", display: "65–74%" },
  { min: 50, label: "Moderate match", display: "50–64%" },
  { min: 0, label: "Limited match", display: "Below 50%" },
] as const;

export function scoreToNumeric(level: ScoreLevel): number | null {
  if (level === "unknown") return null;
  return SCORE_VALUES[level];
}

export function numericToFitBand(score: number): (typeof FIT_BANDS)[number] {
  return FIT_BANDS.find((b) => score >= b.min) ?? FIT_BANDS[FIT_BANDS.length - 1];
}

export function formatScoreLevel(level: ScoreLevel): string {
  return SCORE_LABELS[level];
}

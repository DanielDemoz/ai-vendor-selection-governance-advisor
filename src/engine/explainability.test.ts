import { describe, it, expect } from "vitest";
import {
  buildGovernanceSummary,
  buildTradeOffSummary,
  buildNoClearWinnerOptions,
  buildCalculationSteps,
  buildNextSteps,
  formatResultsAsText,
} from "@/engine/explainability";
import { runAssessment } from "@/engine/scorer";
import { loadProducts } from "@/data/products/catalog";
import { scenarios } from "@/data/scenarios";
import { computePriorityWeights } from "@/engine/mapping";

const products = loadProducts();

describe("explainability engine", () => {
  it("builds governance summary with checks for sensitive data profiles", () => {
    const profile = scenarios.find((s) => s.id === "professional-services")!.profile;
    const result = runAssessment(profile, products);
    const summary = buildGovernanceSummary(profile, result.topThree);
    expect(summary.headline).toBeTruthy();
    expect(summary.evidenceNote).toContain("vendor-stated");
  });

  it("builds trade-off summary when two or more options exist", () => {
    const profile = scenarios.find((s) => s.id === "marketing-agency")!.profile;
    const result = runAssessment(profile, products);
    const tradeOffs = buildTradeOffSummary(result.topThree);
    expect(tradeOffs).not.toBeNull();
    expect(tradeOffs!.whyWinnerWon).toBeTruthy();
    expect(tradeOffs!.whatYouGiveUp.length).toBeGreaterThan(0);
  });

  it("builds no-clear-winner options when flagged", () => {
    const profile = scenarios.find((s) => s.id === "marketing-agency")!.profile;
    const result = runAssessment(profile, products);
    if (result.noClearWinner) {
      const options = buildNoClearWinnerOptions(result.topThree);
      expect(options.length).toBe(2);
      expect(options[0].productName).toBeTruthy();
    }
  });

  it("includes calculation steps with priority weights", () => {
    const profile = scenarios.find((s) => s.id === "marketing-agency")!.profile;
    const weights = computePriorityWeights(profile.priorities);
    const steps = buildCalculationSteps(profile, weights);
    expect(steps.some((s) => s.label === "Weighting")).toBe(true);
    expect(steps.some((s) => s.label === "Governance gate")).toBe(true);
  });

  it("generates actionable next steps", () => {
    const profile = scenarios.find((s) => s.id === "retail-business")!.profile;
    const result = runAssessment(profile, products);
    const steps = buildNextSteps(result);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.includes("trial") || s.includes("Verify"))).toBe(true);
  });

  it("exports results as plain text", () => {
    const profile = scenarios.find((s) => s.id === "marketing-agency")!.profile;
    const result = runAssessment(profile, products);
    const text = formatResultsAsText({
      topThree: result.topThree,
      explainability: result.explainability,
      noClearWinner: result.noClearWinner,
      alternativeApproach: result.alternativeApproach,
    });
    expect(text).toContain("AI Vendor Selection");
    expect(text).toContain("Disclaimer");
  });

  it("includes explainability on assessment result", () => {
    const profile = scenarios.find((s) => s.id === "data-heavy")!.profile;
    const result = runAssessment(profile, products);
    expect(result.explainability).toBeDefined();
    expect(result.explainability.nextSteps.length).toBeGreaterThan(0);
    expect(result.explainability.governanceSummary).toBeDefined();
  });
});

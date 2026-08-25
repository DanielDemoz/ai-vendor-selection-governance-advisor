import { describe, it, expect } from "vitest";
import { runAssessment } from "@/engine/scorer";
import { loadProducts } from "@/data/products/catalog";
import { scenarios } from "@/data/scenarios";
import { shouldRecommendCustom } from "@/engine/custom-recommendation";
import { applyHardFilters } from "@/engine/filters";
import { runGovernanceGate } from "@/engine/governance";

const products = loadProducts();

describe("Golden scenario tests", () => {
  it("marketing agency scenario returns commercial recommendations", () => {
    const scenario = scenarios.find((s) => s.id === "marketing-agency")!;
    const result = runAssessment(scenario.profile, products);
    expect(result.outcomeType).toBe("commercial");
    expect(result.topThree.length).toBeGreaterThanOrEqual(1);
    expect(result.topThree[0].product.id).toBeDefined();
  });

  it("professional services favors strong governance products", () => {
    const scenario = scenarios.find((s) => s.id === "professional-services")!;
    const result = runAssessment(scenario.profile, products);
    expect(result.topThree.length).toBeGreaterThanOrEqual(1);
    const top = result.topThree[0];
    expect(["strong", "excellent"].includes(top.product.scores.privacy) ||
      top.product.integrations.includes("microsoft_365")).toBe(true);
  });

  it("retail business returns affordable automation or CS options", () => {
    const scenario = scenarios.find((s) => s.id === "retail-business")!;
    const result = runAssessment(scenario.profile, products);
    expect(result.outcomeType).toMatch(/commercial|hybrid/);
    expect(result.topThree.length).toBeGreaterThanOrEqual(1);
  });

  it("data-heavy scenario considers privacy and capability", () => {
    const scenario = scenarios.find((s) => s.id === "data-heavy")!;
    const result = runAssessment(scenario.profile, products);
    expect(result.topThree.length).toBeGreaterThanOrEqual(1);
  });

  it("custom candidate triggers custom or BRUKD path", () => {
    const scenario = scenarios.find((s) => s.id === "custom-candidate")!;
    const result = runAssessment(scenario.profile, products);
    expect(
      result.outcomeType === "custom" ||
      result.outcomeType === "hybrid" ||
      result.brukdCta.show,
    ).toBe(true);
    expect(shouldRecommendCustom(scenario.profile)).toBe(true);
  });
});

describe("Hard filters", () => {
  it("excludes products when Canada required and unsupported", () => {
    const profile = scenarios.find((s) => s.id === "custom-candidate")!.profile;
    const product = products.find((p) => p.id === "perplexity-pro")!;
    const result = applyHardFilters(product, profile);
    expect(result.status).toBe("requirement_not_met");
  });

  it("does not treat unknown as no for non-required preferences", () => {
    const profile = scenarios.find((s) => s.id === "marketing-agency")!.profile;
    const product = products.find((p) => p.id === "perplexity-pro")!;
    const result = applyHardFilters(product, profile);
    expect(result.status).toBe("eligible");
  });
});

describe("Governance gate", () => {
  it("blocks recommendations when privacy evidence is unknown and privacy is critical", () => {
    const profile = scenarios.find((s) => s.id === "custom-candidate")!.profile;
    const product = {
      ...products.find((p) => p.id === "perplexity-pro")!,
      scores: {
        ...products.find((p) => p.id === "perplexity-pro")!.scores,
        privacy: "unknown" as const,
        data_controls: "unknown" as const,
      },
    };
    const gov = runGovernanceGate(product, profile);
    expect(gov.blocked).toBe(true);
    expect(gov.confidence).toBe("insufficient");
  });

  it("can express insufficient evidence outcome", () => {
    const profile = {
      ...scenarios.find((s) => s.id === "custom-candidate")!.profile,
      dataProcessingPreference: "canada_required" as const,
    };
    const result = runAssessment(profile, products);
    const blocked = result.rankings.filter(
      (r) => r.filterStatus === "requirement_not_met" || r.governance.blocked,
    );
    expect(blocked.length).toBeGreaterThan(0);
  });
});

describe("Deterministic scoring", () => {
  it("produces identical results on repeated runs", () => {
    const profile = scenarios.find((s) => s.id === "marketing-agency")!.profile;
    const a = runAssessment(profile, products);
    const b = runAssessment(profile, products);
    expect(a.topThree.map((r) => r.product.id)).toEqual(b.topThree.map((r) => r.product.id));
    expect(a.topThree.map((r) => r.matchScore)).toEqual(b.topThree.map((r) => r.matchScore));
  });
});

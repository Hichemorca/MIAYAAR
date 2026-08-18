import { describe, expect, it } from "vitest";
import { methodologyV11 } from "@shared/valuation/methodology-v1_1";
import { calculateDeterministicValuation } from "./deterministic";

const property = {
  propertyType: "apartment" as const,
  district: "DOWNTOWN DUBAI",
  areaSqm: 100,
  condition: "good" as const,
  buildingCondition: "well_maintained" as const,
  views: ["city"] as const,
  finish: "normal" as const,
  annualRentAed: 120_000,
};

const comparables = Array.from({ length: 5 }, (_, index) => ({
  sourceTransactionId: `DLD-${index}`,
  transactionDate: new Date("2026-06-01T00:00:00Z"),
  district: "DOWNTOWN DUBAI",
  propertyType: "apartment" as const,
  areaSqm: 100,
  salePriceAed: 2_000_000,
  pricePerSqm: 20_000,
  ageDays: 78,
  timeAdjustedPricePerSqm: 20_000,
}));

describe("calculateDeterministicValuation", () => {
  it("runs applicable approaches and normalizes their frozen weights", () => {
    const result = calculateDeterministicValuation({
      property,
      comparables,
      configuration: methodologyV11,
      scenarioMultipliers: { lower: 1, baseline: 1, upper: 1 },
    });
    const baseline = result.scenarios.baseline;
    expect(baseline.approaches.map(item => item.key)).toEqual(["salesComparison", "incomeCapitalization", "dcf"]);
    expect(baseline.approaches.reduce((total, item) => total + item.normalizedWeight, 0)).toBeCloseTo(1, 10);
    expect(baseline.value).toBeGreaterThan(0);
  });

  it("keeps scenario calculations independent and deterministic", () => {
    const result = calculateDeterministicValuation({ property, comparables, configuration: methodologyV11, scenarioMultipliers: { lower: 0.95, baseline: 1, upper: 1.05 } });
    expect(result.scenarios.lower.value).toBeLessThan(result.scenarios.baseline.value);
    expect(result.scenarios.upper.value).toBeGreaterThan(result.scenarios.baseline.value);
  });
});

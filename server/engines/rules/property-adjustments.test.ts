import { describe, expect, it } from "vitest";
import { methodologyV11 } from "@shared/valuation/methodology-v1_1";
import { evaluatePropertyRules } from "./property-adjustments";

const subject = {
  propertyType: "apartment" as const, district: "DOWNTOWN DUBAI", areaSqm: 100, condition: "good" as const,
  buildingCondition: "well_maintained" as const, views: ["sea", "park"] as const, finish: "normal" as const,
};

describe("evaluatePropertyRules", () => {
  it("uses the approved diminishing-return view algorithm", () => {
    const result = evaluatePropertyRules(subject, methodologyV11);
    expect(result.explanation.baseline.find(item => item.factor === "view")?.multiplier).toBe(1.16);
  });

  it("does not apply a premium when an unknown or internal view is supplied", () => {
    const result = evaluatePropertyRules({ ...subject, views: ["sea", "internal"] }, methodologyV11);
    expect(result.explanation.baseline.find(item => item.factor === "view")?.multiplier).toBe(1);
  });
});

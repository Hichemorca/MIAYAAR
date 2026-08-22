import { describe, expect, it } from "vitest";
import type { PropertySubmission } from "../../shared/valuation/contracts";
import { validationErrors } from "../../server/engines/orchestrator/valuation-orchestrator";

const baseSubmission: PropertySubmission = {
  propertyType: "villa",
  district: "Dubai Marina",
  areaSqm: 180,
  condition: "good",
  buildingCondition: "well_maintained",
  views: ["city"],
  finish: "normal",
};

describe("valuation submission method input validation", () => {
  it("accepts absence of optional applicable method data without creating an artificial input", () => {
    expect(validationErrors(baseSubmission)).toEqual([]);
  });

  it("rejects partial Cost Approach inputs with an explicit INSUFFICIENT_DATA reason", () => {
    expect(
      validationErrors({ ...baseSubmission, replacementCostPerSqm: 1_200 })
    ).toEqual([
      "INSUFFICIENT_DATA: Cost Approach requires depreciationFactor when any of its governed submission inputs is supplied.",
    ]);
  });

  it("does not validate cost-method input pairs for an apartment where Cost is not applicable", () => {
    expect(
      validationErrors({
        ...baseSubmission,
        propertyType: "apartment",
        replacementCostPerSqm: 1_200,
      })
    ).toEqual([]);
  });

  it("rejects a non-positive submitted annual rent for an applicable income method", () => {
    expect(validationErrors({ ...baseSubmission, annualRentAed: 0 })).toContain(
      "INSUFFICIENT_DATA: Income Capitalization requires annualRentAed greater than zero when it is supplied."
    );
  });
});

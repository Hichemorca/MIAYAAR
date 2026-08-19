import { describe, expect, it } from "vitest";
import { PropertyType } from "../../core/types";
import { minimalProperty } from "../../tests/fixtures/property.fixture";
import { frozenMethodologyV12, resolveValuationConfiguration, validateFrozenMethodology } from "../../engines/valuation/methodology-v1_2";

describe("MIAYAAR methodology v1.2", () => {
  it("keeps every official weight set normalized", () => {
    expect(validateFrozenMethodology()).toEqual([]);
  });

  it("does not invent a Warehouse allocation", () => {
    expect(frozenMethodologyV12.weightsByPropertyType[PropertyType.WAREHOUSE]).toBeUndefined();
  });

  it("keeps building condition distinct from property condition", () => {
    const configuration = resolveValuationConfiguration({
      ...minimalProperty,
      structural: { ...minimalProperty.structural, propertyCondition: "EXCELLENT", buildingCondition: "EXCELLENT" },
    });
    expect(configuration?.adjustments.baseline.buildingCondition).toBe(1.1);
    expect(configuration?.adjustments.baseline.condition).toBe(1.08);
  });
});

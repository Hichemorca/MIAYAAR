import { describe, expect, it } from "vitest";
import { methodologyV11, validateMethodology } from "./methodology-v1_1";

describe("MIAYAAR methodology v1.1", () => {
  it("keeps every official weight set normalized", () => {
    expect(validateMethodology()).toEqual([]);
  });

  it("keeps Warehouse limited to sales comparison", () => {
    expect(methodologyV11.weights.warehouse.baseline).toEqual({ salesComparison: 1, incomeCapitalization: 0, cost: 0, dcf: 0 });
  });

  it("keeps building condition distinct from property condition", () => {
    expect(methodologyV11.factors.buildingCondition.excellent.baseline).toBe(1.1);
    expect(methodologyV11.factors.condition.excellent.baseline).toBe(1.08);
  });
});

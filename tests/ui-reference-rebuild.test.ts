import { describe, expect, it } from "vitest";
import {
  clearInapplicableEconomicInputs,
  getApplicableMethodFields,
  contractPropertyFields,
  getVisibleEconomicFields,
  getPublicMethodFields,
  propertyTypeChoices,
  shouldRenderFieldForPropertyType,
  toggleViewSelection,
  typeSpecificFieldRules,
} from "../client/src/pages/home-form-config";
import type { PropertySubmission } from "../shared/valuation/contracts";

describe("UI reference rebuild contract guardrails", () => {
  it("renders only the seven property types governed by the current contract", () => {
    expect(propertyTypeChoices.map(choice => choice.value)).toEqual([
      "apartment",
      "villa",
      "townhouse",
      "office",
      "retail",
      "land",
      "warehouse",
    ]);
  });

  it("keeps every governed input group present and exposes economic fields only for an applicable §4 method", () => {
    expect(contractPropertyFields).toEqual([
      "propertyType",
      "district",
      "areaSqm",
      "bedrooms",
      "yearBuilt",
      "condition",
      "buildingCondition",
      "views",
      "finish",
      "furnished",
      "floor",
      "streetPosition",
      "annualRentAed",
      "replacementCostPerSqm",
      "landValueAed",
      "depreciationFactor",
    ]);
    expect(typeSpecificFieldRules).toHaveLength(7);
    expect(shouldRenderFieldForPropertyType("apartment", "annualRentAed")).toBe(
      true
    );
    expect(shouldRenderFieldForPropertyType("apartment", "replacementCostPerSqm")).toBe(false);
    expect(shouldRenderFieldForPropertyType("land", "annualRentAed")).toBe(false);
    expect(shouldRenderFieldForPropertyType("land", "replacementCostPerSqm")).toBe(false);
    expect(getVisibleEconomicFields("villa")).toEqual([
      "annualRentAed",
      "replacementCostPerSqm",
      "depreciationFactor",
    ]);
    expect(getVisibleEconomicFields("warehouse")).toEqual([]);
    expect(shouldRenderFieldForPropertyType("warehouse", "floor")).toBe(true);
    expect(shouldRenderFieldForPropertyType("villa", "landValueAed")).toBe(false);
  });

  it("renders the policy-driven public field matrix for every governed property type", () => {
    expect(getPublicMethodFields("salesComparison")).toEqual(["district", "areaSqm"]);
    expect(getPublicMethodFields("incomeCapitalization")).toEqual(["annualRentAed"]);
    expect(getPublicMethodFields("cost")).toEqual([
      "replacementCostPerSqm",
      "depreciationFactor",
    ]);
    expect(getPublicMethodFields("dcf")).toEqual([]);

    expect(getApplicableMethodFields("apartment")).toEqual([
      { method: "salesComparison", fieldKeys: ["district", "areaSqm"] },
      { method: "incomeCapitalization", fieldKeys: ["annualRentAed"] },
      { method: "dcf", fieldKeys: [] },
    ]);

    for (const propertyType of ["villa", "townhouse", "office", "retail"] as const) {
      expect(getApplicableMethodFields(propertyType)).toEqual([
        { method: "salesComparison", fieldKeys: ["district", "areaSqm"] },
        { method: "incomeCapitalization", fieldKeys: ["annualRentAed"] },
        {
          method: "cost",
          fieldKeys: ["replacementCostPerSqm", "depreciationFactor"],
        },
        { method: "dcf", fieldKeys: [] },
      ]);
    }

    expect(getApplicableMethodFields("land")).toEqual([
      { method: "salesComparison", fieldKeys: ["district", "areaSqm"] },
      { method: "dcf", fieldKeys: [] },
    ]);
    expect(getApplicableMethodFields("warehouse")).toEqual([
      { method: "salesComparison", fieldKeys: ["district", "areaSqm"] },
    ]);
  });

  it("keeps the required view list non-empty and respects the server-backed five-view cap", () => {
    expect(toggleViewSelection(["city"], "city")).toEqual(["city"]);
    expect(toggleViewSelection(["city"], "sea")).toEqual(["city", "sea"]);
    expect(
      toggleViewSelection(
        ["sea", "city", "garden", "park", "street"],
        "internal"
      )
    ).toEqual(["sea", "city", "garden", "park", "street"]);
  });

  it("maps visible economic inputs exactly to the applicable methods for every property type", () => {
    expect(getVisibleEconomicFields("apartment")).toEqual(["annualRentAed"]);

    for (const propertyType of ["villa", "townhouse", "office", "retail"] as const) {
      expect(getVisibleEconomicFields(propertyType)).toEqual([
        "annualRentAed",
        "replacementCostPerSqm",
        "depreciationFactor",
      ]);
    }

    for (const propertyType of ["land", "warehouse"] as const) {
      expect(getVisibleEconomicFields(propertyType)).toEqual([]);
    }

    for (const propertyType of propertyTypeChoices.map(choice => choice.value)) {
      expect(shouldRenderFieldForPropertyType(propertyType, "landValueAed")).toBe(false);
      expect(shouldRenderFieldForPropertyType(propertyType, "condition")).toBe(true);
      expect(shouldRenderFieldForPropertyType(propertyType, "views")).toBe(true);
    }
  });

  it("clears only economic input values whose approaches no longer apply when property type changes", () => {
    const current: PropertySubmission = {
      propertyType: "villa",
      district: "Dubai Marina",
      areaSqm: 140,
      condition: "good",
      buildingCondition: "well_maintained",
      views: ["city"],
      finish: "normal",
      floor: "high",
      annualRentAed: 180_000,
      replacementCostPerSqm: 6_000,
      landValueAed: 1_500_000,
      depreciationFactor: 0.12,
    };

    expect(clearInapplicableEconomicInputs(current, "apartment")).toMatchObject({
      propertyType: "apartment",
      district: "Dubai Marina",
      areaSqm: 140,
      floor: "high",
      annualRentAed: 180_000,
      replacementCostPerSqm: undefined,
      depreciationFactor: undefined,
      landValueAed: undefined,
    });

    expect(clearInapplicableEconomicInputs(current, "land")).toMatchObject({
      propertyType: "land",
      district: "Dubai Marina",
      areaSqm: 140,
      floor: "high",
      annualRentAed: undefined,
      replacementCostPerSqm: undefined,
      depreciationFactor: undefined,
      landValueAed: undefined,
    });

    expect(clearInapplicableEconomicInputs(current, "villa")).toMatchObject({
      propertyType: "villa",
      annualRentAed: 180_000,
      replacementCostPerSqm: 6_000,
      depreciationFactor: 0.12,
      landValueAed: undefined,
    });
  });
});

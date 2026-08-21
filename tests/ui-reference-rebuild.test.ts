import { describe, expect, it } from "vitest";
import {
  contractPropertyFields,
  propertyTypeChoices,
  shouldRenderFieldForPropertyType,
  toggleViewSelection,
  typeSpecificFieldRules,
} from "../client/src/pages/home-form-config";

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

  it("keeps every governed input group present without introducing a type-specific field rule", () => {
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
    expect(typeSpecificFieldRules).toEqual([]);
    expect(shouldRenderFieldForPropertyType("apartment", "annualRentAed")).toBe(
      true
    );
    expect(shouldRenderFieldForPropertyType("warehouse", "floor")).toBe(true);
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
});

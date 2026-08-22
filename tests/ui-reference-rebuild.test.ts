import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ValuationReport } from "../server/engines/reporting/valuation-report";
import MethodologyExplanationPanel from "../client/src/components/MethodologyExplanationPanel";
import {
  clearInapplicableEconomicInputs,
  findServerApproachResult,
  allValuationMethods,
  getApplicableMethodFields,
  getApplicableMethodPresentation,
  getMethodNotApplicableExplanation,
  getPresentationReportStatus,
  contractPropertyFields,
  getServerApproachLabel,
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

  it("presents only policy-applicable approaches with the valuation engine labels", () => {
    expect(getServerApproachLabel("salesComparison")).toBe("Sales Comparison");
    expect(getServerApproachLabel("incomeCapitalization")).toBe("Income Capitalization");
    expect(getServerApproachLabel("cost")).toBe("Cost Approach");
    expect(getServerApproachLabel("dcf")).toBe("Discounted Cash Flow");

    expect(getApplicableMethodPresentation("apartment").map(item => item.method)).toEqual([
      "salesComparison",
      "incomeCapitalization",
      "dcf",
    ]);
    for (const propertyType of ["villa", "townhouse", "office", "retail"] as const) {
      expect(getApplicableMethodPresentation(propertyType).map(item => item.method)).toEqual([
        "salesComparison",
        "incomeCapitalization",
        "cost",
        "dcf",
      ]);
    }
    expect(getApplicableMethodPresentation("land").map(item => item.method)).toEqual([
      "salesComparison",
      "dcf",
    ]);
    expect(getApplicableMethodPresentation("warehouse").map(item => item.method)).toEqual([
      "salesComparison",
    ]);
  });

  it("shows a per-method result only when that approach is present in the server response", () => {
    const serverResults = [
      { approach: "Sales Comparison", value: 1_200_000 },
      { approach: "Income Capitalization", value: 1_150_000 },
    ] as const;

    expect(findServerApproachResult(serverResults, "salesComparison")).toEqual(
      serverResults[0],
    );
    expect(findServerApproachResult(serverResults, "incomeCapitalization")).toEqual(
      serverResults[1],
    );
    expect(findServerApproachResult(serverResults, "cost")).toBeUndefined();
    expect(findServerApproachResult(serverResults, "dcf")).toBeUndefined();
  });

  it("explains non-applicable methods only from the governed policy for all seven property types", () => {
    expect(allValuationMethods).toEqual([
      "salesComparison",
      "incomeCapitalization",
      "cost",
      "dcf",
    ]);

    const expectedNotApplicable = {
      apartment: ["cost"],
      villa: [],
      townhouse: [],
      office: [],
      retail: [],
      land: ["incomeCapitalization", "cost"],
      warehouse: ["incomeCapitalization", "cost", "dcf"],
    } as const;

    for (const propertyType of propertyTypeChoices.map(choice => choice.value)) {
      for (const method of allValuationMethods) {
        const explanation = getMethodNotApplicableExplanation(propertyType, method);
        if (expectedNotApplicable[propertyType].includes(method)) {
          expect(explanation).toContain("is not applicable to");
          expect(explanation).toContain("governed method policy");
        } else {
          expect(explanation).toBeUndefined();
        }
      }
    }

    expect(getMethodNotApplicableExplanation("apartment", "cost")).toBe(
      "Cost Approach is not applicable to Apartment under the governed method policy.",
    );
    expect(getMethodNotApplicableExplanation("land", "incomeCapitalization")).toBe(
      "Income Capitalization is not applicable to Land under the governed method policy.",
    );
    expect(getMethodNotApplicableExplanation("warehouse", "dcf")).toBe(
      "Discounted Cash Flow is not applicable to Warehouse under the governed method policy.",
    );
  });

  it("maps server report statuses to presentation labels without creating another outcome", () => {
    expect(getPresentationReportStatus("completed")).toMatchObject({
      label: "Success",
      tone: "success",
    });
    expect(getPresentationReportStatus("partial")).toMatchObject({
      label: "Partial",
      tone: "partial",
    });
    expect(getPresentationReportStatus("rejected")).toMatchObject({
      label: "Error",
      tone: "error",
    });
  });

  it("presents used, available, and policy-not-applicable methods without assigning a general warning to a method", () => {
    const report = {
      status: "partial",
      warnings: [
        "incomeCapitalization is unavailable because its input data is absent, invalid, or incompatible.",
        "The completed valuation applies explicitly labelled provisional calculation rules.",
      ],
      valuation: {
        result: {
          approachResults: [
            {
              approach: "Sales Comparison",
              value: { amount: 1_200_000, currency: { code: "AED" } },
            },
          ],
        },
      },
    } as unknown as ValuationReport;

    const markup = renderToStaticMarkup(
      React.createElement(MethodologyExplanationPanel, {
        propertyType: "apartment",
        report,
      }),
    );

    expect(markup).toContain("Partial");
    expect(markup).toContain("Used in this valuation");
    expect(markup).toContain("Server result:");
    expect(markup).toContain("Applicable · no result returned");
    expect(markup).toContain(
      "incomeCapitalization is unavailable because its input data is absent, invalid, or incompatible.",
    );
    expect(markup).toContain(
      "Cost Approach is not applicable to Apartment under the governed method policy.",
    );
    expect(markup).not.toContain(
      "The completed valuation applies explicitly labelled provisional calculation rules.",
    );
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

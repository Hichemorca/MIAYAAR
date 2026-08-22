import { describe, expect, it } from "vitest";
import {
  getApplicableMethods,
  getOfficialWeights,
  getRequiredFieldsForMethod,
} from "../../shared/valuation/method-applicability.policy";

describe("MIAYAAR-METH-001 §§4–5 method applicability policy", () => {
  it("transcribes the §4 applicability matrix without adding methods", () => {
    expect(getApplicableMethods("apartment")).toEqual([
      "salesComparison",
      "incomeCapitalization",
      "dcf",
    ]);
    expect(getApplicableMethods("villa")).toEqual([
      "salesComparison",
      "incomeCapitalization",
      "cost",
      "dcf",
    ]);
    expect(getApplicableMethods("townhouse")).toEqual([
      "salesComparison",
      "incomeCapitalization",
      "cost",
      "dcf",
    ]);
    expect(getApplicableMethods("office")).toEqual([
      "salesComparison",
      "incomeCapitalization",
      "cost",
      "dcf",
    ]);
    expect(getApplicableMethods("retail")).toEqual([
      "salesComparison",
      "incomeCapitalization",
      "cost",
      "dcf",
    ]);
    expect(getApplicableMethods("land")).toEqual(["salesComparison", "dcf"]);
    expect(getApplicableMethods("warehouse")).toEqual(["salesComparison"]);
  });

  it("preserves the exact §5 values while recording warehouse as unweighted", () => {
    expect(getOfficialWeights("apartment")?.baseline).toEqual({
      salesComparison: 0.5,
      incomeCapitalization: 0.35,
      cost: 0.1,
      dcf: 0.05,
    });
    expect(getOfficialWeights("villa")?.baseline).toEqual({
      salesComparison: 0.45,
      incomeCapitalization: 0.2,
      cost: 0.3,
      dcf: 0.05,
    });
    expect(getOfficialWeights("townhouse")?.baseline).toEqual({
      salesComparison: 0.45,
      incomeCapitalization: 0.25,
      cost: 0.25,
      dcf: 0.05,
    });
    expect(getOfficialWeights("office")?.baseline).toEqual({
      salesComparison: 0.4,
      incomeCapitalization: 0.45,
      cost: 0.1,
      dcf: 0.05,
    });
    expect(getOfficialWeights("retail")?.baseline).toEqual({
      salesComparison: 0.35,
      incomeCapitalization: 0.5,
      cost: 0.1,
      dcf: 0.05,
    });
    expect(getOfficialWeights("land")?.baseline).toEqual({
      salesComparison: 0.8,
      incomeCapitalization: 0,
      cost: 0,
      dcf: 0.2,
    });
    expect(getOfficialWeights("warehouse")).toBeUndefined();
  });

  it("documents only the existing method input contract and exposes no public DCF fields", () => {
    expect(
      getRequiredFieldsForMethod("salesComparison").map(field => field.key)
    ).toEqual(["district", "areaSqm", "eligibleComparableEvidence"]);
    expect(
      getRequiredFieldsForMethod("incomeCapitalization").map(field => field.key)
    ).toEqual(["annualRentAed"]);
    expect(getRequiredFieldsForMethod("cost").map(field => field.key)).toEqual([
      "replacementCostPerSqm",
      "depreciationFactor",
    ]);
    expect(
      getRequiredFieldsForMethod("dcf").every(
        field => field.publicInputStatus === "not-exposed"
      )
    ).toBe(true);
  });
});

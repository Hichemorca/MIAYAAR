import { describe, expect, it } from "vitest";
import type { ValuationReport } from "../../server/engines/reporting/valuation-report";
import { getCompletedValuationEvidenceContext } from "../../client/src/components/valuation-report-evidence-context";

const valuationResult = {
  result: {
    value: { amount: 1_250_000, currency: "AED" },
  },
};

function completedReport(
  evidenceStatus: "available" | "unavailable" = "available"
): ValuationReport {
  const search = {
    district: "BUSINESS BAY",
    propertyType: "apartment" as const,
    windowDays: 90,
    asOf: new Date("2026-08-20T00:00:00.000Z"),
  };

  return {
    status: evidenceStatus === "available" ? "completed" : "rejected",
    methodology: { documentId: "MIAYAAR-METH-001", version: "1.2" },
    property: {
      district: "BUSINESS BAY",
      propertyType: "apartment",
      areaSqm: 100,
      bedrooms: 1,
      yearBuilt: 2020,
      condition: "good",
      buildingCondition: "well_maintained",
      views: ["city"],
      finish: "normal",
      furnished: "unfurnished",
      floor: "mid",
      streetPosition: "secondary_street",
    },
    evidence:
      evidenceStatus === "available"
        ? { status: "available", comparables: [], search }
        : {
            status: "unavailable",
            reason: "insufficient_local_comparables",
            availableCount: 2,
            requiredCount: 5,
            search,
          },
    valuation: valuationResult as ValuationReport["valuation"],
    warnings: [],
  };
}

describe("completed valuation Evidence Integrity context", () => {
  it("uses the completed report's district, property type, and exact as-of date", () => {
    const report = completedReport();

    expect(getCompletedValuationEvidenceContext(report)).toEqual({
      district: "BUSINESS BAY",
      propertyType: "apartment",
      asOf: new Date("2026-08-20T00:00:00.000Z"),
    });
  });

  it("keeps a copy of the report's as-of date so the read-only panel cannot mutate the decision record", () => {
    const report = completedReport();
    const context = getCompletedValuationEvidenceContext(report);

    context.asOf.setUTCDate(21);

    expect(report.evidence.search.asOf.toISOString()).toBe(
      "2026-08-20T00:00:00.000Z"
    );
  });

  it("preserves the valuation output and supplies report context even when local evidence is unavailable", () => {
    const report = completedReport("unavailable");
    const originalValuation = report.valuation;

    const context = getCompletedValuationEvidenceContext(report);

    expect(context).toMatchObject({
      district: "BUSINESS BAY",
      propertyType: "apartment",
      asOf: new Date("2026-08-20T00:00:00.000Z"),
    });
    expect(report.valuation).toBe(originalValuation);
    expect(report.evidence.status).toBe("unavailable");
  });
});

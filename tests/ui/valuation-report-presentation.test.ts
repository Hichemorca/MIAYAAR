import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ValuationReport as ValuationReportData } from "../../server/engines/reporting/valuation-report";
import ValuationReport from "../../client/src/components/ValuationReport";

vi.mock("../../client/src/components/EvidenceIntegrityPanel", () => ({
  default: () =>
    createElement(
      "aside",
      { "data-testid": "evidence-integrity" },
      "Evidence Integrity"
    ),
}));

const report: ValuationReportData = {
  status: "completed",
  methodology: { documentId: "VALUATION-METHODOLOGY", version: "1.2" },
  property: {
    district: "BUSINESS BAY",
    propertyType: "apartment",
    areaSqm: 95,
  },
  evidence: {
    status: "available",
    search: {
      district: "BUSINESS BAY",
      propertyType: "apartment",
      windowDays: 90,
      asOf: new Date("2026-08-20T00:00:00.000Z"),
    },
    comparables: [
      {
        sourceTransactionId: "DLD-1001",
        transactionDate: new Date("2026-08-01T00:00:00.000Z"),
        district: "BUSINESS BAY",
        propertyType: "apartment",
        areaSqm: 95,
        salePriceAed: 1_250_000,
        pricePerSqm: 13_157.89,
        ageDays: 19,
        timeAdjustedPricePerSqm: 13_157.89,
      },
    ],
  },
  valuation: {
    result: {
      value: { amount: 1_250_000, currency: "AED" },
      lowerBound: { amount: 1_187_500, currency: "AED" },
      upperBound: { amount: 1_312_500, currency: "AED" },
      approachResults: [
        {
          approach: "market_comparison",
          value: { amount: 1_250_000, currency: "AED" },
          weight: 1,
          metadata: {},
        },
      ],
    },
  },
  confidence: {
    level: "high",
    basis: "valuation_range_width",
    rangeWidthPercent: 10,
    evidence: { comparableCount: 1, oldestComparableAgeDays: 19 },
    explanation:
      "The assessment is derived from the canonical valuation range.",
  },
  warnings: [],
};

describe("ValuationReport presentation", () => {
  it("renders only the server-authored confidence facts and decision trace", () => {
    const markup = renderToStaticMarkup(
      createElement(ValuationReport, {
        report,
        requestId: "request-123",
        resultSummary: "Server result",
      })
    );

    expect(markup).toContain("Confidence record");
    expect(markup).toContain("Server assessment");
    expect(markup).toContain("High");
    expect(markup).toContain("Valuation Range Width");
    expect(markup).toContain("10.0%");
    expect(markup).toContain("Oldest comparable");
    expect(markup).toContain("19 days");
    expect(markup).toContain("Decision trace");
    expect(markup).toContain("BUSINESS BAY");
    expect(markup).toContain("90-day window");
    expect(markup).toContain("Market Comparison");
    expect(markup).toContain("request request-123");
    expect(markup).not.toContain("Client-side confidence");
    expect(markup).not.toContain("synthetic valuation");
  });
});

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { getApplicableMethods } from "../../shared/valuation/method-applicability.policy";
import type { ValuationReport as ValuationReportData } from "../../server/engines/reporting/valuation-report";
import ValuationReport from "../../client/src/components/ValuationReport";
import {
  allValuationMethods,
  getMethodNotApplicableExplanation,
  getServerApproachLabel,
  propertyTypeChoices,
} from "../../client/src/pages/home-form-config";

vi.mock("../../client/src/components/EvidenceIntegrityPanel", () => ({
  default: () =>
    createElement(
      "aside",
      { "data-testid": "evidence-integrity" },
      "Evidence Integrity"
    ),
}));

vi.mock("../../client/src/components/MarketIntelligencePanel", () => ({
  default: () =>
    createElement(
      "aside",
      { "data-testid": "market-intelligence" },
      "Market Snapshot"
    ),
}));

vi.mock("../../client/src/components/ComparableSelectionPanel", () => ({
  default: () =>
    createElement(
      "aside",
      { "data-testid": "comparable-selection" },
      "Comparable Selection"
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
  it("renders the practical result sections using server-authored facts and assessments", () => {
    const markup = renderToStaticMarkup(
      createElement(ValuationReport, {
        report,
        requestId: "request-123",
        resultSummary: "Server result",
      })
    );

    expect(markup).toContain("Property summary");
    expect(markup).toContain("Applicable methods");
    expect(markup).toContain("Final valuation");
    expect(markup).toContain("Method results");
    expect(markup).toContain("Evidence and comparables");
    expect(markup).toContain("Data limitations");
    expect(markup).toContain("Confidence record");
    expect(markup).toContain("Server assessment");
    expect(markup).toContain("High");
    expect(markup).toContain("Valuation Range Width");
    expect(markup).toContain("10.0%");
    expect(markup).toContain("Oldest comparable");
    expect(markup).toContain("19 days");
    expect(markup).toContain("Decision trace");
    expect(markup).toContain("Market Snapshot");
    expect(markup).toContain("BUSINESS BAY");
    expect(markup).toContain("90-day window");
    expect(markup).toContain("Market Comparison");
    expect(markup).toContain("DLD-1001");
    expect(markup).toContain("FACT");
    expect(markup).toContain("ASSESSMENT");
    expect(markup).toContain("NOT_APPLICABLE");
    expect(markup).toContain(
      "Cost Approach is not applicable to Apartment under the governed method policy.",
    );
    expect(markup).toContain("request request-123");
    expect(markup).not.toContain("Client-side confidence");
    expect(markup).not.toContain("synthetic valuation");
  });

  it("renders policy-derived applicable and not-applicable methods for every governed property type", () => {
    propertyTypeChoices.forEach(({ value: propertyType }) => {
      const markup = renderToStaticMarkup(
        createElement(ValuationReport, {
          report: { ...report, property: { ...report.property, propertyType } },
          requestId: `request-${propertyType}`,
          resultSummary: "Server result",
        }),
      );
      const applicable = getApplicableMethods(propertyType);

      applicable.forEach(method => {
        expect(markup).toContain(getServerApproachLabel(method));
      });
      allValuationMethods
        .filter(method => !applicable.includes(method))
        .forEach(method => {
          expect(markup).toContain(getMethodNotApplicableExplanation(propertyType, method));
        });
    });
  });

  it("renders unavailable evidence without constructing a valuation, comparable, or confidence assessment", () => {
    const markup = renderToStaticMarkup(
      createElement(ValuationReport, {
        report: {
          ...report,
          status: "rejected",
          evidence: {
            status: "unavailable",
            search: report.evidence.search,
            availableCount: 2,
            requiredCount: 5,
          },
          valuation: undefined,
          confidence: undefined,
          warnings: ["Insufficient eligible local evidence."],
        },
        requestId: "request-unavailable",
        resultSummary: "Server result",
      }),
    );

    expect(markup).toContain("UNAVAILABLE");
    expect(markup).toContain("The server returned 2 eligible local records; the report requires 5.");
    expect(markup).toContain("Insufficient eligible local evidence.");
    expect(markup).not.toContain("Final valuation");
    expect(markup).not.toContain("DLD-1001");
    expect(markup).not.toContain("Server assessment");
  });
});

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { MarketIntelligenceBenchmark } from "../../contracts/market-intelligence.contracts";
import { MarketIntelligenceSnapshot } from "../../client/src/components/MarketIntelligencePanel";

const provenance = {
  source: "DLD" as const,
  policyVersion: "MI-v1.0" as const,
  asOf: new Date("2026-08-20T00:00:00.000Z"),
  filters: {
    district: "Business Bay",
    propertyType: "apartment" as const,
    source: "DLD" as const,
    evidenceStatus: "eligible" as const,
    from: new Date("2026-05-22T00:00:00.000Z"),
    asOf: new Date("2026-08-20T00:00:00.000Z"),
  },
  recordCount: 5,
  records: [
    {
      sourceTransactionId: "DLD-1001",
      sourceChecksum: "checksum-1001",
      transactionDate: new Date("2026-08-01T00:00:00.000Z"),
      ingestedAt: new Date("2026-08-02T00:00:00.000Z"),
    },
  ],
  sourceTransactionIds: ["DLD-1001"],
  sourceChecksums: ["checksum-1001"],
};

describe("MarketIntelligenceSnapshot presentation", () => {
  it("renders only the server-provided available DLD benchmark facts", () => {
    const benchmark: MarketIntelligenceBenchmark = {
      status: "available",
      statistics: {
        mean: 15_000,
        standardDeviation: 800,
        count: 5,
        min: 14_000,
        max: 16_000,
      },
      provenance,
    };

    const markup = renderToStaticMarkup(
      createElement(MarketIntelligenceSnapshot, { benchmark, state: "ready" })
    );

    expect(markup).toContain("Market available");
    expect(markup).toContain("Sample size");
    expect(markup).toContain("5 eligible transactions");
    expect(markup).toContain("Data quality");
    expect(markup).toContain("Eligible DLD evidence");
    expect(markup).toContain("Market confidence");
    expect(markup).toContain("UNAVAILABLE — not produced by MI-v1.0");
    expect(markup).toContain("Mean price / sqm");
    expect(markup).toContain("Source and provenance");
    expect(markup).toContain("DLD-1001");
    expect(markup).toContain("FACT");
    expect(markup).not.toContain("valuation adjustment");
    expect(markup).not.toContain("diagnostic result");
  });

  it("renders the governed unavailable state without a synthetic benchmark", () => {
    const benchmark: MarketIntelligenceBenchmark = {
      status: "unavailable",
      reason: "insufficient_benchmark_evidence",
      requiredCount: 5,
      provenance: { ...provenance, recordCount: 2, records: [] },
    };

    const markup = renderToStaticMarkup(
      createElement(MarketIntelligenceSnapshot, { benchmark, state: "ready" })
    );

    expect(markup).toContain("Market unavailable");
    expect(markup).toContain("UNAVAILABLE");
    expect(markup).toContain("2 eligible DLD transactions");
    expect(markup).toContain("MI-v1.0 requires 5");
    expect(markup).toContain("No fallback was used.");
    expect(markup).not.toContain("Mean price / sqm");
    expect(markup).not.toContain("synthetic");
  });

  it("renders a server failure as unavailable rather than fabricating a snapshot", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketIntelligenceSnapshot, { state: "error" })
    );

    expect(markup).toContain("Market Snapshot Unavailable");
    expect(markup).toContain("UNAVAILABLE");
    expect(markup).toContain(
      "No market value, confidence, or diagnostic result is shown."
    );
  });
});
